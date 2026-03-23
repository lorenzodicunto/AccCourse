"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEditorStore, CourseProject, Block } from "@/store/useEditorStore";
import { getCourse } from "@/actions/courses";
import { saveCourse } from "@/actions/courses";
import { TopToolbar } from "@/components/editor/TopToolbar";
import { SlideNavigator } from "@/components/editor/SlideNavigator";
import { Canvas } from "@/components/editor/Canvas";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { StatusBar } from "@/components/editor/StatusBar";
import { ComponentLibrarySidebar } from "@/components/editor/ComponentLibrarySidebar";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const hydrateProject = useEditorStore((s) => s.hydrateProject);
  const setCurrentProject = useEditorStore((s) => s.setCurrentProject);
  const setCurrentSlide = useEditorStore((s) => s.setCurrentSlide);
  const setSelectedBlock = useEditorStore((s) => s.setSelectedBlock);
  const projects = useEditorStore((s) => s.projects);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const deleteBlock = useEditorStore((s) => s.deleteBlock);
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const getCurrentProject = useEditorStore((s) => s.getCurrentProject);
  const getCurrentSlide = useEditorStore((s) => s.getCurrentSlide);
  const getSelectedBlock = useEditorStore((s) => s.getSelectedBlock);
  const duplicateSlide = useEditorStore((s) => s.duplicateSlide);
  const addBlock = useEditorStore((s) => s.addBlock);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [componentLibOpen, setComponentLibOpen] = useState(false);

  // ─── Clipboard (internal, no browser API needed) ───
  const clipboardRef = useRef<Block | null>(null);

  // ─── Load Course ───
  useEffect(() => {
    let cancelled = false;

    async function loadCourse() {
      try {
        const course = await getCourse(courseId);
        if (cancelled) return;
        if (!course) {
          setError("Curso não encontrado.");
          return;
        }

        let projectData: CourseProject;
        try {
          projectData = JSON.parse(course.courseData) as CourseProject;
          projectData.id = course.id;
        } catch {
          setError("Dados do curso corrompidos.");
          return;
        }

        hydrateProject(projectData);
        setCurrentProject(projectData.id);
        if (projectData.slides?.length > 0) {
          setCurrentSlide(projectData.slides[0].id);
        }
        setLoading(false);
      } catch {
        if (!cancelled) setError("Erro ao carregar curso.");
      }
    }

    loadCourse();
    return () => {
      cancelled = true;
    };
  }, [courseId, hydrateProject, setCurrentProject, setCurrentSlide]);

  // ─── Auto-Save (debounce 3s) ───
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(true);

  const doSave = useCallback(async () => {
    const project = getCurrentProject();
    if (!project || !courseId) return;

    setSaveStatus("saving");
    try {
      const courseData = JSON.stringify(project);
      await saveCourse(courseId, courseData, {
        title: project.title,
        description: project.description,
        thumbnail: project.thumbnail,
      });
      setSaveStatus("saved");
      setLastSavedAt(new Date());
    } catch {
      setSaveStatus("error");
    }
  }, [courseId, getCurrentProject]);

  useEffect(() => {
    // Skip initial load (hydration triggers projects change)
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }
    if (loading) return;

    setSaveStatus("unsaved");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      doSave();
    }, 3000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [projects, loading, doSave]);

  // ─── Keyboard Shortcuts ───
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      // Don't intercept when typing in inputs
      const active = document.activeElement;
      const isTyping =
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.tagName === "SELECT" ||
          (active as HTMLElement).contentEditable === "true");

      // Ctrl+Z — Undo
      if (isCtrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+Y or Ctrl+Shift+Z — Redo
      if (
        (isCtrl && e.key === "y") ||
        (isCtrl && e.key === "z" && e.shiftKey)
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Ctrl+S — Save to cloud
      if (isCtrl && e.key === "s") {
        e.preventDefault();
        doSave().then(() => toast.success("Curso salvo!"));
        return;
      }

      // Escape — Deselect block
      if (e.key === "Escape") {
        setSelectedBlock(null);
        return;
      }

      // Don't handle remaining shortcuts when typing
      if (isTyping) return;

      // Delete/Backspace — Delete selected block
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        !isCtrl &&
        selectedBlockId
      ) {
        e.preventDefault();
        const project = getCurrentProject();
        const slide = getCurrentSlide();
        if (project && slide) {
          deleteBlock(project.id, slide.id, selectedBlockId);
        }
        return;
      }

      // Ctrl+C — Copy block
      if (isCtrl && e.key === "c" && selectedBlockId) {
        e.preventDefault();
        const block = getSelectedBlock();
        if (block) {
          clipboardRef.current = JSON.parse(JSON.stringify(block));
          toast.success("Bloco copiado!");
        }
        return;
      }

      // Ctrl+X — Cut block
      if (isCtrl && e.key === "x" && selectedBlockId) {
        e.preventDefault();
        const block = getSelectedBlock();
        const project = getCurrentProject();
        const slide = getCurrentSlide();
        if (block && project && slide) {
          clipboardRef.current = JSON.parse(JSON.stringify(block));
          deleteBlock(project.id, slide.id, selectedBlockId);
          toast.success("Bloco recortado!");
        }
        return;
      }

      // Ctrl+V — Paste block
      if (isCtrl && e.key === "v" && clipboardRef.current) {
        e.preventDefault();
        const project = getCurrentProject();
        const slide = getCurrentSlide();
        if (project && slide) {
          const newBlock: Block = {
            ...clipboardRef.current,
            id: crypto.randomUUID(),
            x: Math.min(clipboardRef.current.x + 20, 960 - clipboardRef.current.width),
            y: Math.min(clipboardRef.current.y + 20, 540 - clipboardRef.current.height),
          };
          addBlock(project.id, slide.id, newBlock);
          setSelectedBlock(newBlock.id);
          toast.success("Bloco colado!");
        }
        return;
      }

      // Ctrl+D — Duplicate block or slide
      if (isCtrl && e.key === "d") {
        e.preventDefault();
        const project = getCurrentProject();
        const slide = getCurrentSlide();
        if (project && slide) {
          if (selectedBlockId) {
            duplicateBlock(project.id, slide.id, selectedBlockId);
            toast.success("Bloco duplicado!");
          } else {
            duplicateSlide(project.id, slide.id);
            toast.success("Slide duplicado!");
          }
        }
        return;
      }

      // Arrow keys — Move selected block (1px, 10px with Shift)
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) &&
        selectedBlockId
      ) {
        e.preventDefault();
        const project = getCurrentProject();
        const slide = getCurrentSlide();
        const block = getSelectedBlock();
        if (!project || !slide || !block) return;

        const step = e.shiftKey ? 10 : 1;
        let dx = 0, dy = 0;
        if (e.key === "ArrowUp") dy = -step;
        if (e.key === "ArrowDown") dy = step;
        if (e.key === "ArrowLeft") dx = -step;
        if (e.key === "ArrowRight") dx = step;

        updateBlock(project.id, slide.id, selectedBlockId, {
          x: Math.max(0, Math.min(960 - block.width, block.x + dx)),
          y: Math.max(0, Math.min(540 - block.height, block.y + dy)),
        });
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    undo,
    redo,
    selectedBlockId,
    deleteBlock,
    duplicateBlock,
    updateBlock,
    getCurrentProject,
    getCurrentSlide,
    getSelectedBlock,
    setSelectedBlock,
    addBlock,
    courseId,
    duplicateSlide,
    doSave,
  ]);

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#0F172A' }}>
        <p className="text-sm text-red-500 font-medium">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="text-sm text-primary underline"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center" style={{ background: '#0F172A' }}>
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Carregando curso...</p>
      </div>
    );
  }

  const project = projects.find((p) => p.id === courseId);
  if (!project) return null;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#0F172A' }}>
      <TopToolbar courseId={courseId} onToggleComponentLib={() => setComponentLibOpen(!componentLibOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <SlideNavigator />
        <Canvas />
        <PropertiesPanel />
      </div>
      <StatusBar saveStatus={saveStatus} lastSavedAt={lastSavedAt} />
      <ComponentLibrarySidebar open={componentLibOpen} onClose={() => setComponentLibOpen(false)} />
    </div>
  );
}
