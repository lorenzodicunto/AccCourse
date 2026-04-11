import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import type { GameType, GameData } from "@/types/games";

// Rate limit: 10 AI game requests per minute per IP
const gameLimiter = rateLimit({ interval: 60_000, limit: 10 });

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const { success } = gameLimiter.check(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Muitas requisições. Tente novamente em breve." },
        { status: 429 }
      );
    }

    const {
      courseContent,
      gameType,
      difficulty = "medium",
      itemCount = 5,
    } = await req.json();

    if (!courseContent || courseContent.trim().length < 20) {
      return NextResponse.json(
        { error: "Conteúdo muito curto. Forneça pelo menos 20 caracteres." },
        { status: 400 }
      );
    }

    if (!gameType || !["trivia", "memory", "words", "swipe", "alphabet"].includes(gameType)) {
      return NextResponse.json(
        { error: "Tipo de jogo inválido." },
        { status: 400 }
      );
    }

    if (itemCount < 5 || itemCount > 20) {
      return NextResponse.json(
        { error: "Quantidade de itens deve estar entre 5 e 20." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Mock fallback if no API key
    if (!apiKey) {
      console.log("[AI Games] No OPENAI_API_KEY, using mock");
      await new Promise((r) => setTimeout(r, 1500));
      return NextResponse.json(generateMockGameData(gameType, itemCount, difficulty));
    }

    const { generateObject } = await import("ai");
    const { openai } = await import("@ai-sdk/openai");
    const { z } = await import("zod");

    let schema: any;
    let prompt: string;

    if (gameType === "trivia") {
      schema = z.object({
        questions: z.array(
          z.object({
            question: z.string(),
            options: z.array(z.string()).length(4),
            correctIndex: z.number().min(0).max(3),
            explanation: z.string(),
          })
        ),
      });

      prompt = `Você é um especialista em design instrucional. Com base no texto abaixo, gere ${itemCount} perguntas de trivia educativas sobre os conceitos principais.

Dificuldade: ${difficulty === "easy" ? "Fácil - perguntas diretas" : difficulty === "medium" ? "Média - requer compreensão" : "Difícil - requer análise profunda"}

Regras:
- Cada pergunta deve ter exatamente 4 opções
- Uma e apenas uma opção deve estar correta
- Incluir explicação educativa para cada pergunta
- Perguntas devem cobrir os conceitos-chave do texto
- Usar português do Brasil
- Variação de tópicos dentro do texto

Texto:
${courseContent.slice(0, 3000)}`;
    } else if (gameType === "memory") {
      schema = z.object({
        pairs: z.array(
          z.object({
            id: z.string(),
            term: z.string(),
            match: z.string(),
          })
        ),
      });

      prompt = `Você é um especialista em design instrucional. Com base no texto abaixo, crie ${itemCount} pares de memória (termo + definição ou conceito + exemplo).

Dificuldade: ${difficulty === "easy" ? "Fácil - definições óbvias" : difficulty === "medium" ? "Média - definições mais específicas" : "Difícil - definições complexas"}

Regras:
- Cada par deve ter um ID único (ex: "pair_1", "pair_2")
- "term" deve ser conciso (máx 30 caracteres)
- "match" deve ser a correspondência correta (máx 60 caracteres)
- Usar português do Brasil
- Evitar ambiguidades

Texto:
${courseContent.slice(0, 3000)}`;
    } else if (gameType === "words") {
      schema = z.object({
        words: z.array(z.string()),
        clues: z.array(
          z.object({
            word: z.string(),
            clue: z.string(),
          })
        ),
      });

      prompt = `Você é um especialista em design instrucional. Com base no texto abaixo, crie um jogo de palavras com ${itemCount} palavras-chave e suas dicas de adivinhar.

Dificuldade: ${difficulty === "easy" ? "Fácil - dicas bem diretas" : difficulty === "medium" ? "Média - dicas moderadas" : "Difícil - dicas enigmáticas"}

Regras:
- Cada palavra deve ser uma palavra-chave importante do texto (máx 20 caracteres)
- Cada dica deve ser uma descrição que leva à palavra (máx 80 caracteres)
- Usar português do Brasil
- Palavras devem ser soletrável

Texto:
${courseContent.slice(0, 3000)}`;
    } else if (gameType === "swipe") {
      schema = z.object({
        cards: z.array(
          z.object({
            statement: z.string(),
            isTrue: z.boolean(),
            explanation: z.string(),
          })
        ),
      });

      prompt = `Você é um especialista em design instrucional. Com base no texto abaixo, crie ${itemCount} afirmações para um jogo de deslizar (Verdadeiro/Falso com explicações).

Dificuldade: ${difficulty === "easy" ? "Fácil - afirmações óbvias" : difficulty === "medium" ? "Média - requer atenção" : "Difícil - afirmações sutis"}

Regras:
- Cada afirmação deve ser clara e específica
- Incluir explicação para cada resposta
- Aproximadamente 50% verdadeiras e 50% falsas
- Usar português do Brasil
- Explicações devem ser educativas

Texto:
${courseContent.slice(0, 3000)}`;
    } else if (gameType === "alphabet") {
      schema = z.object({
        letters: z.array(
          z.object({
            letter: z.string().length(1),
            term: z.string(),
            definition: z.string(),
          })
        ),
      });

      prompt = `Você é um especialista em design instrucional. Com base no texto abaixo, crie um jogo de alfabeto com ${itemCount} letras, termos e definições relacionados ao conteúdo.

Dificuldade: ${difficulty === "easy" ? "Fácil - termos comuns" : difficulty === "medium" ? "Média - termos técnicos conhecidos" : "Difícil - termos técnicos complexos"}

Regras:
- Cada entrada deve ter uma letra (A-Z), um termo e uma definição
- Termos devem iniciar com a letra correspondente (máx 25 caracteres)
- Definições devem ser concisas (máx 80 caracteres)
- Usar português do Brasil
- Cobrir conceitos-chave do texto

Texto:
${courseContent.slice(0, 3000)}`;
    }

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema,
      prompt,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("[AI Games] Error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar jogo" },
      { status: 500 }
    );
  }
}

