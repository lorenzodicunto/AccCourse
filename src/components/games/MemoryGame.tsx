"use client";

import { useState, useCallback, useMemo } from "react";
import { RotateCcw } from "lucide-react";

interface Pair {
  id: string;
  term: string;
  match: string;
}

interface MemoryGameProps {
  pairs: Pair[];
  isPreview?: boolean;
}

interface Card {
  id: string;
  content: string;
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export function MemoryGame({ pairs, isPreview }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [gameWon, setGameWon] = useState(false);

  // Initialize cards
  const initializeGame = useCallback(() => {
    const newCards: Card[] = [];
    pairs.forEach((pair) => {
      newCards.push({
        id: `${pair.id}-term`,
        content: pair.term,
        pairId: pair.id,
        isFlipped: false,
        isMatched: false,
      });
      newCards.push({
        id: `${pair.id}-match`,
        content: pair.match,
        pairId: pair.id,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards
    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }

    setCards(newCards);
    setMoves(0);
    setMatchedPairs(0);
    setFlipped(new Set());
    setGameWon(false);
  }, [pairs]);

  // Initialize on mount
  useMemo(() => {
    if (cards.length === 0) {
      initializeGame();
    }
  }, []);

  const handleCardClick = useCallback(
    (cardId: string) => {
      if (gameWon) return;
      if (flipped.has(cardId)) return;

      const newFlipped = new Set(flipped);
      newFlipped.add(cardId);
      setFlipped(newFlipped);

      if (newFlipped.size === 2) {
        const flippedCards = Array.from(newFlipped);
        const card1 = cards.find((c) => c.id === flippedCards[0]);
        const card2 = cards.find((c) => c.id === flippedCards[1]);

        setMoves((m) => m + 1);

        if (card1 && card2 && card1.pairId === card2.pairId) {
          // Match found
          setTimeout(() => {
            setCards((prevCards) =>
              prevCards.map((card) =>
                card.id === flippedCards[0] || card.id === flippedCards[1]
                  ? { ...card, isMatched: true }
                  : card
              )
            );
            setMatchedPairs((p) => {
              const newMatchedCount = p + 1;
              if (newMatchedCount === pairs.length) {
                setGameWon(true);
              }
              return newMatchedCount;
            });
            setFlipped(new Set());
          }, 600);
        } else {
          // No match
          setTimeout(() => {
            setFlipped(new Set());
          }, 1000);
        }
      }
    },
    [flipped, cards, gameWon, pairs.length]
  );

  const gridCols = useMemo(() => {
    const count = pairs.length * 2;
    if (count <= 4) return "grid-cols-2";
    if (count <= 6) return "grid-cols-3";
    if (count <= 12) return "grid-cols-4";
    return "grid-cols-5";
  }, [pairs.length]);

  if (gameWon) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-violet-50 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Você venceu!
          </h2>
          <p className="text-gray-600 mb-6">
            Você encontrou todos os {pairs.length} pares em{" "}
            <span className="font-bold text-purple-600">{moves} movimentos</span>
          </p>
          <button
            onClick={initializeGame}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-violet-700 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Jogar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-50 to-violet-50 p-6 flex flex-col">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">Pares encontrados</p>
          <p className="text-2xl font-bold text-purple-600">
            {matchedPairs} / {pairs.length}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Movimentos</p>
          <p className="text-2xl font-bold text-purple-600">{moves}</p>
        </div>
        <button
          onClick={initializeGame}
          className="px-4 py-2 bg-white border border-purple-200 rounded-lg text-purple-600 font-semibold hover:bg-purple-50 transition-all duration-200"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Game Grid */}
      <div className={`grid ${gridCols} gap-3 flex-1 auto-rows-max`}>
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={card.isMatched || flipped.has(card.id)}
            className={`aspect-square rounded-lg font-bold text-sm transition-all duration-300 transform ${
              card.isMatched
                ? "bg-green-100 border-2 border-green-400 opacity-50"
                : flipped.has(card.id)
                ? "bg-purple-500 text-white border-2 border-purple-600"
                : "bg-purple-400 border-2 border-purple-500 hover:bg-purple-450 hover:shadow-lg text-transparent"
            }`}
            style={{
              perspective: "1000px",
              transform: flipped.has(card.id)
                ? "rotateY(0deg)"
                : "rotateY(90deg)",
            }}
          >
            <div className="w-full h-full flex items-center justify-center p-2 text-center">
              {card.content}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
