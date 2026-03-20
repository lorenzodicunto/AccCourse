"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEditorStore, createDefaultProject } from "@/store/useEditorStore";
import { getUserCourses, createCourse } from "@/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CookieConsent } from "@/components/dashboard/CookieConsent";
import {
  GraduationCap,
  Search,
  LayoutGrid,
  Plus,
  Loader2,
  Shield,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

type CourseRow = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  updatedAt: Date;
  author: { name: string; email: string };
  tenant: { name: string } | null;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await getUserCourses();
      setCourses(data as CourseRow[]);
    } catch {
      toast.error("Erro ao carregar cursos.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const project = createDefaultProject("Novo Curso", "");
      const courseData = JSON.stringify(project);
      const result = await createCourse(
        project.title,
        project.description,
        project.thumbnail,
        courseData
      );
      toast.success("Curso criado com sucesso!");
      router.push(`/editor/${result.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao criar curso."
      );
      setCreating(false);
    }
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  const isAdmin = session?.user?.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary shadow-lg shadow-primary/25">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                AccCourse
              </h1>
              <p className="text-[11px] text-muted-foreground leading-none -mt-0.5">
                Plataforma Enterprise E-Learning
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl border-red-200 text-red-700 hover:bg-red-50"
                onClick={() => router.push("/admin")}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            )}
            <Button
              className="gap-2 rounded-xl bg-primary shadow-lg shadow-primary/25"
              size="sm"
              onClick={handleCreateCourse}
              disabled={creating}
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {creating ? "Criando..." : "Novo Curso"}
            </Button>

            {/* User info + Logout */}
            <div className="flex items-center gap-2 ml-2 pl-3 border-l border-border/50">
              <div className="text-right">
                <p className="text-xs font-medium text-foreground">
                  {session?.user?.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg"
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Meus Cursos
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {loading
                ? "Carregando..."
                : courses.length === 0
                  ? "Comece criando seu primeiro curso"
                  : `${courses.length} curso${courses.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Search */}
          {courses.length > 0 && (
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-xl bg-muted/50 border-0 focus-visible:bg-white focus-visible:ring-1"
              />
            </div>
          )}
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <button
                key={course.id}
                onClick={() => router.push(`/editor/${course.id}`)}
                className="group text-left bg-white rounded-2xl border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-200 overflow-hidden cursor-pointer"
              >
                {/* Thumbnail */}
                <div
                  className="h-36 w-full"
                  style={{ background: course.thumbnail || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
                />
                {/* Info */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Atualizado {new Date(course.updatedAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : courses.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24">
            <div className="flex items-center justify-center h-20 w-20 rounded-3xl bg-primary/10 mb-6">
              <LayoutGrid className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhum curso criado ainda
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-8">
              Crie seu primeiro curso interativo e-learning com nosso editor
              visual drag-and-drop. Exporte para SCORM 1.2 com um clique.
            </p>
            <Button
              className="gap-2 rounded-xl"
              onClick={handleCreateCourse}
              disabled={creating}
            >
              <Plus className="h-4 w-4" />
              Criar Primeiro Curso
            </Button>
          </div>
        ) : (
          /* No results */
          <div className="flex flex-col items-center justify-center py-24">
            <Search className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Nenhum resultado encontrado
            </h3>
            <p className="text-muted-foreground text-sm">
              Tente buscar com outros termos
            </p>
          </div>
        )}
      </main>

      {/* Cookie Consent Banner (LGPD) */}
      <CookieConsent />
    </div>
  );
}
