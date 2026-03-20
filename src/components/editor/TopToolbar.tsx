"use client";

import { useEditorStore } from "@/store/useEditorStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Monitor,
  Smartphone,
  Download,
  GraduationCap,
  Loader2,
  Share2,
  Link,
  Check,
  CloudUpload,
} from "lucide-react";
import { useState } from "react";
import { exportScormPackage } from "@/lib/scorm/packager";
import { shareCourse } from "@/actions/review";
import { saveCourse } from "@/actions/courses";
import { toast } from "sonner";

interface TopToolbarProps {
  courseId?: string;
}

export function TopToolbar({ courseId }: TopToolbarProps) {
  const router = useRouter();
  const getCurrentProject = useEditorStore((s) => s.getCurrentProject);
  const updateProject = useEditorStore((s) => s.updateProject);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const past = useEditorStore((s) => s.past);
  const future = useEditorStore((s) => s.future);
  const previewMode = useEditorStore((s) => s.previewMode);
  const setPreviewMode = useEditorStore((s) => s.setPreviewMode);

  const project = getCurrentProject();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleTitleClick = () => {
    if (project) {
      setTitleValue(project.title);
      setEditingTitle(true);
    }
  };

  const handleTitleBlur = () => {
    if (project && titleValue.trim()) {
      updateProject(project.id, { title: titleValue.trim() });
    }
    setEditingTitle(false);
  };

  const handleExport = async () => {
    if (!project || exporting) return;
    setExporting(true);
    toast.promise(
      exportScormPackage(project),
      {
        loading: "Empacotando SCORM... Aguarde.",
        success: "Curso exportado com sucesso! Download iniciado.",
        error: "Erro ao exportar o pacote SCORM.",
      }
    );
    setTimeout(() => setExporting(false), 1500);
  };

  const handleShare = async () => {
    if (!project || sharing) return;
    setSharing(true);
    try {
      const courseData = JSON.stringify(project);
      const result = await shareCourse(project.title, courseData);
      const link = `${window.location.origin}/review/${result.id}`;
      setShareLink(link);
      setShareDialogOpen(true);
      toast.success("Link de revisão gerado com sucesso!");
    } catch {
      toast.error("Erro ao compartilhar o curso para revisão.");
    } finally {
      setSharing(false);
    }
  };

  const handleSaveToCloud = async () => {
    if (!project || !courseId || saving) return;
    setSaving(true);
    try {
      const courseData = JSON.stringify(project);
      await saveCourse(courseId, courseData);
      toast.success("Curso salvo na nuvem com sucesso!");
    } catch {
      toast.error("Erro ao salvar na nuvem.");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="h-14 border-b border-border/50 bg-white flex items-center justify-between px-4 flex-shrink-0">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl h-9 w-9 p-0"
            onClick={() => router.push("/")}
            title="Voltar ao Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary/10">
              <GraduationCap className="h-3.5 w-3.5 text-primary" />
            </div>
            {editingTitle ? (
              <input
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
                className="text-sm font-semibold bg-transparent border-b-2 border-primary outline-none py-0.5 px-1 min-w-[200px]"
                autoFocus
              />
            ) : (
              <button
                onClick={handleTitleClick}
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                {project?.title ?? "Sem título"}
              </button>
            )}
          </div>
        </div>

        {/* Center: Undo/Redo + Preview */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl h-9 w-9 p-0"
            onClick={undo}
            disabled={past.length === 0}
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl h-9 w-9 p-0"
            onClick={redo}
            disabled={future.length === 0}
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-2 h-6" />

          <div className="flex items-center bg-muted/60 rounded-xl p-0.5">
            <Button
              variant={previewMode === "desktop" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-lg h-8 w-8 p-0"
              onClick={() => setPreviewMode("desktop")}
              title="Desktop"
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={previewMode === "mobile" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-lg h-8 w-8 p-0"
              onClick={() => setPreviewMode("mobile")}
              title="Mobile"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right: Save + Share + Export */}
        <div className="flex items-center gap-2">
          {/* Save to Cloud */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-all"
            onClick={handleSaveToCloud}
            disabled={saving || !project}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CloudUpload className="h-4 w-4" />
            )}
            {saving ? "Salvando..." : "Salvar na Nuvem"}
          </Button>

          {/* Share */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl border-primary/30 text-primary hover:bg-primary/5 transition-all"
            onClick={handleShare}
            disabled={sharing || !project}
          >
            {sharing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            {sharing ? "Compartilhando..." : "Compartilhar"}
          </Button>

          {/* Export SCORM */}
          <Button
            className="gap-2 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
            size="sm"
            onClick={handleExport}
            disabled={exporting || !project}
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {exporting ? "Exportando..." : "Exportar SCORM"}
          </Button>
        </div>
      </div>

      {/* Share Dialog (Modal Overlay) */}
      {shareDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShareDialogOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
                <Share2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Compartilhar para Revisão
                </h3>
                <p className="text-xs text-muted-foreground">
                  Envie o link para que revisores deixem comentários
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl border border-border/50">
              <Link className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <input
                readOnly
                value={shareLink}
                className="flex-1 bg-transparent text-sm text-foreground outline-none font-mono truncate"
              />
              <Button
                size="sm"
                className="rounded-lg h-8 gap-1.5 flex-shrink-0"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copiado!
                  </>
                ) : (
                  "Copiar"
                )}
              </Button>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl"
                onClick={() => setShareDialogOpen(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