function generateMockGameData(
  gameType: GameType,
  itemCount: number,
  difficulty: string
): GameData {
  if (gameType === "trivia") {
    return {
      questions: Array.from({ length: itemCount }, (_, i) => ({
        question: `Qual é o conceito principal do tema ${i + 1}?`,
        options: [
          "Opção correta do conceito",
          "Opção incorreta A",
          "Opção incorreta B",
          "Opção incorreta C",
        ],
        correctIndex: 0,
        explanation: "Esta é a opção correta porque representa o conceito-chave discutido no texto.",
      })),
    };
  } else if (gameType === "memory") {
    return {
      pairs: Array.from({ length: itemCount }, (_, i) => ({
        id: `pair_${i + 1}`,
        term: `Termo ${i + 1}`,
        match: `Definição ou equivalente do termo ${i + 1}`,
      })),
    };
  } else if (gameType === "words") {
    return {
      words: Array.from({ length: itemCount }, (_, i) => `Palavra${i + 1}`),
      clues: Array.from({ length: itemCount }, (_, i) => ({
        word: `Palavra${i + 1}`,
        clue: `Esta é uma dica para a palavra ${i + 1} do nosso jogo educativo`,
      })),
    };
  } else if (gameType === "swipe") {
    return {
      cards: Array.from({ length: itemCount }, (_, i) => ({
        statement: i % 2 === 0
          ? `Este é um conceito verdadeiro sobre o tema ${i + 1}`
          : `Este é um conceito falso sobre o tema ${i + 1}`,
        isTrue: i % 2 === 0,
        explanation: `Explicação educativa sobre por que esta afirmação é ${i % 2 === 0 ? "verdadeira" : "falsa"}.`,
      })),
    };
  } else if (gameType === "alphabet") {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    return {
      letters: Array.from({ length: Math.min(itemCount, 26) }, (_, i) => ({
        letter: letters[i],
        term: `${letters[i]}breviação ou termo com ${letters[i]}`,
        definition: `Definição relacionada ao termo que começa com ${letters[i]}`,
      })),
    };
  }

  return { questions: [] };
}
