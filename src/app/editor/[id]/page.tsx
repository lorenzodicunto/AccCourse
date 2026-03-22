"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEditorStore, CourseProject } from "@/store/useEditorStore";
import { getCourse } from "@/actions/courses";
import { saveCourse } from "@/actions/courses";
import { TopToolbar } from "@/components/editor/TopToolbar";
import { SlideNavigator } from "@/components/editor/SlideNavigator";
import { Canvas } from "@/components/editor/Canvas";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { StatusBar } from "@/components/editor/StatusBar";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const hydrateProject = useEditorStore((s) => s.hydrateProject);
  const setCurrentProject = useEditorStore((s) => s.setCurrentProject);
  const setCurrentSlide = useEditorStore((s) => s.setCurrentSlide);
  const projects = useEditorStore((s) => s.projects);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const deleteBlock = useEditorStore((s) => s.deleteBlock);
  const getCurrentProject = useEditorStore((s) => s.getCurrentProject);
  const getCurrentSlide = useEditorStore((s) => s.getCurrentSlide);
  const duplicateSlide = useEditorStore((s) => s.duplicateSlide);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // ─── Keyboard Shortcuts ───
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;

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

      // Delete/Backspace — Delete selected block
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        !isCtrl &&
        selectedBlockId
      ) {
        // Don't delete when editing text
        const active = document.activeElement;
        if (
          active &&
          (active.tagName === "INPUT" ||
            active.tagName === "TEXTAREA" ||
            (active as HTMLElement).contentEditable === "true")
        ) {
          return;
        }
        e.preventDefault();
        const project = getCurrentProject();
        const slide = getCurrentSlide();
        if (project && slide) {
          deleteBlock(project.id, slide.id, selectedBlockId);
        }
        return;
      }

      // Ctrl+S — Save to cloud
      if (isCtrl && e.key === "s") {
        e.preventDefault();
        const project = getCurrentProject();
        if (project && courseId) {
          const courseData = JSON.stringify(project);
          saveCourse(courseId, courseData)
            .then(() => toast.success("Curso salvo!"))
            .catch(() => toast.error("Erro ao salvar."));
        }
        return;
      }

      // Ctrl+D — Duplicate current slide
      if (isCtrl && e.key === "d") {
        e.preventDefault();
        const project = getCurrentProject();
        const slide = getCurrentSlide();
        if (project && slide) {
          duplicateSlide(project.id, slide.id);
          toast.success("Slide duplicado!");
        }
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
    getCurrentProject,
    getCurrentSlide,
    courseId,
    duplicateSlide,
  ]);

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-50 gap-4">
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
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Carregando curso...</p>
      </div>
    );
  }

  const project = projects.find((p) => p.id === courseId);
  if (!project) return null;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-zinc-50">
      <TopToolbar courseId={courseId} />
      <div className="flex flex-1 overflow-hidden">
        <SlideNavigator />
        <Canvas />
        <PropertiesPanel />
      </div>
      <StatusBar />
    </div>
  );
}
