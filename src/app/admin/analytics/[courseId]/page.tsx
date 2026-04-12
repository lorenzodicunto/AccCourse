"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { CourseAnalytics, StudentProgress } from "@/lib/analytics/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Award,
  AlertCircle,
} from "lucide-react";

export default function CourseAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [analytics, setAnalytics] = useState<CourseAnalytics | null>(null);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!courseId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [analyticsRes, studentsRes] = await Promise.all([
          fetch(`/api/analytics/course/${courseId}`),
          fetch(`/api/analytics/course/${courseId}/students?page=${currentPage}&limit=10`),
        ]);

        if (!analyticsRes.ok) {
          throw new Error("Failed to fetch analytics");
        }

        if (!studentsRes.ok) {
          throw new Error("Failed to fetch students");
        }

        const analyticsData = await analyticsRes.json();
        const studentsData = await studentsRes.json();

        setAnalytics(analyticsData);
        setStudents(studentsData.students);
        setTotalPages(studentsData.pagination.pages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-muted-foreground/20 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <div className="max-w-md w-full">
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="font-semibold text-red-900 dark:text-red-200">Erro ao carregar dados</p>
              </div>
              <p className="text-sm text-red-800 dark:text-red-300 mb-4">
                {error || "Course not found or you don't have permission to view this analytics."}
              </p>
              <Button
                onClick={() => router.back()}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="sm"
            className="gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            Analytics do Curso
          </h1>
          <p className="text-muted-foreground mt-2">
            Métricas e desempenho de alunos
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Enrollments */}
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wide">
                    Matrículas
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {analytics.totalEnrollments}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completions */}
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wide">
                    Conclusões
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {analytics.completions}
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Score */}
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wide">
                    Score Médio
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {analytics.averageScore.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Time */}
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wide">
                    Tempo Médio
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {Math.round(analytics.averageTimeMinutes)}m
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completion Rate */}
        <Card className="border-border bg-card mb-8">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">
              Taxa de Conclusão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Progresso Geral
                  </span>
                  <span className="text-sm font-bold text-purple-600">
                    {analytics.completionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-purple-400 h-full rounded-full transition-all"
                    style={{ width: `${analytics.completionRate}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Concluído</p>
                  <p className="text-2xl font-bold text-foreground">
                    {analytics.completions}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Em Progresso</p>
                  <p className="text-2xl font-bold text-foreground">
                    {analytics.totalEnrollments - analytics.completions}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student List */}
        <Card className="border-border bg-card mb-8">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">
              Alunos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Nenhum aluno ainda</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                          Nome
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                          Score
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                          Tempo (min)
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                          Data Conclusão
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr
                          key={student.userId}
                          className="border-b border-border/50 hover:bg-muted transition-colors"
                        >
                          <td className="py-3 px-4">
                            <p className="font-medium text-foreground">
                              {student.userName}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                student.status === "completed"
                                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                  : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                              }`}
                            >
                              {student.status === "completed"
                                ? "Concluído"
                                : "Em Progresso"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {student.score !== null && student.maxScore
                              ? `${((student.score / student.maxScore) * 100).toFixed(1)}%`
                              : "-"}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {student.timeSpentMinutes.toFixed(1)}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground/70 text-sm">
                            {student.completedAt
                              ? new Date(student.completedAt).toLocaleDateString(
                                  "pt-BR"
                                )
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4 border-t border-border">
                    <Button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Próxima
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Quiz Analytics */}
        {analytics.quizAnalytics.length > 0 && (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                Análise de Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.quizAnalytics.map((quiz, idx) => (
                  <div key={idx} className="pb-4 last:pb-0 border-b border-border/50 last:border-0">
                    <div className="mb-3">
                      <p className="font-medium text-foreground text-sm mb-1">
                        {quiz.question}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Taxa de Acerto
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            {quiz.correctRate.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Tentativas Médias
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            {quiz.averageAttempts.toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
