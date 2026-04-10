"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditorStore } from "@/store/useEditorStore";
import { Settings } from "lucide-react";

export function CourseSettingsDialog() {
  const getCurrentProject = useEditorStore((s) => s.getCurrentProject);
  const project = getCurrentProject();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(project?.title || "");
  const [description, setDescription] = useState(project?.description || "");
  const [passingScore, setPassingScore] = useState(project?.quizSettings?.passingScore ?? 70);
  const [showResults, setShowResults] = useState(project?.quizSettings?.showResults ?? true);
  const [allowRetry, setAllowRetry] = useState(project?.quizSettings?.allowRetry ?? true);
  const [maxAttempts, setMaxAttempts] = useState(project?.quizSettings?.maxAttempts ?? 3);

  const handleSave = () => {
    if (!project) return;
    useEditorStore.setState((state) => ({
      projects: state.projects.map(p =>
        p.id === project.id ? {
          ...p,
          title,
          description,
          quizSettings: {
            passingScore,
            showResults,
            allowRetry,
            maxAttempts,
          },
        } : p
      ),
    }));
    setOpen(false);
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) { setTitle(project.title); setDescription(project.description); setPassingScore(project.quizSettings?.passingScore ?? 70); } }}>
      <DialogTrigger>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7 px-2">
          <Settings className="h-3.5 w-3.5" />
          Configurações
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">⚙️ Configurações do Curso</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Título do Curso</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-9" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Descrição</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full h-20 text-sm rounded-lg border border-border p-2 resize-none" placeholder="Descrição do curso..." />
          </div>

          <div className="bg-violet-50 rounded-xl p-3">
            <p className="text-xs font-bold text-violet-700 mb-2">📊 Quiz Settings</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Nota Mínima (%)</label>
                <Input type="number" min={0} max={100} value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))} className="h-7 text-xs" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Máx. Tentativas</label>
                <Input type="number" min={1} max={99} value={maxAttempts} onChange={(e) => setMaxAttempts(Number(e.target.value))} className="h-7 text-xs" />
              </div>
            </div>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-1.5 text-[10px]">
                <input type="checkbox" checked={showResults} onChange={(e) => setShowResults(e.target.checked)} className="rounded" />
                Mostrar Resultados
              </label>
              <label className="flex items-center gap-1.5 text-[10px]">
                <input type="checkbox" checked={allowRetry} onChange={(e) => setAllowRetry(e.target.checked)} className="rounded" />
                Permitir Retry
              </label>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs font-bold text-slate-700 mb-1">📈 Estatísticas</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white rounded-lg p-2">
                <p className="text-lg font-bold text-indigo-600">{project.slides.length}</p>
                <p className="text-[9px] text-slate-400">Slides</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-lg font-bold text-emerald-600">{project.slides.reduce((acc, s) => acc + s.blocks.length, 0)}</p>
                <p className="text-[9px] text-slate-400">Blocos</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-lg font-bold text-amber-600">{project.slides.reduce((acc, s) => acc + s.blocks.filter(b => ["quiz", "truefalse", "matching", "fillblank", "sorting", "dragdrop"].includes(b.type)).length, 0)}</p>
                <p className="text-[9px] text-slate-400">Quizzes</p>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
