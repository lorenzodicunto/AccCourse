"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTrashedCourses, restoreCourse, permanentlyDeleteCourse } from "@/actions/courses";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, RotateCcw, AlertTriangle, Loader2 } from "lucide-react";
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="gap-2 text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-red-100 flex items-center justify-center">
              <Trash2 className="h-4.5 w-4.5 text-red-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Lixeira</h1>
              <p className="text-xs text-slate-500">
                {courses.length} curso{courses.length !== 1 ? "s" : ""} na lixeira
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Trash2 className="h-7 w-7 text-slate-300" />
            </div>
            <h2 className="text-lg font-medium text-slate-700 mb-1">Lixeira vazia</h2>
            <p className="text-sm text-slate-500">Cursos excluídos aparecerão aqui para restauração.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Thumbnail */}
                  <div className="h-14 w-20 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">
                        Sem capa
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="min-w-0">
                    <h3 className="font-medium text-slate-900 truncate">{course.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      por {course.author.name} · excluído em {formatDate(course.deletedAt)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {confirmDelete === course.id ? (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                      <span className="text-xs text-red-700">Excluir permanentemente?</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-slate-500 cursor-pointer"
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
                        className="gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer"
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
                        className="gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
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
