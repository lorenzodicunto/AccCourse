"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEditorStore, CourseProject } from "@/store/useEditorStore";
import { getCourse } from "@/actions/courses";
import { TopToolbar } from "@/components/editor/TopToolbar";
import { SlideNavigator } from "@/components/editor/SlideNavigator";
import { Canvas } from "@/components/editor/Canvas";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { Loader2 } from "lucide-react";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const hydrateProject = useEditorStore((s) => s.hydrateProject);
  const setCurrentProject = useEditorStore((s) => s.setCurrentProject);
  const setCurrentSlide = useEditorStore((s) => s.setCurrentSlide);
  const projects = useEditorStore((s) => s.projects);

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

        // Parse courseData safely
        let projectData: CourseProject;
        try {
          projectData = JSON.parse(course.courseData) as CourseProject;
          // Ensure the project ID matches the DB record ID
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
    return () => { cancelled = true; };
  }, [courseId, hydrateProject, setCurrentProject, setCurrentSlide]);

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
    </div>
  );
}
