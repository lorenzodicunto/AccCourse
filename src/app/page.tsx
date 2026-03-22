"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createDefaultProject } from "@/store/useEditorStore";
import { getUserCourses, createCourse, deleteCourse } from "@/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CookieConsent } from "@/components/dashboard/CookieConsent";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GraduationCap,
  Search,
  LayoutGrid,
  Plus,
  Loader2,
  Shield,
  LogOut,
  Pencil,
  Copy,
  Trash2,
  MoreVertical,
  Layers,
  Type,
  Image as ImageIcon,
  HelpCircle,
  CreditCard,
  Play,
} from "lucide-react";
import { toast } from "sonner";

type CourseRow = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  courseData: string | null;
  updatedAt: Date;
  author: { name: string; email: string };
  tenant: { name: string } | null;
};

// Parse courseData to extract first slide info
function getFirstSlidePreview(courseData: string | null): {
  background: string;
  blocks: { type: string; x: number; y: number; width: number; height: number; content?: string; color?: string; fontSize?: number }[];
  slideCount: number;
} | null {
  if (!courseData) return null;
  try {
    const project = JSON.parse(courseData);
    if (!project.slides || project.slides.length === 0) return null;
    const firstSlide = project.slides[0];
    return {
      background: firstSlide.background || "#ffffff",
      blocks: (firstSlide.blocks || []).map((b: Record<string, unknown>) => ({
        type: b.type,
        x: b.x,
        y: b.y,
        width: b.width,
        height: b.height,
        content: b.content,
        color: b.color,
        fontSize: b.fontSize,
      })),
      slideCount: project.slides.length,
    };
  } catch {
    return null;
  }
}

// Mini block icon for the preview
function MiniBlockIcon({ type }: { type: string }) {
  const cls = "h-full w-full";
  switch (type) {
    case "text":
      return <Type className={cls} />;
    case "image":
      return <ImageIcon className={cls} />;
    case "quiz":
      return <HelpCircle className={cls} />;
    case "flashcard":
      return <CreditCard className={cls} />;
    case "video":
      return <Play className={cls} />;
    default:
      return <Layers className={cls} />;
  }
}

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

  const handleDuplicate = async (course: CourseRow) => {
    try {
      const result = await createCourse(
        `${course.title} (cópia)`,
        course.description,
        course.thumbnail,
        course.courseData || ""
      );
      toast.success("Curso duplicado com sucesso!");
      loadCourses();
    } catch {
      toast.error("Erro ao duplicar.");
    }
  };

  const handleDelete = async (course: CourseRow) => {
    if (!confirm(`Tem certeza que deseja excluir "${course.title}"?`)) return;
    try {
      await deleteCourse(course.id);
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
      toast.success("Curso excluído.");
    } catch {
      toast.error("Erro ao excluir.");
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
            {filteredCourses.map((course) => {
              const slidePreview = getFirstSlidePreview(course.courseData);
              return (
                <div
                  key={course.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Thumbnail / Slide Preview */}
                  <button
                    onClick={() => router.push(`/editor/${course.id}`)}
                    className="relative h-40 w-full overflow-hidden cursor-pointer"
                  >
                    {slidePreview ? (
                      /* Mini slide preview */
                      <div
                        className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundColor: slidePreview.background }}
                      >
                        {/* Render mini blocks */}
                        {slidePreview.blocks.map((block, i) => (
                          <div
                            key={i}
                            className="absolute flex items-center justify-center"
                            style={{
                              left: `${(block.x / 960) * 100}%`,
                              top: `${(block.y / 540) * 100}%`,
                              width: `${(block.width / 960) * 100}%`,
                              height: `${(block.height / 540) * 100}%`,
                            }}
                          >
                            {block.type === "text" && block.content ? (
                              <div
                                className="w-full h-full overflow-hidden px-1"
                                style={{
                                  fontSize: `${Math.max(((block.fontSize || 16) / 540) * 160, 5)}px`,
                                  color: block.color || "#000",
                                  lineHeight: 1.3,
                                }}
                                dangerouslySetInnerHTML={{
                                  __html: block.content.replace(/<[^>]*>/g, (tag) =>
                                    tag.replace(/font-size:[^;"]+;?/g, "")
                                  ),
                                }}
                              />
                            ) : (
                              <div className="w-full h-full rounded-sm bg-muted/30 flex items-center justify-center">
                                <div className="h-3 w-3 text-muted-foreground/40">
                                  <MiniBlockIcon type={block.type} />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Empty slide indicator */}
                        {slidePreview.blocks.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-xs text-muted-foreground/30 font-medium">
                              Slide vazio
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Fallback gradient */
                      <div
                        className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                        style={{
                          background:
                            course.thumbnail ||
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

                    {/* Slide count badge */}
                    <div className="absolute bottom-2 left-2">
                      <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[10px] font-medium px-2 py-1 rounded-md shadow-sm">
                        <Layers className="h-3 w-3" />
                        {slidePreview?.slideCount ?? 1} slide
                        {(slidePreview?.slideCount ?? 1) !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </button>

                  {/* Floating action buttons on hover */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => router.push(`/editor/${course.id}`)}
                      className="p-1.5 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5 text-foreground" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(course)}
                      className="p-1.5 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-colors cursor-pointer"
                      title="Duplicar"
                    >
                      <Copy className="h-3.5 w-3.5 text-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(course)}
                      className="p-1.5 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm hover:bg-red-50 transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-600" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        onClick={() => router.push(`/editor/${course.id}`)}
                        className="text-left flex-1 cursor-pointer"
                      >
                        <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                      </button>

                      {/* Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 cursor-pointer" />
                          }
                        >
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                          <DropdownMenuItem
                            onClick={() => router.push(`/editor/${course.id}`)}
                            className="gap-2 cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(course)}
                            className="gap-2 cursor-pointer"
                          >
                            <Copy className="h-4 w-4" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(course)}
                            className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Date */}
                    <p className="text-xs text-muted-foreground mt-2">
                      Atualizado{" "}
                      {new Date(course.updatedAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
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
