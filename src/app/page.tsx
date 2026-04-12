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
import { CourseGridCard, CourseRow, getFirstSlidePreview } from "@/components/dashboard/CourseGridCard";
import { DeleteCourseDialog } from "@/components/dashboard/DeleteCourseDialog";
import { SkeletonCourseCard, SkeletonStats } from "@/components/ui/skeleton";
import {
  GraduationCap,
  Search,
  LayoutGrid,
  Plus,
  Loader2,
  Shield,
  LogOut,
  Trash2,
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
  Bell,
} from "lucide-react";
import { toast } from "sonner";

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
  const [duplicating, setDuplicating] = useState<string | null>(null);

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
    if (duplicating === course.id) return;
    setDuplicating(course.id);
    try {
      await createCourse(
        `${course.title} (cópia)`,
        course.description,
        course.thumbnail,
        typeof course.courseData === "string" ? course.courseData : JSON.stringify(course.courseData || {})
      );
      toast.success("Curso duplicado com sucesso!");
      loadCourses();
    } catch {
      toast.error("Erro ao duplicar.");
    } finally {
      setDuplicating(null);
    }
  };

  const handleDelete = (course: CourseRow) => setCourseToDelete(course);

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

  // ─── Derived state ──────────────────────────────────────────────────────

  const filteredCourses = courses
    .filter((c) => {
      if (activeFilter === "rascunho") return c.status !== "published";
      if (activeFilter === "publicados") return c.status === "published";
      return true;
    })
    .filter(
      (c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
    );

  const isAdmin = session?.user?.role === "SUPER_ADMIN";
  const totalCourses = courses.length;
  const publishedCourses = courses.filter((c) => c.status === "published").length;
  const draftCourses = courses.filter((c) => c.status !== "published").length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card" role="banner">
        <div className="mx-auto max-w-full px-6 py-3 flex items-center justify-between">
          {/* Left: Sidebar toggle + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground cursor-pointer lg:hidden"
              aria-label={sidebarOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center h-10 w-10 rounded-xl shadow-sm"
                style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" }}
                aria-hidden="true"
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
                <Shield className="h-4 w-4" aria-hidden="true" />
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
            <button
              className="relative p-2 rounded-xl hover:bg-muted dark:hover:bg-muted transition-colors text-muted-foreground dark:text-muted-foreground/50 cursor-pointer"
              aria-label="Notificações"
            >
              <Bell className="h-5 w-5" />
            </button>

            <Button
              className="gap-2 rounded-xl text-white shadow-sm hover:shadow-md transition-all cursor-pointer hidden sm:flex"
              size="sm"
              onClick={handleCreateCourse}
              disabled={creating}
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" }}
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
              <div
                className="flex items-center justify-center h-8 w-8 rounded-full text-xs font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)" }}
                aria-hidden="true"
              >
                {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-foreground">{session?.user?.name}</p>
                <p className="text-[10px] text-muted-foreground/70">{session?.user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-muted cursor-pointer"
                onClick={() => signOut({ callbackUrl: "/login" })}
                aria-label="Sair da conta"
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
          className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 border-r border-border bg-card hidden lg:flex lg:w-64 flex-col`}
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
          {/* Stats Cards */}
          {!loading && courses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-fade-in">
              <StatCard icon={BookOpen} value={totalCourses} label="Cursos Criados" color="purple" />
              <StatCard icon={CheckCircle2} value={publishedCourses} label="Publicados" color="emerald" />
              <StatCard icon={Clock} value={draftCourses} label="Rascunhos" color="amber" />
            </div>
          )}

          {/* Section Header with Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Meus Cursos</h2>
              <p className="text-sm text-muted-foreground mt-1" aria-live="polite">
                {loading
                  ? "Carregando..."
                  : courses.length === 0
                    ? "Comece criando seu primeiro curso"
                    : `${courses.length} curso${courses.length !== 1 ? "s" : ""}`}
              </p>
            </div>

            {courses.length > 0 && (
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" aria-hidden="true" />
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
            <div className="flex gap-2 mb-6 flex-wrap" role="tablist" aria-label="Filtrar cursos">
              <FilterChip label="Todos" active={activeFilter === "todos"} onClick={() => setActiveFilter("todos")} />
              <FilterChip label="Rascunho" badge="Amber" active={activeFilter === "rascunho"} onClick={() => setActiveFilter("rascunho")} />
              <FilterChip label="Publicados" badge="Green" active={activeFilter === "publicados"} onClick={() => setActiveFilter("publicados")} />
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
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              aria-live="polite"
              aria-label="Lista de cursos"
            >
              {filteredCourses.map((course) => (
                <CourseGridCard
                  key={course.id}
                  course={course}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <EmptyState onCreateCourse={handleCreateCourse} />
          ) : (
            <div className="flex flex-col items-center justify-center py-24">
              <Search className="h-12 w-12 text-muted-foreground/50 mb-4" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-foreground mb-1">Nenhum resultado encontrado</h3>
              <p className="text-muted-foreground text-sm">Tente buscar com outros termos</p>
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
        <DeleteCourseDialog
          courseTitle={courseToDelete.title}
          onConfirm={confirmDelete}
          onCancel={() => setCourseToDelete(null)}
        />
      )}

      {/* Cookie Consent Banner (LGPD) */}
      <CookieConsent />
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ icon: Icon, value, label, color }: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  color: "purple" | "emerald" | "amber";
}) {
  const colorMap = {
    purple: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
    emerald: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400" },
    amber: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400" },
  };
  const c = colorMap[color];

  return (
    <div role="status" className="bg-card rounded-xl p-4 flex items-center gap-3 border border-border shadow-sm">
      <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${c.bg}`} aria-hidden="true">
        <Icon className={`h-5 w-5 ${c.text}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active = false, href }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  href?: string;
}) {
  const router = useRouter();
  return (
    <button
      aria-current={active ? "page" : undefined}
      onClick={href ? () => router.push(href) : undefined}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${
        active ? "bg-purple-100 text-purple-700" : "text-foreground/80 hover:bg-muted"
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}

function FilterChip({ label, badge, active, onClick }: {
  label: string;
  badge?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
        active ? "bg-purple-600 text-white" : "bg-muted text-foreground/80 hover:bg-muted"
      }`}
    >
      {label}
      {badge && (
        <span
          className={`h-2 w-2 rounded-full ${
            badge === "Amber" ? "bg-amber-500" : badge === "Green" ? "bg-emerald-500" : "bg-muted-foreground/50"
          }`}
          aria-hidden="true"
        />
      )}
    </button>
  );
}

function EmptyState({ onCreateCourse }: { onCreateCourse: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="flex items-center justify-center h-32 w-32 rounded-3xl mb-8 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100">
        <div className="relative">
          <LayoutGrid className="h-16 w-16 text-purple-400 absolute" />
          <Plus className="h-6 w-6 text-blue-500 absolute top-0 right-0" />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-foreground mb-2">Bem-vindo ao AccCourse!</h3>
      <p className="text-muted-foreground text-center max-w-md mb-10">
        Crie cursos interativos de e-learning profissionais com nosso editor visual drag-and-drop. Exporte para SCORM 1.2 com um clique.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-2xl w-full">
        <OnboardingCard icon={Plus} title="Criar do Zero" description="Inicie um novo curso em branco" onClick={onCreateCourse} primary />
        <OnboardingCard icon={Layout} title="Usar Template" description="Escolha um modelo pronto" onClick={onCreateCourse} />
        <OnboardingCard icon={Zap} title="Gerar com IA" description="Deixe a IA criar seu curso" onClick={onCreateCourse} />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md w-full">
        <div className="flex gap-3">
          <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-blue-900">Dica:</p>
            <p className="text-xs text-blue-800 mt-1">
              Experimente arrastar e soltar blocos de conteúdo, adicione quizzes interativas e customize cores e fontes para criar experiências de aprendizado memoráveis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OnboardingCard({ icon: Icon, title, description, onClick, primary = false }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
}) {
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
        primary ? "bg-purple-200 text-purple-700" : "bg-muted text-muted-foreground"
      }`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="w-full">
        <p className={`text-sm font-semibold ${primary ? "text-foreground" : "text-foreground/90"}`}>{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}
