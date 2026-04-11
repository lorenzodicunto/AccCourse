"use client";

import { useState, useCallback } from "react";
import { X } from "lucide-react";

interface Letter {
  letter: string;
  term: string;
  definition: string;
}

interface AlphabetGameProps {
  letters: Letter[];
  isPreview?: boolean;
}

export function AlphabetGame({ letters, isPreview }: AlphabetGameProps) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const handleLetterClick = useCallback((letter: string) => {
    setSelectedLetter(letter);
  }, []);

  const handleMarkComplete = useCallback(() => {
    if (selectedLetter) {
      const newCompleted = new Set(completed);
      newCompleted.add(selectedLetter);
      setCompleted(newCompleted);
      setSelectedLetter(null);
    }
  }, [selectedLetter, completed]);

  const handleClose = useCallback(() => {
    setSelectedLetter(null);
  }, []);

  const progress = (completed.size / letters.length) * 100;
  const selected = letters.find((l) => l.letter === selectedLetter);

  const sortedLetters = [...letters].sort((a, b) =>
    a.letter.localeCompare(b.letter)
  );

  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-50 to-violet-50 p-6 flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Dicionário Ilustrado</h1>
          <span className="text-sm font-semibold text-purple-600">
            {completed.size} de {letters.length} explorados
          </span>
        </div>
        <div className="w-full bg-purple-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-purple-600 to-violet-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Grid of Letters */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-5 gap-3 auto-rows-max">
          {sortedLetters.map((item) => {
            const isCompleted = completed.has(item.letter);
            const isSelected = selectedLetter === item.letter;

            return (
              <button
                key={item.letter}
                onClick={() => handleLetterClick(item.letter)}
                className={`relative aspect-square rounded-xl font-bold text-2xl transition-all duration-200 transform hover:scale-105 ${
                  isSelected
                    ? "bg-purple-600 text-white shadow-lg scale-105"
                    : isCompleted
                    ? "bg-green-100 text-green-700 border-2 border-green-400"
                    : "bg-white text-purple-600 border-2 border-purple-200 hover:border-purple-400 hover:shadow-md"
                }`}
              >
                {item.letter.toUpperCase()}
                {isCompleted && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal Popup */}
      {selectedLetter && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in scale-95">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>

            {/* Letter Display */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-violet-500 rounded-2xl flex items-center justify-center">
                <span className="text-5xl font-bold text-white">
                  {selected.letter.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Term and Definition */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {selected.term}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {selected.definition}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 border-2 border-purple-200 text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-colors"
              >
                Fechar
              </button>
              {!completed.has(selectedLetter) && (
                <button
                  onClick={handleMarkComplete}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-violet-700 transition-all"
                >
                  Marcar como pronto
                </button>
              )}
              {completed.has(selectedLetter) && (
                <div className="flex-1 px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-lg flex items-center justify-center">
                  ✓ Explorado
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
