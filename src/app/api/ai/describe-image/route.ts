import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { safeParseBody, devLog } from "@/lib/api-utils";

// Rate limit: 10 image description requests per minute per IP
const describeLimiter = rateLimit({ interval: 60_000, limit: 10 });

const VALID_LANGUAGES = ["pt-BR", "en", "es"] as const;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const rateLimitKey = session.user.id ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const { success } = describeLimiter.check(rateLimitKey);
    if (!success) {
      return NextResponse.json({ error: "Muitas requisições. Tente novamente em breve." }, { status: 429 });
    }

    const [body, errorResponse] = await safeParseBody<{
      imageUrl?: string;
      context?: string;
      language?: string;
      maxLength?: number;
    }>(req);
    if (errorResponse) return errorResponse;

    const { imageUrl = "", context = "", language = "pt-BR", maxLength = 200 } = body;

    if (!imageUrl || imageUrl.trim().length === 0) {
      return NextResponse.json(
        { error: "URL da imagem não pode estar vazia." },
        { status: 400 }
      );
    }

    if (!(VALID_LANGUAGES as readonly string[]).includes(language)) {
      return NextResponse.json(
        { error: `Idioma inválido. Opções: ${VALID_LANGUAGES.join(", ")}` },
        { status: 400 }
      );
    }

    if (maxLength < 50 || maxLength > 500) {
      return NextResponse.json(
        { error: "Comprimento máximo deve estar entre 50 e 500 caracteres." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Mock fallback if no API key
    if (!apiKey) {
      devLog("[Describe Image] No OPENAI_API_KEY, using mock");
      await new Promise((r) => setTimeout(r, 800));
      const mockDescriptions: Record<string, string> = {
        "pt-BR": "Imagem descritiva mostrando o conteúdo visual relevante para o contexto do curso.",
        en: "A descriptive image showing visual content relevant to the course context.",
        es: "Una imagen descriptiva que muestra contenido visual relevante para el contexto del curso.",
      };
      return NextResponse.json({
        description: mockDescriptions[language],
        length: mockDescriptions[language].length,
        imageUrl,
      });
    }

    const { generateText } = await import("ai");
    const { openai } = await import("@ai-sdk/openai");

    const languageNames: Record<string, string> = {
      "pt-BR": "português do Brasil",
      en: "inglês",
      es: "espanhol",
    };

    const contextHint = context ? `\nContexto adicional: ${context}` : "";

    const prompt = `Analise a imagem fornecida e gere uma descrição alternativa (alt text) clara e concisa.

Requisitos:
- Idioma: ${languageNames[language]}
- Comprimento máximo: ${maxLength} caracteres
- Deve ser descritiva mas concisa
- Apropriada para fins de acessibilidade
- Não incluir "imagem de" ou "foto de" no início
${contextHint}

Retorne APENAS a descrição, sem explicações adicionais.`;

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: new URL(imageUrl),
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    const description = text.trim();
    const finalDescription = description.length > maxLength ? description.slice(0, maxLength).trim() : description;

    return NextResponse.json({
      description: finalDescription,
      length: finalDescription.length,
      imageUrl,
    });
  } catch (error) {
    console.error("[Describe Image] Error:", error);
    return NextResponse.json(
      { error: "Erro ao descrever imagem." },
      { status: 500 }
    );
  }
}

export const maxDuration = 30;
