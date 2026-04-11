"use client";

import { useState, useCallback } from "react";
import { Check, X } from "lucide-react";

interface Clue {
  word: string;
  clue: string;
}

interface WordsGameProps {
  words: string[];
  clues: Clue[];
  isPreview?: boolean;
}

export function WordsGame({ words, clues, isPreview }: WordsGameProps) {
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [currentInput, setCurrentInput] = useState("");
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error" | null;
  }>({ message: "", type: null });
  const [gameWon, setGameWon] = useState(false);

  const handleSubmit = useCallback(() => {
    const normalizedInput = currentInput.toLowerCase().trim();
    const found = words.find(
      (w) => w.toLowerCase() === normalizedInput
    );

    if (found) {
      if (foundWords.has(found)) {
        setFeedback({ message: "Você já encontrou essa palavra!", type: "error" });
      } else {
        const newFound = new Set(foundWords);
        newFound.add(found);
        setFoundWords(newFound);

        setFeedback({ message: "Acertou! ✓", type: "success" });
        setCurrentInput("");

        if (newFound.size === words.length) {
          setTimeout(() => setGameWon(true), 300);
        }
      }
    } else {
      setFeedback({
        message: "Palavra não encontrada. Tente novamente!",
        type: "error",
      });
    }

    setTimeout(() => setFeedback({ message: "", type: null }), 2000);
  }, [currentInput, foundWords, words]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && currentInput.trim()) {
        handleSubmit();
      }
    },
    [currentInput, handleSubmit]
  );

  const progress = (foundWords.size / words.length) * 100;

  if (gameWon) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-violet-50 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Parabéns!
          </h2>
          <p className="text-gray-600 mb-6">
            Você encontrou todas as{" "}
            <span className="font-bold text-purple-600">{words.length}</span>{" "}
            palavras!
          </p>
          <button
            onClick={() => {
              setFoundWords(new Set());
              setCurrentInput("");
              setGameWon(false);
              setFeedback({ message: "", type: null });
            }}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-violet-700 transition-all duration-200"
          >
            Jogar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-50 to-violet-50 p-6 flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-semibold text-purple-600">
            Palavras encontradas: {foundWords.size} de {words.length}
          </span>
        </div>
        <div className="w-full bg-purple-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-600 to-violet-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Clues List */}
        <div className="w-1/3 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Dicas:</h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {clues.map((clueItem) => {
              const isFound = foundWords.has(clueItem.word);
              return (
                <div
                  key={clueItem.word}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    isFound
                      ? "bg-green-50 border-green-400"
                      : "bg-white border-purple-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {isFound && (
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">
                        {isFound ? clueItem.word : "?"}
                      </p>
                      <p className="text-xs text-gray-600">{clueItem.clue}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Input Section */}
        <div className="w-2/3 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Digite as palavras:</h3>

          {/* Feedback Message */}
          {feedback.message && (
            <div
              className={`mb-4 p-3 rounded-lg font-semibold text-sm flex items-center gap-2 ${
                feedback.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-400"
                  : "bg-red-100 text-red-800 border border-red-400"
              }`}
            >
              {feedback.type === "success" ? (
                <Check className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
              {feedback.message}
            </div>
          )}

          {/* Input Field */}
          <div className="mb-4">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite uma palavra aqui..."
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 bg-white text-gray-900 placeholder-gray-500"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!currentInput.trim()}
            className="mb-6 w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Verificar
          </button>

          {/* Found Words Display */}
          <div className="flex-1 overflow-y-auto">
            <p className="text-sm font-semibold text-gray-600 mb-2">
              Palavras encontradas:
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from(foundWords).map((word) => (
                <div
                  key={word}
                  className="bg-gradient-to-r from-green-400 to-green-500 text-white px-4 py-2 rounded-full font-semibold text-sm"
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
