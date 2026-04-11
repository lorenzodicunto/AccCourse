"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { getAnalyticsData, AnalyticsData } from "@/actions/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Layers,
  Users,
  TrendingUp,
  BarChart3,
  Clock,
  Activity,
  ArrowLeft,
  LogOut,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// Mock data for courses
const mockCourses = [
  {
    id: 1,
    name: "Introdução ao Python",
    author: "Carlos Silva",
    slides: 24,
    views: 1250,
    completion: 82,
    lastEdited: "2024-04-08",
  },
  {
    id: 2,
    name: "Fundamentos de UX Design",
    author: "Maria Costa",
    slides: 18,
    views: 856,
    completion: 71,
    lastEdited: "2024-04-07",
  },
  {
    id: 3,
    name: "Gestão de Projetos com Agile",
    author: "João Santos",
    slides: 32,
    views: 2103,
    completion: 65,
    lastEdited: "2024-04-09",
  },
  {
    id: 4,
    name: "Marketing Digital 2024",
    author: "Ana Oliveira",
    slides: 28,
    views: 1890,
    completion: 78,
    lastEdited: "2024-04-06",
  },
  {
    id: 5,
    name: "Desenvolvimento Web Avançado",
    author: "Pedro Almeida",
    slides: 42,
    views: 2456,
    completion: 88,
    lastEdited: "2024-04-09",
  },
  {
    id: 6,
    name: "Comunicação Empresarial",
    author: "Laura Ferreira",
    slides: 16,
    views: 723,
    completion: 60,
    lastEdited: "2024-04-05",
  },
  {
    id: 7,
    name: "Data Science com R",
    author: "Roberto Gomes",
    slides: 38,
    views: 1567,
    completion: 74,
    lastEdited: "2024-04-08",
  },
  {
    id: 8,
    name: "Segurança da Informação",
    author: "Fernanda Costa",
    slides: 26,
    views: 945,
    completion: 69,
    lastEdited: "2024-04-07",
  },
];

// Mock data for monthly course creation
const monthlyData = [
  { month: "Setembro", courses: 3 },
  { month: "Outubro", courses: 5 },
  { month: "Novembro", courses: 4 },
  { month: "Dezembro", courses: 7 },
  { month: "Janeiro", courses: 6 },
  { month: "Fevereiro", courses: 8 },
];

// Mock data for top courses by views
const topCoursesByViews = mockCourses
  .sort((a, b) => b.views - a.views)
  .slice(0, 5);

// Mock activity feed
const activityFeed = [
  { id: 1, action: "Novo curso criado", course: "Desenvolvimento Web Avançado", time: "há 2 horas", user: "Pedro Almeida" },
  { id: 2, action: "Slides adicionados", course: "Introdução ao Python", time: "há 4 horas", user: "Carlos Silva" },
  { id: 3, action: "Curso finalizado", course: "Fundamentos de UX Design", time: "há 6 horas", user: "Maria Costa" },
  { id: 4, action: "Novo curso criado", course: "Comunicação Empresarial", time: "há 1 dia", user: "Laura Ferreira" },
  { id: 5, action: "Edição realizada", course: "Marketing Digital 2024", time: "há 1 dia", user: "Ana Oliveira" },
];

