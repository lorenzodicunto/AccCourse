"use client";

import { useState, useCallback } from "react";
import { Check, X } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface TriviaGameProps {
  questions: Question[];
  isPreview?: boolean;
}

export function TriviaGame({ questions, isPreview }: TriviaGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  const current = questions[currentIndex];
  const isCorrect = selectedIndex === current.correctIndex;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSelectOption = useCallback(
    (index: number) => {
      if (answered) return;
      setSelectedIndex(index);
      setAnswered(true);

      if (index === current.correctIndex) {
        setScore((s) => s + 1);
      }
    },
    [answered, current.correctIndex]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedIndex(null);
      setAnswered(false);
    } else {
      setGameFinished(true);
    }
  }, [currentIndex, questions.length]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedIndex(null);
    setAnswered(false);
    setGameFinished(false);
  }, []);

  if (gameFinished) {
    const percentage = (score / questions.length) * 100;
    let emoji = "😢";
    if (percentage >= 80) emoji = "🎉";
    else if (percentage >= 60) emoji = "😊";
    else if (percentage >= 40) emoji = "🤔";

    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-violet-50 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">{emoji}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Parabéns!
          </h2>
          <p className="text-gray-600 mb-6">
            Você acertou{" "}
            <span className="font-bold text-purple-600">
              {score} de {questions.length}
            </span>{" "}
            questões
          </p>
          <div className="bg-gradient-to-r from-purple-400 to-violet-400 rounded-xl p-4 mb-6">
            <div className="text-4xl font-bold text-white">{Math.round(percentage)}%</div>
          </div>
          <button
            onClick={handleRestart}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-violet-700 transition-all duration-200"
          >
            Fazer novamente
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
            Questão {currentIndex + 1} de {questions.length}
          </span>
          <span className="text-sm font-semibold text-purple-600">
            Pontuação: {score}
          </span>
        </div>
        <div className="w-full bg-purple-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-600 to-violet-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8 flex-1 flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          {current.question}
        </h2>

        {/* Options */}
        <div className="grid grid-cols-1 gap-4">
          {current.options.map((option, index) => {
            const isSelected = selectedIndex === index;
            const showResult = answered && isSelected;
            const isOptionCorrect = index === current.correctIndex;

            return (
              <button
                key={index}
                onClick={() => handleSelectOption(index)}
                disabled={answered}
                className={`relative p-4 rounded-lg font-semibold text-left transition-all duration-200 border-2 ${
                  answered
                    ? isOptionCorrect
                      ? "bg-green-50 border-green-400 text-green-900"
                      : isSelected
                      ? "bg-red-50 border-red-400 text-red-900"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                    : isSelected
                    ? "bg-purple-100 border-purple-500 text-purple-900"
                    : "bg-white border-purple-200 text-gray-900 hover:border-purple-400 hover:bg-purple-50"
                } ${answered ? "cursor-default" : "cursor-pointer"}`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showResult && (
                    <div className="ml-2">
                      {isCorrect ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <X className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  )}
                  {answered && isOptionCorrect && !isSelected && (
                    <Check className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {answered && (
          <div
            className={`mt-6 p-4 rounded-lg border-l-4 ${
              isCorrect
                ? "bg-green-50 border-l-green-400 text-green-900"
                : "bg-blue-50 border-l-blue-400 text-blue-900"
            }`}
          >
            <p className="font-semibold mb-1">
              {isCorrect ? "Correto! ✓" : "Resposta correta:"}
            </p>
            <p className="text-sm">{current.explanation}</p>
          </div>
        )}
      </div>

      {/* Next Button */}
      {answered && (
        <button
          onClick={handleNext}
          className="mt-6 w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-violet-700 transition-all duration-200"
        >
          {currentIndex === questions.length - 1 ? "Ver Resultado" : "Próxima"}
        </button>
      )}
    </div>
  );
}
