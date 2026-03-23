"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface AIQuizDialogProps {
  onInsertQuiz: (block: any) => void;
  onInsertTrueFalse: (block: any) => void;
}

export function AIQuizDialog({ onInsertQuiz, onInsertTrueFalse }: AIQuizDialogProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);

  async function handleGenerate() {
    if (text.trim().length < 20) {
      toast.error("Forneça pelo menos 20 caracteres de texto.");
      return;
    }

    setLoading(true);
    setQuestions([]);

    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, numQuestions: 3, types: ["quiz", "truefalse"] }),
      });

      if (!res.ok) throw new Error("Erro na API");

      const data = await res.json();
      setQuestions(data.questions || []);
      toast.success(`${data.questions?.length || 0} perguntas geradas!`);
    } catch (err) {
      toast.error("Erro ao gerar quiz. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleInsert(q: any) {
    if (q.type === "quiz") {
      onInsertQuiz({
        type: "quiz",
        question: q.question,
        options: q.options,
        feedbackCorrect: q.feedback?.correct || "Correto! ✅",
        feedbackIncorrect: q.feedback?.incorrect || "Tente novamente! ❌",
        pointsValue: q.pointsValue || 10,
      });
    } else if (q.type === "truefalse") {
      onInsertTrueFalse({
        type: "truefalse",
        statement: q.statement,
        isTrue: q.isTrue,
        feedbackCorrect: q.feedbackCorrect || "Correto! ✅",
        feedbackIncorrect: q.feedbackIncorrect || "Incorreto! ❌",
        pointsValue: q.pointsValue || 10,
      });
    }
    toast.success("Pergunta inserida no slide!");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7 px-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          AI Quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Gerar Quiz por AI
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Cole o conteúdo do curso para gerar perguntas:
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Cole aqui o texto do qual deseja gerar perguntas de avaliação..."
              className="min-h-[120px] text-sm"
            />
            <p className="text-[10px] text-slate-400 mt-1">{text.length} caracteres</p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || text.length < 20}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando perguntas...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Perguntas
              </>
            )}
          </Button>

          {questions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">
                {questions.length} perguntas geradas:
              </h3>
              {questions.map((q, i) => (
                <div key={i} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase mb-1 ${
                        q.type === "quiz"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {q.type === "quiz" ? "Múltipla Escolha" : "V ou F"}
                      </span>
                      <p className="text-xs text-slate-700 font-medium">
                        {q.type === "quiz" ? q.question : q.statement}
                      </p>
                      {q.type === "quiz" && (
                        <div className="mt-1 space-y-0.5">
                          {q.options?.map((opt: any, j: number) => (
                            <p key={j} className={`text-[10px] ${opt.isCorrect ? "text-emerald-600 font-semibold" : "text-slate-500"}`}>
                              {opt.isCorrect ? "✓" : "○"} {opt.text}
                            </p>
                          ))}
                        </div>
                      )}
                      {q.type === "truefalse" && (
                        <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                          Resposta: {q.isTrue ? "Verdadeiro" : "Falso"}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px] gap-1 shrink-0"
                      onClick={() => handleInsert(q)}
                    >
                      <Plus className="h-3 w-3" /> Inserir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
