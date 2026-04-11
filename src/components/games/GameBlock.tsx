"use client";

import { useMemo } from "react";
import { TriviaGame } from "./TriviaGame";
import { MemoryGame } from "./MemoryGame";
import { WordsGame } from "./WordsGame";
import { SwipeGame } from "./SwipeGame";
import { AlphabetGame } from "./AlphabetGame";
import { Zap, Brain, BookOpen, Hand, Layers } from "lucide-react";

interface GameBlockProps {
  gameType: string;
  gameData: any;
  isPreview?: boolean;
}

interface GameIcon {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
}

const GAME_CONFIGS: Record<string, GameIcon> = {
  trivia: {
    icon: <Zap className="w-8 h-8" />,
    label: "Quiz de Trivia",
    description: "Teste seus conhecimentos com perguntas de múltipla escolha",
    color: "from-purple-400 to-violet-400",
  },
  memory: {
    icon: <Brain className="w-8 h-8" />,
    label: "Jogo da Memória",
    description: "Encontre todos os pares combinando termos e definições",
    color: "from-violet-400 to-purple-400",
  },
  words: {
    icon: <BookOpen className="w-8 h-8" />,
    label: "Caça Palavras",
    description: "Encontre todas as palavras escondidas usando as dicas",
    color: "from-purple-500 to-violet-500",
  },
  swipe: {
    icon: <Hand className="w-8 h-8" />,
    label: "Verdadeiro ou Falso",
    description: "Deslize para indicar se a afirmação é verdadeira ou falsa",
    color: "from-violet-500 to-purple-500",
  },
  alphabet: {
    icon: <Layers className="w-8 h-8" />,
    label: "Dicionário Ilustrado",
    description: "Explore letras e descubra definições de termos",
    color: "from-purple-600 to-violet-600",
  },
};

export function GameBlock({
  gameType,
  gameData,
  isPreview = false,
}: GameBlockProps) {
  const config = GAME_CONFIGS[gameType];

  // Render preview
  if (isPreview || !gameData) {
    if (!config) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Tipo de jogo desconhecido: {gameType}</p>
        </div>
      );
    }

    return (
      <div
        className={`w-full h-full bg-gradient-to-br ${config.color} rounded-lg p-6 flex flex-col items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer`}
      >
        <div className="mb-3">{config.icon}</div>
        <h3 className="text-lg font-bold text-center mb-2">{config.label}</h3>
        <p className="text-sm text-center opacity-90">{config.description}</p>
      </div>
    );
  }

  // Render full game
  switch (gameType) {
    case "trivia":
      return (
        <TriviaGame
          questions={gameData.questions || []}
          isPreview={isPreview}
        />
      );

    case "memory":
      return (
        <MemoryGame pairs={gameData.pairs || []} isPreview={isPreview} />
      );

    case "words":
      return (
        <WordsGame
          words={gameData.words || []}
          clues={gameData.clues || []}
          isPreview={isPreview}
        />
      );

    case "swipe":
      return (
        <SwipeGame cards={gameData.cards || []} isPreview={isPreview} />
      );

    case "alphabet":
      return (
        <AlphabetGame
          letters={gameData.letters || []}
          isPreview={isPreview}
        />
      );

    default:
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Tipo de jogo desconhecido: {gameType}</p>
        </div>
      );
  }
}
