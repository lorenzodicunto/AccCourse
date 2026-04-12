import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { safeParseBody, devLog } from "@/lib/api-utils";

// Rate limit: 10 quiz generation requests per minute per IP
const quizFromContentLimiter = rateLimit({ interval: 60_000, limit: 10 });

const VALID_QUESTION_TYPES = ["multiple_choice", "true_false", "short_answer", "matching"] as const;
const VALID_DIFFICULTIES = ["easy", "medium", "hard"] as const;
const VALID_LANGUAGES = ["pt-BR", "en", "es"] as const;

interface QuizQuestion {
  type: string;
  question?: string;
  statement?: string;
  options?: Array<{ text: string; isCorrect: boolean }>;
  correctAnswer?: string;
  feedback: {
    correct: string;
    incorrect: string;
  };
  pointsValue: number;
}

interface QuizResponse {
  title: string;
  description: string;
  questions: QuizQuestion[];
  totalPoints: number;
  estimatedDuration: number;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const rateLimitKey = session.user.id ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const { success } = quizFromContentLimiter.check(rateLimitKey);
    if (!success) {
      return NextResponse.json({ error: "Muitas requisições. Tente novamente em breve." }, { status: 429 });
    }

    const [body, errorResponse] = await safeParseBody<{
      slides?: any[];
      questionTypes?: string[];
      count?: number;
      difficulty?: string;
      language?: string;
    }>(req);
    if (errorResponse) return errorResponse;

    const {
      slides = [],
      questionTypes = ["multiple_choice"],
      count = 5,
      difficulty = "medium",
      language = "pt-BR",
    } = body;

    if (!slides || slides.length === 0) {
      return NextResponse.json(
        { error: "Slides de conteúdo não fornecidos." },
        { status: 400 }
      );
    }

    if (count < 1 || count > 50) {
      return NextResponse.json(
        { error: "Contagem de questões deve estar entre 1 e 50." },
        { status: 400 }
      );
    }

    if (!(VALID_DIFFICULTIES as readonly string[]).includes(difficulty)) {
      return NextResponse.json(
        { error: `Dificuldade inválida. Opções: ${VALID_DIFFICULTIES.join(", ")}` },
        { status: 400 }
      );
    }

    if (!(VALID_LANGUAGES as readonly string[]).includes(language)) {
      return NextResponse.json(
        { error: `Idioma inválido. Opções: ${VALID_LANGUAGES.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate question types
    const validTypes = questionTypes.filter((t) => (VALID_QUESTION_TYPES as readonly string[]).includes(t));
    if (validTypes.length === 0) {
      return NextResponse.json(
        { error: `Tipos de questão inválidos. Opções: ${VALID_QUESTION_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Mock fallback if no API key
    if (!apiKey) {
      devLog("[Quiz From Content] No OPENAI_API_KEY, using mock");
      await new Promise((r) => setTimeout(r, 1200));
      return NextResponse.json({
        title: "Quiz - Avaliação do Conteúdo",
        description: "Questões geradas a partir do conteúdo dos slides",
        questions: [
          {
            type: "multiple_choice",
            question: "Qual é o conceito principal abordado?",
            options: [
              { text: "Opção correta", isCorrect: true },
              { text: "Opção incorreta A", isCorrect: false },
              { text: "Opção incorreta B", isCorrect: false },
              { text: "Opção incorreta C", isCorrect: false },
            ],
            feedback: {
              correct: "Correto! Você compreendeu bem o conceito.",
              incorrect: "Incorreto. Revise o material sobre este tópico.",
            },
            pointsValue: 10,
          },
          {
            type: "true_false",
            statement: "O conceito principal é relevante neste contexto.",
            options: [
              { text: "Verdadeiro", isCorrect: true },
              { text: "Falso", isCorrect: false },
            ],
            feedback: {
              correct: "Correto! ✅",
              incorrect: "Incorreto! ❌",
            },
            pointsValue: 5,
          },
        ],
        totalPoints: 50,
        estimatedDuration: 10,
      });
    }

    const { generateObject } = await import("ai");
    const { openai } = await import("@ai-sdk/openai");
    const { z } = await import("zod");

    const optionSchema = z.object({
      text: z.string().describe("Texto da opção"),
      isCorrect: z.boolean().describe("Se a opção está correta"),
    });

    const questionSchema = z.discriminatedUnion("type", [
      z.object({
        type: z.literal("multiple_choice"),
        question: z.string().describe("A pergunta"),
        options: z.array(optionSchema).min(2).max(6).describe("2-6 opções"),
        feedback: z.object({
          correct: z.string(),
          incorrect: z.string(),
        }),
        pointsValue: z.number().default(10),
      }),
      z.object({
        type: z.literal("true_false"),
        statement: z.string().describe("Afirmação verdadeira ou falsa"),
        options: z.array(optionSchema).length(2),
        feedback: z.object({
          correct: z.string(),
          incorrect: z.string(),
        }),
        pointsValue: z.number().default(5),
      }),
      z.object({
        type: z.literal("short_answer"),
        question: z.string().describe("A pergunta"),
        correctAnswer: z.string().describe("Resposta esperada"),
        feedback: z.object({
          correct: z.string(),
          incorrect: z.string(),
        }),
        pointsValue: z.number().default(10),
      }),
    ]);

    const responseSchema = z.object({
      title: z.string().describe("Título do quiz"),
      description: z.string().describe("Descrição breve do quiz"),
      questions: z.array(questionSchema).describe("Array com as questões"),
      totalPoints: z.number().describe("Total de pontos do quiz"),
      estimatedDuration: z.number().describe("Duração estimada em minutos"),
    });

    const languageNames: Record<string, string> = {
      "pt-BR": "português do Brasil",
      en: "inglês",
      es: "espanhol",
    };

    const difficultyNames: Record<string, string> = {
      easy: "fácil",
      medium: "médio",
      hard: "difícil",
    };

    const slidesContent = slides.map((s) => (typeof s === "string" ? s : s.content || s.title || "")).join("\n");
    const slidesPreview = slidesContent.slice(0, 3000);

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: responseSchema,
      prompt: `Você é um especialista em design instrucional e avaliação educacional.

Com base no conteúdo dos slides abaixo, gere um quiz com ${count} questões.

Parâmetros:
- Idioma: ${languageNames[language]}
- Tipos de questão: ${validTypes.join(", ")}
- Nível de dificuldade: ${difficultyNames[difficulty]}

Conteúdo dos slides:
${slidesPreview}

Requisitos:
1. Gerar exatamente ${count} questões
2. Variar entre os tipos de questão permitidos
3. Questões devem cobrir os conceitos-chave do conteúdo
4. Feedback deve ser educativo e específico
5. Variar dificuldade se solicitado
6. Cada questão deve ter pontuação apropriada
7. Estrutura bem organizada

Para questões de múltipla escolha: 4 opções (1 correta, 3 incorretas)
Para verdadeiro/falso: 2 opções (1 correta, 1 incorreta)
Para resposta curta: resposta esperada (pode ser flexível)

Retorne um JSON bem estruturado com todas as questões.`,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("[Quiz From Content] Error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar quiz do conteúdo." },
      { status: 500 }
    );
  }
}

export const maxDuration = 30;
