import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { safeParseBody, devLog } from "@/lib/api-utils";

// Rate limit: 10 AI quiz requests per minute per IP
const quizLimiter = rateLimit({ interval: 60_000, limit: 10 });

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const rateLimitKey = session.user.id ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const { success } = quizLimiter.check(rateLimitKey);
    if (!success) {
      return NextResponse.json({ error: "Muitas requisições. Tente novamente em breve." }, { status: 429 });
    }

    const [body, errorResponse] = await safeParseBody<{ text?: string; numQuestions?: number; types?: string[] }>(req);
    if (errorResponse) return errorResponse;
    const { text, numQuestions = 3, types = ["quiz", "truefalse"] } = body;

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        { error: "Texto muito curto. Forneça pelo menos 20 caracteres." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Mock fallback if no API key
    if (!apiKey) {
      devLog("[AI Quiz] No OPENAI_API_KEY, using mock");
      await new Promise((r) => setTimeout(r, 1500));
      return NextResponse.json({
        questions: [
          {
            type: "quiz",
            question: "Qual é o conceito principal do texto?",
            options: [
              { text: "Opção correta", isCorrect: true },
              { text: "Opção incorreta A", isCorrect: false },
              { text: "Opção incorreta B", isCorrect: false },
              { text: "Opção incorreta C", isCorrect: false },
            ],
            feedback: { correct: "Correto! 🎉", incorrect: "Incorreto. Tente novamente." },
            pointsValue: 10,
          },
          {
            type: "truefalse",
            statement: "O texto aborda um conceito importante.",
            isTrue: true,
            feedbackCorrect: "Correto! ✅",
            feedbackIncorrect: "Incorreto! ❌",
            pointsValue: 10,
          },
        ],
      });
    }

    const { generateObject } = await import("ai");
    const { openai } = await import("@ai-sdk/openai");
    const { z } = await import("zod");

    const quizOptionSchema = z.object({
      text: z.string(),
      isCorrect: z.boolean(),
    });

    const questionSchema = z.discriminatedUnion("type", [
      z.object({
        type: z.literal("quiz"),
        question: z.string(),
        options: z.array(quizOptionSchema).min(2).max(6),
        feedback: z.object({ correct: z.string(), incorrect: z.string() }),
        pointsValue: z.number().default(10),
      }),
      z.object({
        type: z.literal("truefalse"),
        statement: z.string(),
        isTrue: z.boolean(),
        feedbackCorrect: z.string(),
        feedbackIncorrect: z.string(),
        pointsValue: z.number().default(10),
      }),
    ]);

    const resultSchema = z.object({
      questions: z.array(questionSchema),
    });

    const typesList = types.join(", ");

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: resultSchema,
      prompt: `Você é um especialista em design instrucional. Com base no texto abaixo, gere ${numQuestions} perguntas de avaliação.

Tipos permitidos: ${typesList}
- "quiz": múltipla escolha com 4 opções (1 correta)
- "truefalse": afirmação verdadeira ou falsa

Regras:
- Perguntas devem cobrir os conceitos-chave do texto
- Feedback deve ser educativo e específico
- Variar os tipos de pergunta
- Usar português do Brasil
- Cada pergunta vale 10 pontos

Texto:
${text.slice(0, 3000)}`,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("[AI Quiz] Error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar quiz" },
      { status: 500 }
    );
  }
}
