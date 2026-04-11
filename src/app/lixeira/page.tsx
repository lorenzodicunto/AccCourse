"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTrashedCourses, restoreCourse, permanentlyDeleteCourse } from "@/actions/courses";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Trash2, RotateCcw, AlertTriangle, Loader2, Undo2 } from "lucide-react";
import { toast } from "sonner";

interface TrashedCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  updatedAt: Date;
  deletedAt: Date | null;
  author: { name: string; email: string };
}

export default function LixeiraPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<TrashedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchTrashed = async () => {
    try {
      const data = await getTrashedCourses();
      setCourses(data as TrashedCourse[]);
    } catch {
      toast.error("Erro ao carregar cursos na lixeira.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashed();
  }, []);

  const handleRestore = async (id: string) => {
    setActionLoading(id);
    try {
      await restoreCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      toast.success("Curso restaurado com sucesso!");
    } catch {
      toast.error("Erro ao restaurar o curso.");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    setActionLoading(id);
    try {
      await permanentlyDeleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      setConfirmDelete(null);
      toast.success("Curso excluído permanentemente.");
    } catch {
      toast.error("Erro ao excluir permanentemente.");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Trash2 className="h-4.5 w-4.5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Lixeira</h1>
              <p className="text-xs text-muted-foreground">
                {loading ? "Carregando..." : `${courses.length} curso${courses.length !== 1 ? "s" : ""} na lixeira`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          /* Skeleton loading */
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
                <Skeleton className="h-14 w-20 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24 rounded-lg" />
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          /* Rich Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="relative mb-6">
              <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 flex items-center justify-center border border-red-100 dark:border-red-800/30">
                <Trash2 className="h-10 w-10 text-red-300 dark:text-red-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border-2 border-background">
                <Undo2 className="h-4 w-4 text-emerald-500" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-foreground mb-2">Lixeira vazia</h2>
            <p className="text-sm text-muted-foreground max-w-sm mb-8">
              Quando você excluir um curso, ele aparecerá aqui por 30 dias antes de ser removido permanentemente. Você pode restaurá-lo a qualquer momento.
            </p>

            <Button
              variant="outline"
              className="rounded-xl gap-2 cursor-pointer"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar aos Meus Cursos
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-card rounded-xl border border-border p-4 flex items-center justify-between gap-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Thumbnail */}
                  <div className="h-14 w-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 text-xs">
                        Sem capa
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="min-w-0">
                    <h3 className="font-medium text-foreground truncate">{course.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      por {course.author.name} · excluído em {formatDate(course.deletedAt)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {confirmDelete === course.id ? (
                    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg px-3 py-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                      <span className="text-xs text-red-700 dark:text-red-300">Excluir permanentemente?</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-muted-foreground cursor-pointer"
                        onClick={() => setConfirmDelete(null)}
                      >
                        Não
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                        onClick={() => handlePermanentDelete(course.id)}
                        disabled={actionLoading === course.id}
                      >
                        {actionLoading === course.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Sim, excluir"
                        )}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer"
                        onClick={() => handleRestore(course.id)}
                        disabled={actionLoading === course.id}
                      >
                        {actionLoading === course.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="h-3.5 w-3.5" />
                        )}
                        Restaurar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                        onClick={() => setConfirmDelete(course.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Excluir
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