export default function AnalyticsDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"analytics" | "performance" | "engagement">("analytics");
  const [realData, setRealData] = useState<AnalyticsData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    getAnalyticsData()
      .then(setRealData)
      .catch(() => {}) // Fallback to mock data
      .finally(() => setDataLoading(false));
  }, []);

  // Use real data when available, fallback to mock
  const totalCourses = realData?.totalCourses ?? mockCourses.length;
  const totalSlides = realData?.totalSlides ?? mockCourses.reduce((sum, course) => sum + course.slides, 0);
  const totalViews = realData ? realData.totalSharedCourses : mockCourses.reduce((sum, course) => sum + course.views, 0);
  const avgCompletion = realData
    ? (realData.totalComments > 0 ? Math.min(100, Math.round((realData.totalComments / Math.max(1, realData.totalSharedCourses)) * 10)) : 0)
    : Math.round(mockCourses.reduce((sum, course) => sum + course.completion, 0) / mockCourses.length);

  // Calculate max views for chart scaling
  const maxViews = Math.max(...topCoursesByViews.map((c) => c.views));

  // Calculate max monthly courses for chart scaling
  const effectiveMonthlyData = realData?.coursesByMonth?.map((d) => ({
    month: new Date(d.month + "-01").toLocaleString("pt-BR", { month: "long" }).replace(/^\w/, (c) => c.toUpperCase()),
    courses: d.count,
  })) ?? monthlyData;
  const maxMonthly = Math.max(...effectiveMonthlyData.map((d) => d.courses), 1);

  return (
    <div className="min-h-screen flex bg-muted">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col flex-shrink-0 bg-card border-r border-border">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-700">
              <Shield className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-foreground">Admin Portal</h1>
              <p className="text-[10px] text-muted-foreground/70">AccCourse 2.0</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <button
            onClick={() => router.push("/admin")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <BarChart3 className="h-4 w-4" />
            Empresas
          </button>
          <button
            onClick={() => router.push("/admin")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Users className="h-4 w-4" />
            Usuários
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all bg-purple-100 dark:bg-purple-900/30 text-purple-700"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </button>
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Editor
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        <div className="px-4 pb-4">
          <div className="bg-muted rounded-xl p-3">
            <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
            <p className="text-[10px] text-muted-foreground/70 mt-0.5">Super Admin</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Métricas e análises dos cursos criados na plataforma.</p>
          </div>

          {/* Overview Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total de Cursos */}
            <Card className="border-border bg-card hover:border-purple-300 hover:shadow-lg transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wide">Total de Cursos</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{totalCourses}</p>
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" />
                      +2 este mês
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total de Slides */}
            <Card className="border-border bg-card hover:border-purple-300 hover:shadow-lg transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wide">Total de Slides</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{totalSlides}</p>
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" />
                      +18 esta semana
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Layers className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usuários Ativos */}
            <Card className="border-border bg-card hover:border-purple-300 hover:shadow-lg transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wide">Usuários Ativos</p>
                    <p className="text-3xl font-bold text-foreground mt-2">127</p>
                    <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                      <ArrowDownRight className="h-3 w-3" />
                      -3 desde ontem
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Users className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Taxa de Conclusão */}
            <Card className="border-border bg-card hover:border-purple-300 hover:shadow-lg transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wide">Taxa de Conclusão</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{avgCompletion}%</p>
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" />
                      +4% vs mês passado
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Vertical Bar Chart - Cursos por Mês */}
            <Card className="border-border bg-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground">Cursos Criados por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between h-64 gap-3 px-2">
                  {monthlyData.map((data, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-muted rounded-t-lg overflow-hidden flex-1 relative group">
                        <div
                          className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all hover:from-purple-700 hover:to-purple-500 cursor-pointer"
                          style={{ height: `${(data.courses / maxMonthly) * 100}%` }}
                        >
                          <div className="absolute -top-8 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-xs font-bold text-foreground text-center">{data.courses}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs font-medium text-muted-foreground text-center">{data.month.slice(0, 3)}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground/70 mt-4 text-center">Últimos 6 meses</p>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-600" />
                  Atividades Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activityFeed.map((activity) => (
                    <div key={activity.id} className="border-l-2 border-purple-200 pl-3 pb-3 last:pb-0">
                      <p className="text-xs font-semibold text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{activity.course}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] text-muted-foreground/70">{activity.user}</p>
                        <p className="text-[10px] text-muted-foreground/50">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Courses Chart */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground">Top 5 Cursos por Acessos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCoursesByViews.map((course, idx) => (
                    <div key={course.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-purple-600 w-6">#{idx + 1}</span>
                          <span className="text-sm font-medium text-foreground">{course.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">{course.views}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-purple-400 h-full rounded-full transition-all"
                          style={{ width: `${(course.views / maxViews) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Performance Table */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground">Desempenho dos Cursos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Curso</th>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Autor</th>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Slides</th>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Acessos</th>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Conclusão</th>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Última Edição</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockCourses.map((course) => (
                        <tr key={course.id} className="border-b border-border/50 hover:bg-muted transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-medium text-foreground">{course.name}</p>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{course.author}</td>
                          <td className="py-3 px-4 text-muted-foreground">{course.slides}</td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-foreground">{course.views}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    course.completion >= 80
                                      ? "bg-emerald-500"
                                      : course.completion >= 60
                                      ? "bg-yellow-500"
                                      : "bg-orange-500"
                                  }`}
                                  style={{ width: `${course.completion}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-foreground">{course.completion}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground/70 text-sm">
                            {new Date(course.lastEdited).toLocaleDateString("pt-BR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tempo Médio por Slide */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  Tempo Médio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Por Slide</p>
                    <p className="text-2xl font-bold text-foreground">3m 24s</p>
                  </div>
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Por Curso</p>
                    <p className="text-2xl font-bold text-foreground">54m</p>
                  </div>
                  <p className="text-xs text-muted-foreground/70 pt-2">Média dos últimos 30 dias</p>
                </div>
              </CardContent>
            </Card>

            {/* Taxa de Abandono */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  Taxa de Abandono
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Cursos Iniciados</p>
                    <p className="text-2xl font-bold text-foreground">842</p>
                  </div>
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Taxa de Conclusão</p>
                    <p className="text-2xl font-bold text-foreground">74%</p>
                  </div>
                  <p className="text-xs text-muted-foreground/70 pt-2">26% de abandono</p>
                </div>
              </CardContent>
            </Card>

            {/* Slides Mais Revisitados */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-purple-600" />
                  Top Slides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <span className="text-xs font-medium text-foreground">Slide 5 - Python</span>
                    <span className="text-xs font-bold text-purple-600">456 visitas</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <span className="text-xs font-medium text-foreground">Slide 3 - UX Design</span>
                    <span className="text-xs font-bold text-purple-600">423 visitas</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <span className="text-xs font-medium text-foreground">Slide 8 - Agile</span>
                    <span className="text-xs font-bold text-purple-600">398 visitas</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
