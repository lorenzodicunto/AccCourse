"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Plus, Gamepad2, Brain, Type, SwatchBook, BookA } from "lucide-react";
import { toast } from "sonner";
import type { GameType, GameData } from "@/types/games";

interface AIGameDialogProps {
  onInsertGame: (block: any) => void;
}

const GAME_TYPES: { id: GameType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: "trivia",
    label: "Trivia",
    icon: <Gamepad2 className="h-4 w-4" />,
    description: "Perguntas de múltipla escolha",
  },
  {
    id: "memory",
    label: "Memória",
    icon: <Brain className="h-4 w-4" />,
    description: "Jogo de pares/memória",
  },
  {
    id: "words",
    label: "Palavras",
    icon: <Type className="h-4 w-4" />,
    description: "Adivinhar palavras por dicas",
  },
  {
    id: "swipe",
    label: "Deslizar",
    icon: <SwatchBook className="h-4 w-4" />,
    description: "Verdadeiro ou Falso",
  },
  {
    id: "alphabet",
    label: "Alfabeto",
    icon: <BookA className="h-4 w-4" />,
    description: "Termos por letra",
  },
];

const DIFFICULTIES = [
  { value: "easy", label: "Fácil" },
  { value: "medium", label: "Médio" },
  { value: "hard", label: "Difícil" },
] as const;

export function AIGameDialog({ onInsertGame }: AIGameDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedGameType, setSelectedGameType] = useState<GameType>("trivia");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [itemCount, setItemCount] = useState(8);
  const [courseContent, setCourseContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [gameData, setGameData] = useState<GameData | null>(null);

  async function handleGenerate() {
    if (courseContent.trim().length < 20) {
      toast.error("Forneça pelo menos 20 caracteres de conteúdo.");
      return;
    }

    setLoading(true);
    setGameData(null);

    try {
      const res = await fetch("/api/ai/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseContent,
          gameType: selectedGameType,
          difficulty,
          itemCount,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erro na API");
      }

      const data = await res.json();
      setGameData(data);
      toast.success("Jogo gerado com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar jogo. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleInsert() {
    if (!gameData) return;

    onInsertGame({
      type: "game",
      gameType: selectedGameType,
      gameData,
      difficulty,
    });

    toast.success("Jogo inserido no slide!");
    setOpen(false);
    setCourseContent("");
    setGameData(null);
    setItemCount(8);
    setDifficulty("medium");
    setSelectedGameType("trivia");
  }

  const gameTypeLabel =
    GAME_TYPES.find((g) => g.id === selectedGameType)?.label || "Trivia";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7 px-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          AI Games
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Gerar Jogo por AI
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Content Textarea */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Cole o conteúdo do curso para gerar o jogo:
            </label>
            <Textarea
              value={courseContent}
              onChange={(e) => setCourseContent(e.target.value)}
              placeholder="Cole aqui o texto sobre o qual deseja gerar um jogo educativo..."
              className="min-h-[100px] text-sm"
            />
            <p className="text-[10px] text-slate-400 mt-1">{courseContent.length} caracteres</p>
          </div>

          {/* Game Type Selector */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">
              Tipo de Jogo:
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {GAME_TYPES.map((gameType) => (
                <button
                  key={gameType.id}
                  onClick={() => setSelectedGameType(gameType.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                    selectedGameType === gameType.id
                      ? "border-amber-500 bg-amber-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  {gameType.icon}
                  <span className="text-[10px] font-medium text-center">{gameType.label}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {GAME_TYPES.find((g) => g.id === selectedGameType)?.description}
            </p>
          </div>

          {/* Difficulty Selector */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">
              Dificuldade:
            </label>
            <div className="flex gap-2">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff.value}
                  onClick={() => setDifficulty(diff.value)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    difficulty === diff.value
                      ? "bg-amber-500 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Item Count Input */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Quantidade de Itens: {itemCount}
            </label>
            <input
              type="range"
              min="5"
              max="20"
              value={itemCount}
              onChange={(e) => setItemCount(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex gap-2 text-[10px] text-slate-500 mt-1">
              <span>Mínimo: 5</span>
              <span>Máximo: 20</span>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading || courseContent.length < 20}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando {gameTypeLabel.toLowerCase()}...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar {gameTypeLabel}
              </>
            )}
          </Button>

          {/* Generated Game Preview */}
          {gameData && (
            <div className="space-y-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-emerald-900">
                  {gameTypeLabel} gerado com sucesso
                </h3>
                <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-200 text-emerald-900">
                  {difficulty === "easy" ? "Fácil" : difficulty === "medium" ? "Médio" : "Difícil"}
                </span>
              </div>

              {/* Preview based on game type */}
              <div className="text-xs text-emerald-800 space-y-1">
                {selectedGameType === "trivia" && "questions" in gameData && (
                  <div>
                    <p className="font-semibold mb-1">
                      {gameData.questions.length} pergunta(s):
                    </p>
                    {gameData.questions.slice(0, 2).map((q, i) => (
                      <div key={i} className="text-[10px] text-emerald-700 mb-1">
                        <p className="font-medium truncate">
                          {i + 1}. {q.question}
                        </p>
                      </div>
                    ))}
                    {gameData.questions.length > 2 && (
                      <p className="text-[10px] text-emerald-600">
                        ... e {gameData.questions.length - 2} pergunta(s) a mais
                      </p>
                    )}
                  </div>
                )}

                {selectedGameType === "memory" && "pairs" in gameData && (
                  <div>
                    <p className="font-semibold mb-1">{gameData.pairs.length} par(es):</p>
                    {gameData.pairs.slice(0, 2).map((p, i) => (
                      <div key={i} className="text-[10px] text-emerald-700 mb-1">
                        <p>{p.term} ↔ {p.match}</p>
                      </div>
                    ))}
                    {gameData.pairs.length > 2 && (
                      <p className="text-[10px] text-emerald-600">
                        ... e {gameData.pairs.length - 2} par(es) a mais
                      </p>
                    )}
                  </div>
                )}

                {selectedGameType === "words" && "words" in gameData && (
                  <div>
                    <p className="font-semibold mb-1">{gameData.words.length} palavra(s):</p>
                    <p className="text-[10px] text-emerald-700">
                      {gameData.words.slice(0, 5).join(", ")}
                      {gameData.words.length > 5 && "..."}
                    </p>
                  </div>
                )}

                {selectedGameType === "swipe" && "cards" in gameData && (
                  <div>
                    <p className="font-semibold mb-1">{gameData.cards.length} cartão(ões):</p>
                    {gameData.cards.slice(0, 2).map((c, i) => (
                      <div key={i} className="text-[10px] text-emerald-700 mb-1">
                        <p>
                          {c.isTrue ? "✓" : "✗"} {c.statement.substring(0, 50)}...
                        </p>
                      </div>
                    ))}
                    {gameData.cards.length > 2 && (
                      <p className="text-[10px] text-emerald-600">
                        ... e {gameData.cards.length - 2} cartão(ões) a mais
                      </p>
                    )}
                  </div>
                )}

                {selectedGameType === "alphabet" && "letters" in gameData && (
                  <div>
                    <p className="font-semibold mb-1">{gameData.letters.length} letra(s):</p>
                    <p className="text-[10px] text-emerald-700">
                      {gameData.letters.map((l) => l.letter).join(", ")}
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleInsert}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Inserir no slide
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
