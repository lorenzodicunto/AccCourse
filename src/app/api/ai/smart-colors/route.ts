import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { safeParseBody, devLog } from "@/lib/api-utils";

// Rate limit: 10 smart colors requests per minute per IP
const smartColorsLimiter = rateLimit({ interval: 60_000, limit: 10 });

const VALID_MOODS = ["professional", "playful", "elegant", "energetic", "calm"] as const;

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  heading: string;
  success: string;
  warning: string;
  error: string;
  gradients: string[];
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const rateLimitKey = session.user.id ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const { success } = smartColorsLimiter.check(rateLimitKey);
    if (!success) {
      return NextResponse.json({ error: "Muitas requisições. Tente novamente em breve." }, { status: 429 });
    }

    const [body, errorResponse] = await safeParseBody<{ description?: string; baseColor?: string; mood?: string }>(req);
    if (errorResponse) return errorResponse;
    const { description = "", baseColor = "", mood = "professional" } = body;

    if (!(VALID_MOODS as readonly string[]).includes(mood)) {
      return NextResponse.json(
        { error: `Mood inválido. Opções: ${VALID_MOODS.join(", ")}` },
        { status: 400 }
      );
    }

    if (description && description.length > 500) {
      return NextResponse.json(
        { error: "Descrição não pode exceder 500 caracteres." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Mock fallback with predefined palettes by mood
    if (!apiKey) {
      devLog("[Smart Colors] No OPENAI_API_KEY, using mock");
      await new Promise((r) => setTimeout(r, 500));

      const mockPalettes: Record<string, ColorPalette> = {
        professional: {
          primary: "#1e40af",
          secondary: "#0f766e",
          accent: "#dc2626",
          background: "#ffffff",
          text: "#1f2937",
          heading: "#111827",
          success: "#059669",
          warning: "#f59e0b",
          error: "#dc2626",
          gradients: ["linear-gradient(135deg, #1e40af 0%, #0f766e 100%)", "linear-gradient(135deg, #1e40af 0%, #dc2626 100%)"],
        },
        playful: {
          primary: "#ec4899",
          secondary: "#8b5cf6",
          accent: "#f59e0b",
          background: "#faf5ff",
          text: "#5b21b6",
          heading: "#6d28d9",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
          gradients: ["linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)", "linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)"],
        },
        elegant: {
          primary: "#7c3aed",
          secondary: "#6366f1",
          accent: "#a78bfa",
          background: "#faf8ff",
          text: "#3f3f46",
          heading: "#1f1f23",
          success: "#059669",
          warning: "#d97706",
          error: "#dc2626",
          gradients: ["linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)", "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)"],
        },
        energetic: {
          primary: "#ff6b35",
          secondary: "#ffa500",
          accent: "#ff1744",
          background: "#fff8f3",
          text: "#ff6b35",
          heading: "#d84315",
          success: "#00c853",
          warning: "#ff9100",
          error: "#ff1744",
          gradients: ["linear-gradient(135deg, #ff6b35 0%, #ffa500 100%)", "linear-gradient(135deg, #ff1744 0%, #ff6b35 100%)"],
        },
        calm: {
          primary: "#0891b2",
          secondary: "#14b8a6",
          accent: "#06b6d4",
          background: "#f0fdfa",
          text: "#164e63",
          heading: "#0c2340",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
          gradients: ["linear-gradient(135deg, #0891b2 0%, #14b8a6 100%)", "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"],
        },
      };

      return NextResponse.json(mockPalettes[mood] || mockPalettes.professional);
    }

    const { generateObject } = await import("ai");
    const { openai } = await import("@ai-sdk/openai");
    const { z } = await import("zod");

    const moodDescriptions: Record<string, string> = {
      professional: "corporativo, confiável, formal",
      playful: "divertido, criativo, lúdico",
      elegant: "sofisticado, refinado, luxuoso",
      energetic: "vibrante, dinâmico, energético",
      calm: "tranquilo, relaxante, sereno",
    };

    const prompt = `Gere uma paleta de cores para uma plataforma de e-learning com as seguintes características:
- Mood: ${moodDescriptions[mood]}
${description ? `- Descrição: ${description}` : ""}
${baseColor ? `- Cor base a considerar: ${baseColor}` : ""}

A paleta deve incluir:
1. primary: cor principal (usar em botões principais, headers)
2. secondary: cor secundária (acentos, links)
3. accent: cor de destaque (CTAs, destaques especiais)
4. background: cor de fundo da página
5. text: cor do texto principal
6. heading: cor dos títulos
7. success: verde para mensagens de sucesso
8. warning: amarelo/laranja para avisos
9. error: vermelho para erros
10. gradients: Array com 2 gradientes CSS principais para uso decorativo

Use cores em formato hexadecimal. Retorne APENAS o JSON com as cores.`;

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: z.object({
        primary: z.string().describe("Cor primária em hexadecimal"),
        secondary: z.string().describe("Cor secundária em hexadecimal"),
        accent: z.string().describe("Cor de acento em hexadecimal"),
        background: z.string().describe("Cor de fundo em hexadecimal"),
        text: z.string().describe("Cor do texto em hexadecimal"),
        heading: z.string().describe("Cor dos títulos em hexadecimal"),
        success: z.string().describe("Cor de sucesso em hexadecimal"),
        warning: z.string().describe("Cor de aviso em hexadecimal"),
        error: z.string().describe("Cor de erro em hexadecimal"),
        gradients: z.array(z.string()).describe("Array com 2 gradientes CSS"),
      }),
      prompt,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("[Smart Colors] Error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar paleta de cores." },
      { status: 500 }
    );
  }
}

export const maxDuration = 30;
