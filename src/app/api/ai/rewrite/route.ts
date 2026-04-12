import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { safeParseBody, devLog } from "@/lib/api-utils";

// Rate limit: 10 rewrite requests per minute per IP
const rewriteLimiter = rateLimit({ interval: 60_000, limit: 10 });

const VALID_AUDIENCES = ["children", "teenagers", "adults", "professionals", "academic"] as const;
const VALID_LEVELS = ["beginner", "intermediate", "advanced"] as const;
const VALID_TONES = ["formal", "casual", "friendly", "technical", "narrative"] as const;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const rateLimitKey = session.user.id ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const { success } = rewriteLimiter.check(rateLimitKey);
    if (!success) {
      return NextResponse.json({ error: "Muitas requisições. Tente novamente em breve." }, { status: 429 });
    }

    const [body, errorResponse] = await safeParseBody<{
      content?: string;
      targetAudience?: string;
      targetLevel?: string;
      tone?: string;
      maxLength?: number;
      preserveKeyTerms?: boolean;
    }>(req);
    if (errorResponse) return errorResponse;

    const {
      content = "",
      targetAudience = "adults",
      targetLevel = "intermediate",
      tone = "friendly",
      maxLength,
      preserveKeyTerms = true,
    } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Conteúdo não pode estar vazio." },
        { status: 400 }
      );
    }

    if (content.trim().length > 5000) {
      return NextResponse.json(
        { error: "Conteúdo não pode exceder 5000 caracteres." },
        { status: 400 }
      );
    }

    if (!(VALID_AUDIENCES as readonly string[]).includes(targetAudience)) {
      return NextResponse.json(
        { error: `Público-alvo inválido. Opções: ${VALID_AUDIENCES.join(", ")}` },
        { status: 400 }
      );
    }

    if (!(VALID_LEVELS as readonly string[]).includes(targetLevel)) {
      return NextResponse.json(
        { error: `Nível inválido. Opções: ${VALID_LEVELS.join(", ")}` },
        { status: 400 }
      );
    }

    if (!(VALID_TONES as readonly string[]).includes(tone)) {
      return NextResponse.json(
        { error: `Tom inválido. Opções: ${VALID_TONES.join(", ")}` },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Mock fallback if no API key
    if (!apiKey) {
      devLog("[Rewrite] No OPENAI_API_KEY, using mock");
      await new Promise((r) => setTimeout(r, 1000));
      // Simple mock: just capitalize if advanced level, lowercase if beginner
      const mockRewritten = targetLevel === "beginner" ? content.toLowerCase() : content.toUpperCase();
      return NextResponse.json({
        rewritten: mockRewritten.slice(0, maxLength || 5000),
        originalLength: content.length,
        rewrittenLength: mockRewritten.length,
        summary: `Conteúdo adaptado para ${targetAudience} (${targetLevel})`,
      });
    }

    const { generateText } = await import("ai");
    const { openai } = await import("@ai-sdk/openai");

    const audienceDescriptions: Record<string, string> = {
      children: "crianças (6-12 anos)",
      teenagers: "adolescentes (13-18 anos)",
      adults: "adultos em geral",
      professionals: "profissionais especializados",
      academic: "ambiente acadêmico/universitário",
    };

    const levelDescriptions: Record<string, string> = {
      beginner: "iniciante (sem conhecimento prévio)",
      intermediate: "intermediário (conhecimento básico)",
      advanced: "avançado (experiência prévia)",
    };

    const toneDescriptions: Record<string, string> = {
      formal: "formal e profissional",
      casual: "descontraído e informal",
      friendly: "amigável e acessível",
      technical: "técnico e preciso",
      narrative: "narrativo e envolvente",
    };

    const maxLengthHint = maxLength ? `\nManter a resposta com no máximo ${maxLength} caracteres.` : "";
    const preserveKeyTermsHint = preserveKeyTerms
      ? "\nPreservar terminologia técnica e conceitos-chave do texto original."
      : "";

    const prompt = `Reescreva o seguinte texto para o público-alvo especificado:

Público-alvo: ${audienceDescriptions[targetAudience]}
Nível de complexidade: ${levelDescriptions[targetLevel]}
Tom: ${toneDescriptions[tone]}${maxLengthHint}${preserveKeyTermsHint}

Texto original:
${content}

Responda APENAS com o texto reescrito, sem explicações adicionais.`;

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
    });

    const rewrittenText = text.trim();
    const finalLength = maxLength ? Math.min(rewrittenText.length, maxLength) : rewrittenText.length;

    return NextResponse.json({
      rewritten: rewrittenText.slice(0, finalLength),
      originalLength: content.length,
      rewrittenLength: rewrittenText.length,
      summary: `Conteúdo adaptado para ${audienceDescriptions[targetAudience].split("(")[0].trim()} - ${toneDescriptions[tone]}`,
    });
  } catch (error) {
    console.error("[Rewrite] Error:", error);
    return NextResponse.json(
      { error: "Erro ao reescrever conteúdo." },
      { status: 500 }
    );
  }
}

export const maxDuration = 30;
