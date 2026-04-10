"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEditorStore, CourseProject, Block, Slide } from "@/store/useEditorStore";
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
  const selectedBlockIds = useEditorStore((s) => s.selectedBlockIds);
  const deleteBlocks = useEditorStore((s) => s.deleteBlocks);
  const duplicateBlocks = useEditorStore((s) => s.duplicateBlocks);
  const updateBlocks = useEditorStore((s) => s.updateBlocks);
  const getCurrentProject = useEditorStore((s) => s.getCurrentProject);
  const getCurrentSlide = useEditorStore((s) => s.getCurrentSlide);
  const getSelectedBlocks = useEditorStore((s) => s.getSelectedBlocks);
  const duplicateSlide = useEditorStore((s) => s.duplicateSlide);
  const deleteSlide = useEditorStore((s) => s.deleteSlide);
  const insertSlideContextual = useEditorStore((s) => s.insertSlideContextual);
  const addBlocks = useEditorStore((s) => s.addBlocks);
  const selectAllBlocks = useEditorStore((s) => s.selectAllBlocks);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [componentLibOpen, setComponentLibOpen] = useState(false);

  // ─── Clipboard (internal, no browser API needed) ───
  const clipboardRef = useRef<Block[]>([]);
  const clipboardSlideRef = useRef<Slide | null>(null);

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
          // PostgreSQL Json: Prisma returns an object directly
          projectData = (typeof course.courseData === 'string'
            ? JSON.parse(course.courseData)
            : course.courseData) as CourseProject;
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

      // Ctrl+A — Select All
      if (isCtrl && e.key === "a") {
        e.preventDefault();
        const project = getCurrentProject();
        const slide = getCurrentSlide();
        if (project && slide) {
          selectAllBlocks(project.id, slide.id);
        }
        return;
      }

      // Delete/Backspace — Delete selected blocks
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        !isCtrl &&
        selectedBlockIds.length > 0
      ) {
        e.preventDefault();
        const project = getCurrentProject();
        const slide = getCurrentSlide();
        if (project && slide) {
          deleteBlocks(project.id, slide.id, selectedBlockIds);
        }
        return;
      }

      // Ctrl+C — Copy blocks or slide
      if (isCtrl && e.key === "c") {
        if (selectedBlockIds.length > 0) {
          e.preventDefault();
          const blocks = getSelectedBlocks();
          if (blocks.length > 0) {
            clipboardRef.current = JSON.parse(JSON.stringify(blocks));
            clipboardSlideRef.current = null;
            toast.success(blocks.length > 1 ? `${blocks.length} blocos copiados!` : "Bloco copiado!");
          }
        } else {
          e.preventDefault();
          const slide = getCurrentSlide();
          if (slide) {
            clipboardSlideRef.current = JSON.parse(JSON.stringify(slide));
            clipboardRef.current = [];
            toast.success("Slide copiado!");
          }
        }
        return;
      }

      // Ctrl+X — Cut blocks or slide
      if (isCtrl && e.key === "x") {
        if (selectedBlockIds.length > 0) {
          e.preventDefault();
          const blocks = getSelectedBlocks();
          const project = getCurrentProject();
          const slide = getCurrentSlide();
          if (blocks.length > 0 && project && slide) {
            clipboardRef.current = JSON.parse(JSON.stringify(blocks));
            clipboardSlideRef.current = null;
            deleteBlocks(project.id, slide.id, selectedBlockIds);
            toast.success(blocks.length > 1 ? `${blocks.length} blocos recortados!` : "Bloco recortado!");
          }
        } else {
          e.preventDefault();
          const project = getCurrentProject();
          const slide = getCurrentSlide();
          if (project && slide && project.slides.length > 1) {
            clipboardSlideRef.current = JSON.parse(JSON.stringify(slide));
            clipboardRef.current = [];
            deleteSlide(project.id, slide.id);
            toast.success("Slide recortado!");
          } else if (project?.slides.length === 1) {
            toast.error("Não é possível recortar o último slide do curso.");
          }
        }
        return;
      }

      // Ctrl+V — Paste blocks or slide
      if (isCtrl && e.key === "v") {
        const project = getCurrentProject();
        const slide = getCurrentSlide();
        
        if (clipboardRef.current.length > 0 && project && slide) {
          e.preventDefault();
          const newBlocks: Block[] = clipboardRef.current.map((clipboardBlock) => ({
            ...clipboardBlock,
            id: crypto.randomUUID(),
            x: Math.min(clipboardBlock.x + 20, 960 - clipboardBlock.width),
            y: Math.min(clipboardBlock.y + 20, 540 - clipboardBlock.height),
          }));
          addBlocks(project.id, slide.id, newBlocks);
          toast.success(newBlocks.length > 1 ? `${newBlocks.length} blocos colados!` : "Bloco colado!");
          return;
        } else if (clipboardSlideRef.current && project && slide) {
          e.preventDefault();
          insertSlideContextual(project.id, clipboardSlideRef.current, slide.id);
          toast.success("Slide colado!");
          return;
        }
      }

      // Ctrl+D — Duplicate blocks or slide
      if (isCtrl && e.key === "d") {
        e.preventDefault();
        const project = getCurrentProject();
        const slide = getCurrentSlide();
        if (project && slide) {
          if (selectedBlockIds.length > 0) {
            duplicateBlocks(project.id, slide.id, selectedBlockIds);
            toast.success(selectedBlockIds.length > 1 ? `${selectedBlockIds.length} blocos duplicados!` : "Bloco duplicado!");
          } else {
            duplicateSlide(project.id, slide.id);
            toast.success("Slide duplicado!");
          }
        }
        return;
      }

      // Z-Index Shortcuts (PowerPoint style)
      if (isCtrl && selectedBlockIds.length > 0) {
        const project = getCurrentProject();
        const slide = getCurrentSlide();
        const blocks = getSelectedBlocks();
        
        if (project && slide && blocks.length > 0) {
          let zIndexChange = false;
          let newUpdates: { id: string; changes: Partial<Block> }[] = [];
          
          if (e.shiftKey && e.key === "]") { // Trazer para o primeiro plano
            e.preventDefault();
            const maxZ = Math.max(...slide.blocks.map(b => b.zIndex || 0));
            newUpdates = blocks.map(b => ({ id: b.id, changes: { zIndex: maxZ + 1 } }));
            zIndexChange = true;
          } else if (e.shiftKey && e.key === "[") { // Enviar para o fundo
            e.preventDefault();
            newUpdates = blocks.map(b => ({ id: b.id, changes: { zIndex: 0 } }));
            zIndexChange = true;
          } else if (e.key === "]") { // Avançar
            e.preventDefault();
            newUpdates = blocks.map(b => ({ id: b.id, changes: { zIndex: (b.zIndex || 0) + 1 } }));
            zIndexChange = true;
          } else if (e.key === "[") { // Recuar
            e.preventDefault();
            newUpdates = blocks.map(b => ({ id: b.id, changes: { zIndex: Math.max(0, (b.zIndex || 0) - 1) } }));
            zIndexChange = true;
          }
          
          if (zIndexChange) {
            updateBlocks(project.id, slide.id, newUpdates);
            return;
          }
        }
      }

      // Arrow keys — Move selected blocks (1px, 10px with Shift)
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) &&
        selectedBlockIds.length > 0
      ) {
        e.preventDefault();
        const project = getCurrentProject();
        const slide = getCurrentSlide();
        const blocks = getSelectedBlocks();
        if (!project || !slide || blocks.length === 0) return;

        const step = e.shiftKey ? 10 : 1;
        let dx = 0, dy = 0;
        if (e.key === "ArrowUp") dy = -step;
        if (e.key === "ArrowDown") dy = step;
        if (e.key === "ArrowLeft") dx = -step;
        if (e.key === "ArrowRight") dx = step;

        const updates = blocks.map(block => ({
          id: block.id,
          changes: {
            x: Math.max(0, Math.min(960 - block.width, block.x + dx)),
            y: Math.max(0, Math.min(540 - block.height, block.y + dy)),
          }
        }));

        updateBlocks(project.id, slide.id, updates);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    undo,
    redo,
    selectedBlockIds,
    deleteBlocks,
    duplicateBlocks,
    updateBlocks,
    getCurrentProject,
    getCurrentSlide,
    getSelectedBlocks,
    selectAllBlocks,
    setSelectedBlock,
    addBlocks,
    courseId,
    duplicateSlide,
    doSave,
  ]);

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#F8FAFC' }}>
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
      <div className="h-screen flex flex-col items-center justify-center" style={{ background: '#F8FAFC' }}>
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Carregando curso...</p>
      </div>
    );
  }

  const project = projects.find((p) => p.id === courseId);
  if (!project) return null;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#F8FAFC' }}>
      <TopToolbar courseId={courseId} onToggleComponentLib={() => setComponentLibOpen(!componentLibOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <SlideNavigator />
        <div role="main" aria-label="Área de edição do curso" className="flex-1 overflow-hidden">
          <Canvas />
        </div>
        <PropertiesPanel />
      </div>
      <StatusBar saveStatus={saveStatus} lastSavedAt={lastSavedAt} />
      <ComponentLibrarySidebar open={componentLibOpen} onClose={() => setComponentLibOpen(false)} />
    </div>
  );
}
