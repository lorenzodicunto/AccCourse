"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { createDefaultProject } from "@/store/useEditorStore";
import { getUserCourses, createCourse, deleteCourse, toggleCourseStatus } from "@/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CookieConsent } from "@/components/dashboard/CookieConsent";
import { SkeletonCourseCard, SkeletonStats } from "@/components/ui/skeleton";
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
  Menu,
  X,
  Users,
  Layout,
  FolderOpen,
  Zap,
  Lightbulb,
  Sun,
  Moon,
} from "lucide-react";
import { toast } from "sonner";

type CourseRow = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  courseData: unknown;
  status: string;
  publishedAt: Date | null;
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

// Relative date helper
function getRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "hoje";
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `${diffDays} dias atrás`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
  return `${Math.floor(diffDays / 365)} anos atrás`;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"todos" | "rascunho" | "publicados">("todos");
  const { theme, setTheme } = useTheme();
  const [courseToDelete, setCourseToDelete] = useState<CourseRow | null>(null);

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

  const handleDelete = (course: CourseRow) => {
    setCourseToDelete(course);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    try {
      await deleteCourse(courseToDelete.id);
      setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
      toast.success("Curso excluído.");
    } catch {
      toast.error("Erro ao excluir.");
    } finally {
      setCourseToDelete(null);
    }
  };

  const handleToggleStatus = async (course: CourseRow) => {
    try {
      const result = await toggleCourseStatus(course.id);
      setCourses((prev) =>
        prev.map((c) =>
          c.id === course.id
            ? { ...c, status: result.status, publishedAt: result.status === "published" ? new Date() : c.publishedAt }
            : c
        )
      );
      toast.success(
        result.status === "published"
          ? "Curso publicado com sucesso!"
          : "Curso voltou a rascunho."
      );
    } catch {
      toast.error("Erro ao alterar status do curso.");
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
  const publishedCourses = courses.filter((c) => c.status === "published").length;
  const draftCourses = courses.filter((c) => c.status !== "published").length;
  const totalSlides = courses.reduce((sum, c) => {
    const preview = getFirstSlidePreview(c.courseData);
    return sum + (preview?.slideCount || 1);
  }, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="mx-auto max-w-full px-6 py-3 flex items-center justify-between">
          {/* Left: Sidebar toggle + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground cursor-pointer lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl shadow-sm"
                style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
              >
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
                  AccCourse
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md text-purple-700 bg-purple-100">
                    2.0
                  </span>
                </h1>
                <p className="text-[11px] text-muted-foreground/70 leading-none -mt-0.5">
                  Plataforma Enterprise E-Learning
                </p>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl border-red-200 text-red-600 hover:bg-red-50 bg-transparent cursor-pointer hidden sm:flex"
                onClick={() => router.push("/admin")}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            )}

            {/* Theme Toggle */}
            <button
              suppressHydrationWarning
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative p-2 rounded-xl hover:bg-muted dark:hover:bg-muted transition-colors text-muted-foreground dark:text-muted-foreground/50 cursor-pointer"
              aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
            >
              <Moon className="h-5 w-5 dark:hidden" />
              <Sun className="h-5 w-5 hidden dark:block" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-muted dark:hover:bg-muted transition-colors text-muted-foreground dark:text-muted-foreground/50 cursor-pointer">
              <Bell className="h-5 w-5" />
            </button>

            <Button
              className="gap-2 rounded-xl text-white shadow-sm hover:shadow-md transition-all cursor-pointer hidden sm:flex"
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
            <div className="flex items-center gap-2 ml-1 pl-3 border-l border-border">
              <div className="flex items-center justify-center h-8 w-8 rounded-full text-xs font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)' }}
              >
                {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-foreground">
                  {session?.user?.name}
                </p>
                <p className="text-[10px] text-muted-foreground/70">
                  {session?.user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-muted cursor-pointer"
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main layout: Sidebar + Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside
          aria-label="Navegação principal"
          className={`${
            sidebarOpen ? "w-64" : "w-0"
          } transition-all duration-300 border-r border-border bg-card hidden lg:flex lg:w-64 flex-col`}
        >
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            <NavItem icon={BookOpen} label="Meus Cursos" active />
            <NavItem icon={Users} label="Compartilhados" />
            <NavItem icon={Layout} label="Templates" href="/templates" />
            <NavItem icon={FolderOpen} label="Biblioteca" href="/biblioteca" />
            <NavItem icon={Trash2} label="Lixeira" href="/lixeira" />
          </nav>
        </aside>

        {/* Main Content */}
        <main id="main-content" role="main" className="flex-1 mx-auto max-w-7xl px-6 py-8 w-full">
          {/* Stats Cards — only show if there are courses */}
          {!loading && courses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-fade-in">
              <div role="status" className="bg-card rounded-xl p-4 flex items-center gap-3 border border-border shadow-sm">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30" aria-hidden="true">
                  <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalCourses}</p>
                  <p className="text-xs text-muted-foreground">Cursos Criados</p>
                </div>
              </div>
              <div role="status" className="bg-card rounded-xl p-4 flex items-center gap-3 border border-border shadow-sm">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30" aria-hidden="true">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{publishedCourses}</p>
                  <p className="text-xs text-muted-foreground">Publicados</p>
                </div>
              </div>
              <div role="status" className="bg-card rounded-xl p-4 flex items-center gap-3 border border-border shadow-sm">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30" aria-hidden="true">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{draftCourses}</p>
                  <p className="text-xs text-muted-foreground">Rascunhos</p>
                </div>
              </div>
            </div>
          )}

          {/* Section Header with Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
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
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  placeholder="Buscar cursos..."
                  aria-label="Buscar cursos por título ou descrição"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            )}
          </div>

          {/* Filter chips */}
          {courses.length > 0 && (
            <div className="flex gap-2 mb-6 flex-wrap">
              <FilterChip
                label="Todos"
                active={activeFilter === "todos"}
                onClick={() => setActiveFilter("todos")}
              />
              <FilterChip
                label="Rascunho"
                badge="Amber"
                active={activeFilter === "rascunho"}
                onClick={() => setActiveFilter("rascunho")}
              />
              <FilterChip
                label="Publicados"
                badge="Green"
                active={activeFilter === "publicados"}
                onClick={() => setActiveFilter("publicados")}
              />
            </div>
          )}

          {/* Projects Grid */}
          {loading ? (
            <>
              <SkeletonStats />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <SkeletonCourseCard key={i} />
                ))}
              </div>
            </>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredCourses.map((course) => {
                const slidePreview = getFirstSlidePreview(course.courseData);
                return (
                  <div
                    key={course.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-border transition-all duration-300 hover:border-primary/30 hover:shadow-md cursor-pointer animate-fade-in bg-card"
                  >
                    {/* Thumbnail / Slide Preview */}
                    <button
                      onClick={() => router.push(`/editor/${course.id}`)}
                      className="relative h-40 w-full overflow-hidden cursor-pointer bg-muted"
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
                                <div className="w-full h-full rounded-sm bg-muted flex items-center justify-center">
                                  <div className="h-3 w-3 text-muted-foreground/50">
                                    <MiniBlockIcon type={block.type} />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Empty slide indicator */}
                          {slidePreview.blocks.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-xs text-muted-foreground/50 font-medium">
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
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

                      {/* Status badge */}
                      <div className="absolute top-2 left-2">
                        {course.status === "published" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Publicado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
                            Rascunho
                          </span>
                        )}
                      </div>

                      {/* Slide count badge */}
                      <div className="absolute bottom-2 left-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md shadow-sm bg-card/90 text-foreground/80 border border-border">
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
                        className="p-1.5 rounded-lg shadow-sm hover:bg-muted transition-colors cursor-pointer bg-card/90 border border-border"
                        aria-label={`Editar curso ${course.title}`}
                      >
                        <Pencil className="h-3.5 w-3.5 text-foreground/80" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(course)}
                        className="p-1.5 rounded-lg shadow-sm hover:bg-muted transition-colors cursor-pointer bg-card/90 border border-border"
                        aria-label={`Duplicar curso ${course.title}`}
                      >
                        <Copy className="h-3.5 w-3.5 text-foreground/80" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleDelete(course)}
                        className="p-1.5 rounded-lg shadow-sm hover:bg-red-100 transition-colors cursor-pointer bg-card/90 border border-border"
                        aria-label={`Excluir curso ${course.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <button
                          onClick={() => router.push(`/editor/${course.id}`)}
                          className="text-left flex-1 cursor-pointer"
                        >
                          <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-1 group-hover:text-purple-600 transition-colors">
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
                            <MoreVertical className="h-4 w-4 text-muted-foreground/70" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl bg-card border border-border shadow-md">
                            <DropdownMenuItem
                              onClick={() => router.push(`/editor/${course.id}`)}
                              className="gap-2 cursor-pointer text-foreground/80 hover:text-foreground focus:text-foreground focus:bg-muted"
                            >
                              <Pencil className="h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDuplicate(course)}
                              className="gap-2 cursor-pointer text-foreground/80 hover:text-foreground focus:text-foreground focus:bg-muted"
                            >
                              <Copy className="h-4 w-4" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(course)}
                              className="gap-2 cursor-pointer text-foreground/80 hover:text-foreground focus:text-foreground focus:bg-muted"
                            >
                              {course.status === "published" ? (
                                <>
                                  <Clock className="h-4 w-4" />
                                  Voltar a Rascunho
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4" />
                                  Publicar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem
                              onClick={() => handleDelete(course)}
                              className="gap-2 text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Last edited date */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <Clock className="h-3 w-3 text-muted-foreground/70" />
                        <p className="text-xs text-muted-foreground">
                          Última edição: {getRelativeDate(course.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : courses.length === 0 ? (
            /* Rich Empty State with Onboarding */
            <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
              {/* Illustration area with creative icons */}
              <div className="flex items-center justify-center h-32 w-32 rounded-3xl mb-8 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100">
                <div className="relative">
                  <LayoutGrid className="h-16 w-16 text-purple-400 absolute" />
                  <Plus className="h-6 w-6 text-blue-500 absolute top-0 right-0" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-2">
                Bem-vindo ao AccCourse!
              </h3>
              <p className="text-muted-foreground text-center max-w-md mb-10">
                Crie cursos interativos de e-learning profissionais com nosso editor visual drag-and-drop. Exporte para SCORM 1.2 com um clique.
              </p>

              {/* Three suggestion cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-2xl w-full">
                <OnboardingCard
                  icon={Plus}
                  title="Criar do Zero"
                  description="Inicie um novo curso em branco"
                  onClick={handleCreateCourse}
                  primary
                />
                <OnboardingCard
                  icon={Layout}
                  title="Usar Template"
                  description="Escolha um modelo pronto"
                  onClick={handleCreateCourse}
                />
                <OnboardingCard
                  icon={Zap}
                  title="Gerar com IA"
                  description="Deixe a IA criar seu curso"
                  onClick={handleCreateCourse}
                />
              </div>

              {/* Tips section */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md w-full">
                <div className="flex gap-3">
                  <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Dica:</p>
                    <p className="text-xs text-blue-800 mt-1">
                      Experimente arrastar e soltar blocos de conteúdo, adicione quizzes interativas e customize cores e fontes para criar experiências de aprendizado memoráveis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* No results */
            <div className="flex flex-col items-center justify-center py-24">
              <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Nenhum resultado encontrado
              </h3>
              <p className="text-muted-foreground text-sm">
                Tente buscar com outros termos
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between text-xs text-muted-foreground">
          <p>© 2026 Accuracy. Todos os direitos reservados.</p>
          <p>AccCourse v2.0</p>
        </div>
      </footer>

      {/* Delete Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Excluir curso</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Tem certeza que deseja excluir <strong className="text-foreground">&quot;{courseToDelete.title}&quot;</strong>? O curso será movido para a lixeira.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl cursor-pointer"
                onClick={() => setCourseToDelete(null)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                onClick={confirmDelete}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Consent Banner (LGPD) */}
      <CookieConsent />
    </div>
  );
}

// Helper component for sidebar navigation
function NavItem({ icon: Icon, label, active = false, href }: { icon: React.ComponentType<{ className?: string }>; label: string; active?: boolean; href?: string }) {
  const router = useRouter();
  return (
    <button
      aria-current={active ? "page" : undefined}
      onClick={href ? () => router.push(href) : undefined}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${
        active
          ? "bg-purple-100 text-purple-700"
          : "text-foreground/80 hover:bg-muted"
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}

// Helper component for filter chips
function FilterChip({ label, badge, active, onClick }: { label: string; badge?: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
        active
          ? "bg-purple-600 text-white"
          : "bg-muted text-foreground/80 hover:bg-muted"
      }`}
    >
      {label}
      {badge && (
        <span className={`h-2 w-2 rounded-full ${
          badge === "Amber" ? "bg-amber-500" : badge === "Green" ? "bg-emerald-500" : "bg-muted-foreground/50"
        }`} />
      )}
    </button>
  );
}

// Helper component for onboarding cards
function OnboardingCard({ icon: Icon, title, description, onClick, primary = false }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string; onClick: () => void; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border transition-all text-left cursor-pointer flex flex-col items-start gap-2 ${
        primary
          ? "bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 hover:border-purple-300 hover:shadow-md"
          : "bg-card border-border hover:border-primary/30 hover:shadow-sm"
      }`}
    >
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
        primary
          ? "bg-purple-200 text-purple-700"
          : "bg-muted text-muted-foreground"
      }`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="w-full">
        <p className={`text-sm font-semibold ${primary ? "text-foreground" : "text-foreground/90"}`}>
          {title}
        </p>
        <p className={`text-xs ${primary ? "text-muted-foreground" : "text-muted-foreground"}`}>
          {description}
        </p>
      </div>
    </button>
  );
}
