import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { safeParseBody, devLog } from "@/lib/api-utils";

// Rate limit: 2 translation requests per minute per IP
const translateLimiter = rateLimit({ interval: 60_000, limit: 2 });

const SUPPORTED_LANGUAGES = {
  "pt-BR": "Português Brasileiro",
  en: "Inglês",
  es: "Espanhol",
  fr: "Francês",
  de: "Alemão",
  it: "Italiano",
  ja: "Japonês",
  ko: "Coreano",
  zh: "Chinês",
  ar: "Árabe",
  ru: "Russo",
  hi: "Hindi",
  nl: "Holandês",
  pl: "Polonês",
  sv: "Sueco",
  tr: "Turco",
  th: "Tailandês",
  vi: "Vietnamita",
  id: "Indonésio",
  cs: "Tcheco",
};

interface TextNode {
  [key: string]: any;
}

function getAllTextNodes(obj: any, paths: string[] = []): Array<{ path: string[]; value: string }> {
  const results: Array<{ path: string[]; value: string }> = [];

  const traverse = (current: any, currentPath: string[]) => {
    if (typeof current === "string" && current.trim().length > 0) {
      results.push({ path: currentPath, value: current });
    } else if (typeof current === "object" && current !== null && !Array.isArray(current)) {
      for (const [key, value] of Object.entries(current)) {
        traverse(value, [...currentPath, key]);
      }
    } else if (Array.isArray(current)) {
      current.forEach((item, index) => {
        traverse(item, [...currentPath, String(index)]);
      });
    }
  };

  traverse(obj, paths);
  return results;
}

function setNestedValue(obj: any, path: string[], value: string) {
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!(key in current)) current[key] = {};
    current = current[key];
  }
  current[path[path.length - 1]] = value;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const rateLimitKey = session.user.id ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const { success } = translateLimiter.check(rateLimitKey);
    if (!success) {
      return NextResponse.json({ error: "Muitas requisições. Tente novamente em breve." }, { status: 429 });
    }

    const [body, errorResponse] = await safeParseBody<{ courseData?: any; targetLanguage?: string; sourceLanguage?: string }>(req);
    if (errorResponse) return errorResponse;
    const { courseData, targetLanguage, sourceLanguage = "pt-BR" } = body;

    if (!courseData || typeof courseData !== "object") {
      return NextResponse.json(
        { error: "Dados do curso inválidos." },
        { status: 400 }
      );
    }

    if (!targetLanguage || !SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES]) {
      return NextResponse.json(
        { error: `Idioma alvo inválido. Idiomas suportados: ${Object.keys(SUPPORTED_LANGUAGES).join(", ")}` },
        { status: 400 }
      );
    }

    if (!SUPPORTED_LANGUAGES[sourceLanguage as keyof typeof SUPPORTED_LANGUAGES]) {
      return NextResponse.json(
        { error: `Idioma de origem inválido. Idiomas suportados: ${Object.keys(SUPPORTED_LANGUAGES).join(", ")}` },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Mock fallback
    if (!apiKey) {
      devLog("[Translate] No OPENAI_API_KEY, using mock");
      await new Promise((r) => setTimeout(r, 2000));
      return NextResponse.json(courseData);
    }

    // Get all text nodes from course data
    const textNodes = getAllTextNodes(courseData);

    if (textNodes.length === 0) {
      return NextResponse.json(courseData);
    }

    const { generateObject } = await import("ai");
    const { openai } = await import("@ai-sdk/openai");
    const { z } = await import("zod");

    // Batch translate in groups of 10 to avoid token limits
    const batchSize = 10;
    const translatedCourseData = JSON.parse(JSON.stringify(courseData));

    for (let i = 0; i < textNodes.length; i += batchSize) {
      const batch = textNodes.slice(i, i + batchSize);
      const textsToTranslate = batch.map((node) => node.value);

      const sourceLanguageName = SUPPORTED_LANGUAGES[sourceLanguage as keyof typeof SUPPORTED_LANGUAGES];
      const targetLanguageName = SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES];

      const { object } = await generateObject({
        model: openai("gpt-4o"),
        schema: z.object({
          translations: z.array(z.string()).describe("Array com os textos traduzidos na mesma ordem"),
        }),
        prompt: `Você é um tradutor profissional de conteúdo educacional. Traduza os textos a seguir do ${sourceLanguageName} para ${targetLanguage === "pt-BR" ? "Português Brasileiro" : targetLanguageName}.

Textos para traduzir:
${textsToTranslate.map((text, idx) => `${idx + 1}. ${text}`).join("\n")}

Mantenha a formatação HTML, marcadores e expressões educacionais. Retorne exatamente ${textsToTranslate.length} traduções na mesma ordem.`,
      });

      // Apply translations back to course data
      batch.forEach((node, idx) => {
        if (object.translations[idx]) {
          setNestedValue(translatedCourseData, node.path, object.translations[idx]);
        }
      });
    }

    return NextResponse.json(translatedCourseData);
  } catch (error) {
    console.error("[Translate] Error:", error);
    return NextResponse.json(
      { error: "Erro ao traduzir conteúdo." },
      { status: 500 }
    );
  }
}

export const maxDuration = 120;
