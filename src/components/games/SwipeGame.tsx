"use client";

import { useState, useCallback, useRef } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface Card {
  statement: string;
  isTrue: boolean;
  explanation: string;
}

interface SwipeGameProps {
  cards: Card[];
  isPreview?: boolean;
}

export function SwipeGame({ cards, isPreview }: SwipeGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<boolean | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);

  const current = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  const handleAnswer = useCallback(
    (answer: boolean) => {
      const isCorrect = answer === current.isTrue;
      setLastAnswer(answer);
      setShowExplanation(true);

      if (isCorrect) {
        setScore((s) => s + 1);
      }

      setTimeout(() => {
        if (currentIndex < cards.length - 1) {
          setCurrentIndex((i) => i + 1);
          setDragX(0);
          setShowExplanation(false);
          setLastAnswer(null);
        } else {
          setGameFinished(true);
        }
      }, 2000);
    },
    [currentIndex, cards.length, current.isTrue]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const diff = e.clientX - startXRef.current;
    setDragX(diff);
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    const threshold = 100;
    if (Math.abs(dragX) > threshold) {
      handleAnswer(dragX > 0); // Right = True, Left = False
    } else {
      setDragX(0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startXRef.current;
    setDragX(diff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const threshold = 100;
    if (Math.abs(dragX) > threshold) {
      handleAnswer(dragX > 0);
    } else {
      setDragX(0);
    }
  };

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setDragX(0);
    setShowExplanation(false);
    setGameFinished(false);
    setLastAnswer(null);
  }, []);

  if (gameFinished) {
    const percentage = (score / cards.length) * 100;
    let emoji = "😢";
    if (percentage >= 80) emoji = "🎉";
    else if (percentage >= 60) emoji = "😊";
    else if (percentage >= 40) emoji = "🤔";

    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-violet-50 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">{emoji}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Fim do Jogo!
          </h2>
          <p className="text-gray-600 mb-6">
            Você acertou{" "}
            <span className="font-bold text-purple-600">
              {score} de {cards.length}
            </span>{" "}
            afirmações
          </p>
          <div className="bg-gradient-to-r from-purple-400 to-violet-400 rounded-xl p-4 mb-6">
            <div className="text-4xl font-bold text-white">{Math.round(percentage)}%</div>
          </div>
          <button
            onClick={handleRestart}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-violet-700 transition-all duration-200"
          >
            Jogar novamente
          </button>
        </div>
      </div>
    );
  }

  const dragPercent = (dragX / (containerRef.current?.clientWidth || 1)) * 100;
  const dragColor =
    dragX > 0
      ? `rgb(34, 197, 94, ${Math.min(Math.abs(dragX) / 150, 0.5)})`
      : `rgb(239, 68, 68, ${Math.min(Math.abs(dragX) / 150, 0.5)})`;

  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-50 to-violet-50 p-6 flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-semibold text-purple-600">
            Afirmação {currentIndex + 1} de {cards.length}
          </span>
          <span className="text-sm font-semibold text-purple-600">
            Acertos: {score}
          </span>
        </div>
        <div className="w-full bg-purple-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-600 to-violet-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Draggable Card */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        <div
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 transition-all duration-100 select-none"
          style={{
            transform: `translateX(${dragX}px) rotateZ(${dragX * 0.05}deg)`,
            backgroundColor: dragColor ? `rgba(255,255,255,0.95)` : "white",
          }}
        >
          <div className="text-center mb-8">
            <p className="text-3xl font-bold text-gray-900 leading-relaxed">
              {current.statement}
            </p>
          </div>

          {/* Drag Indicators */}
          <div className="flex justify-between items-end mb-6">
            <div
              className={`flex flex-col items-center opacity-0 transition-opacity ${
                dragX < -50 ? "opacity-100" : ""
              }`}
            >
              <ThumbsDown className="w-6 h-6 text-red-600 mb-1" />
              <span className="text-sm font-semibold text-red-600">Falso</span>
            </div>
            <div
              className={`flex flex-col items-center opacity-0 transition-opacity ${
                dragX > 50 ? "opacity-100" : ""
              }`}
            >
              <ThumbsUp className="w-6 h-6 text-green-600 mb-1" />
              <span className="text-sm font-semibold text-green-600">Verdadeiro</span>
            </div>
          </div>

          {/* Instructions */}
          {!showExplanation && (
            <p className="text-center text-gray-500 text-sm">
              Deslize para a direita = Verdadeiro | Deslize para a esquerda = Falso
            </p>
          )}

          {/* Explanation */}
          {showExplanation && (
            <div
              className={`mt-6 p-4 rounded-lg border-l-4 ${
                lastAnswer === current.isTrue
                  ? "bg-green-50 border-l-green-400 text-green-900"
                  : "bg-red-50 border-l-red-400 text-red-900"
              }`}
            >
              <p className="font-semibold mb-1">
                {lastAnswer === current.isTrue ? "Correto! ✓" : "Incorreto!"}
              </p>
              <p className="text-sm">{current.explanation}</p>
            </div>
          )}
        </div>
      </div>

      {/* Button Controls */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => handleAnswer(false)}
          className="flex-1 bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <ThumbsDown className="w-5 h-5" />
          Falso
        </button>
        <button
          onClick={() => handleAnswer(true)}
          className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <ThumbsUp className="w-5 h-5" />
          Verdadeiro
        </button>
      </div>
    </div>
  );
}
