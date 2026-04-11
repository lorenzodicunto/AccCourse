export interface TriviaGameData {
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface MemoryGameData {
  pairs: {
    id: string;
    term: string;
    match: string;
  }[];
}

export interface WordsGameData {
  words: string[];
  clues: {
    word: string;
    clue: string;
  }[];
}

export interface SwipeGameData {
  cards: {
    statement: string;
    isTrue: boolean;
    explanation: string;
  }[];
}

export interface AlphabetGameData {
  letters: {
    letter: string;
    term: string;
    definition: string;
  }[];
}

export type GameType = "trivia" | "memory" | "words" | "swipe" | "alphabet";

export type GameData =
  | TriviaGameData
  | MemoryGameData
  | WordsGameData
  | SwipeGameData
  | AlphabetGameData;

export interface GameBlock {
  type: "game";
  gameType: GameType;
  gameData: GameData;
  difficulty: "easy" | "medium" | "hard";
}
