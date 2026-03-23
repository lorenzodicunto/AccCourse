"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEditorStore } from "@/store/useEditorStore";

interface AICourseDialogProps {
  projectId: string;
}

export function AICourseDialog({ projectId }: AICourseDialogProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [slideCount, setSlideCount] = useState(5);
  const [includeQuiz, setIncludeQuiz] = useState(true);
  const [loading, setLoading] = useState(false);

  const addSlide = useEditorStore((s) => s.addSlide);
  const addBlock = useEditorStore((s) => s.addBlock);
  const projects = useEditorStore((s) => s.projects);

  async function handleGenerate() {
    if (prompt.trim().length < 10) {
      toast.error("Descreva o curso com pelo menos 10 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, slideCount, includeQuiz }),
      });

      if (!res.ok) throw new Error("Erro na API");

      const data = await res.json();

      if (!data.slides || data.slides.length === 0) {
        toast.error("AI não gerou slides. Tente outra descrição.");
        return;
      }

      // Insert generated slides
      let inserted = 0;
      for (const slideData of data.slides) {
        // Add a new slide (this creates it with auto ID)
        addSlide(projectId);

        // Get the latest project state to find the newly created slide
        const project = useEditorStore.getState().projects.find((p) => p.id === projectId);
        if (!project) continue;
        const newSlide = project.slides[project.slides.length - 1];
        if (!newSlide) continue;

        // Add blocks to the slide
        for (const blockData of slideData.blocks || []) {
          const baseBlock = {
            id: crypto.randomUUID(),
            x: blockData.x || 60,
            y: blockData.y || 40,
            width: blockData.width || 840,
            height: blockData.height || 250,
            zIndex: 0,
          };

          if (blockData.type === "text") {
            addBlock(projectId, newSlide.id, {
              ...baseBlock,
              type: "text" as const,
              content: blockData.content || "",
              fontSize: 16,
              fontWeight: "normal",
              fontStyle: "normal",
              textDecoration: "none",
              textAlign: "left" as const,
              color: "#1a1a2e",
              backgroundColor: "transparent",
              letterSpacing: 0,
              lineHeight: 1.6,
              padding: 16,
              borderRadius: 0,
              borderWidth: 0,
              borderColor: "#000000",
              borderStyle: "solid" as const,
              opacity: 1,
              rotation: 0,
            } as any);
          } else if (blockData.type === "quiz") {
            addBlock(projectId, newSlide.id, {
              ...baseBlock,
              type: "quiz" as const,
              question: blockData.question || "Pergunta",
              options: (blockData.options || []).map((opt: any) => ({
                id: crypto.randomUUID(),
                text: opt.text,
                isCorrect: opt.isCorrect,
              })),
              feedbackCorrect: "Correto! 🎉",
              feedbackIncorrect: "Tente novamente!",
              pointsValue: 10,
            } as any);
          } else if (blockData.type === "truefalse") {
            addBlock(projectId, newSlide.id, {
              ...baseBlock,
              type: "truefalse" as const,
              statement: blockData.statement || "Afirmação",
              isTrue: blockData.isTrue ?? true,
              feedbackCorrect: "Correto! ✅",
              feedbackIncorrect: "Incorreto! ❌",
              pointsValue: 10,
            } as any);
          }
        }
        inserted++;
      }

      toast.success(`${inserted} slides gerados por AI! 🎉`);
      setOpen(false);
      setPrompt("");
    } catch (err) {
      toast.error("Erro ao gerar curso. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7 px-2">
          <Wand2 className="h-3.5 w-3.5 text-violet-500" />
          AI Curso
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-violet-500" />
            Gerar Curso por AI
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Descreva o curso que deseja criar:
            </label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='Ex: "Curso de compliance LGPD para funcionários"'
              className="text-sm"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-600 mb-1 block">Slides</label>
              <Input
                type="number"
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value))}
                min={3}
                max={15}
                className="text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-600 mb-1 block">Incluir quiz</label>
              <Button
                variant={includeQuiz ? "default" : "outline"}
                size="sm"
                className="w-full text-xs"
                onClick={() => setIncludeQuiz(!includeQuiz)}
              >
                {includeQuiz ? "✓ Sim" : "Não"}
              </Button>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || prompt.length < 10}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando curso...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Gerar Curso Completo
              </>
            )}
          </Button>

          <p className="text-[10px] text-slate-400 text-center">
            AI irá gerar {slideCount} slides com conteúdo educacional{includeQuiz ? " e quizzes" : ""}.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
