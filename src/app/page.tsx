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
  Bell,
  BookOpen,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

type CourseRow = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  courseData: unknown;
  updatedAt: Date;
  author: { name: string; email: string };
  tenant: { name: string } | null;
};

// Parse courseData to extract first slide info
function getFirstSlidePreview(courseData: unknown): {
  background: string;
  blocks: { type: string; x: number; y: number; width: number; height: number; content?: string; color?: string; fontSize?: number }[];
  slideCount: number;
} | null {
  if (!courseData) return null;
  try {
    // PostgreSQL Json: Prisma may return object directly
    const project = typeof courseData === 'string' ? JSON.parse(courseData) : courseData;
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
      await createCourse(
        `${course.title} (cópia)`,
        course.description,
        course.thumbnail,
        typeof course.courseData === 'string' ? course.courseData : JSON.stringify(course.courseData || {})
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

  // Stats
  const totalCourses = courses.length;
  const totalSlides = courses.reduce((sum, c) => {
    const preview = getFirstSlidePreview(c.courseData);
    return sum + (preview?.slideCount || 1);
  }, 0);

  return (
    <div className="min-h-screen" style={{ background: '#0F172A' }}>
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-8 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 70%)' }}
        />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-8 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)' }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5"
        style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(16px)' }}
      >
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', boxShadow: '0 4px 20px rgba(124, 58, 237, 0.3)' }}
            >
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                AccCourse
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md text-purple-300"
                  style={{ background: 'rgba(124, 58, 237, 0.2)' }}
                >
                  2.0
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 leading-none -mt-0.5">
                Plataforma Enterprise E-Learning
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 bg-transparent cursor-pointer"
                onClick={() => router.push("/admin")}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            )}

            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white cursor-pointer">
              <Bell className="h-5 w-5" />
            </button>

            <Button
              className="gap-2 rounded-xl text-white shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all cursor-pointer"
              size="sm"
              onClick={handleCreateCourse}
              disabled={creating}
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {creating ? "Criando..." : "Novo Curso"}
            </Button>

            {/* User info + Logout */}
            <div className="flex items-center gap-2 ml-1 pl-3 border-l border-white/10">
              <div className="flex items-center justify-center h-8 w-8 rounded-full text-xs font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)' }}
              >
                {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-white">
                  {session?.user?.name}
                </p>
                <p className="text-[10px] text-slate-500">
                  {session?.user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
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
      <main className="relative mx-auto max-w-7xl px-6 py-8">
        {/* Stats Cards — only show if there are courses */}
        {!loading && courses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-fade-in">
            <div className="glass-card rounded-xl p-4 flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg" style={{ background: 'rgba(124, 58, 237, 0.15)' }}>
                <BookOpen className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalCourses}</p>
                <p className="text-xs text-slate-400">Cursos Criados</p>
              </div>
            </div>
            <div className="glass-card rounded-xl p-4 flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                <Layers className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalSlides}</p>
                <p className="text-xs text-slate-400">Total de Slides</p>
              </div>
            </div>
            <div className="glass-card rounded-xl p-4 flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalCourses}</p>
                <p className="text-xs text-slate-400">Publicados</p>
              </div>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Meus Cursos
            </h2>
            <p className="text-sm text-slate-400 mt-1">
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Buscar cursos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500/30 focus:bg-white/8"
              />
            </div>
          )}
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCourses.map((course) => {
              const slidePreview = getFirstSlidePreview(course.courseData);
              return (
                <div
                  key={course.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 transition-all duration-300 hover:border-purple-500/30 cursor-pointer animate-fade-in"
                  style={{ background: '#1E293B' }}
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ boxShadow: '0 0 40px rgba(124, 58, 237, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)' }}
                  />

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
                              <div className="w-full h-full rounded-sm bg-slate-200/30 flex items-center justify-center">
                                <div className="h-3 w-3 text-slate-400/40">
                                  <MiniBlockIcon type={block.type} />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Empty slide indicator */}
                        {slidePreview.blocks.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-xs text-slate-400/30 font-medium">
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
                            "linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)",
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                    {/* Slide count badge */}
                    <div className="absolute bottom-2 left-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md shadow-sm"
                        style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
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
                      className="p-1.5 rounded-lg shadow-sm hover:bg-white/20 transition-colors cursor-pointer"
                      title="Editar"
                      style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <Pencil className="h-3.5 w-3.5 text-white" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(course)}
                      className="p-1.5 rounded-lg shadow-sm hover:bg-white/20 transition-colors cursor-pointer"
                      title="Duplicar"
                      style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <Copy className="h-3.5 w-3.5 text-white" />
                    </button>
                    <button
                      onClick={() => handleDelete(course)}
                      className="p-1.5 rounded-lg shadow-sm hover:bg-red-500/20 transition-colors cursor-pointer"
                      title="Excluir"
                      style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        onClick={() => router.push(`/editor/${course.id}`)}
                        className="text-left flex-1 cursor-pointer"
                      >
                        <h3 className="font-semibold text-sm text-white leading-tight line-clamp-1 group-hover:text-purple-300 transition-colors">
                          {course.title}
                        </h3>
                      </button>

                      {/* Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <button className="p-1.5 rounded-lg hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer" />
                          }
                        >
                          <MoreVertical className="h-4 w-4 text-slate-400" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl bg-slate-800 border-white/10">
                          <DropdownMenuItem
                            onClick={() => router.push(`/editor/${course.id}`)}
                            className="gap-2 cursor-pointer text-slate-300 hover:text-white focus:text-white focus:bg-white/5"
                          >
                            <Pencil className="h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(course)}
                            className="gap-2 cursor-pointer text-slate-300 hover:text-white focus:text-white focus:bg-white/5"
                          >
                            <Copy className="h-4 w-4" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem
                            onClick={() => handleDelete(course)}
                            className="gap-2 text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <Clock className="h-3 w-3 text-slate-500" />
                      <p className="text-xs text-slate-500">
                        {new Date(course.updatedAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : courses.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
            <div className="flex items-center justify-center h-24 w-24 rounded-3xl mb-6"
              style={{ background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)' }}
            >
              <LayoutGrid className="h-12 w-12 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum curso criado ainda
            </h3>
            <p className="text-slate-400 text-center max-w-md mb-8">
              Crie seu primeiro curso interativo e-learning com nosso editor
              visual drag-and-drop. Exporte para SCORM 1.2 com um clique.
            </p>
            <Button
              className="gap-2 rounded-xl text-white shadow-lg shadow-purple-500/25 cursor-pointer"
              onClick={handleCreateCourse}
              disabled={creating}
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
            >
              <Plus className="h-4 w-4" />
              Criar Primeiro Curso
            </Button>
          </div>
        ) : (
          /* No results */
          <div className="flex flex-col items-center justify-center py-24">
            <Search className="h-12 w-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-1">
              Nenhum resultado encontrado
            </h3>
            <p className="text-slate-400 text-sm">
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
