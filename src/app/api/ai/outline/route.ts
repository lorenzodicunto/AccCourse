import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { safeParseBody, devLog } from "@/lib/api-utils";

// Rate limit: 5 outline requests per minute per IP
const outlineLimiter = rateLimit({ interval: 60_000, limit: 5 });

const VALID_STYLES = ["formal", "conversational", "interactive", "storytelling"] as const;
const VALID_LANGUAGES = ["pt-BR", "en", "es"] as const;

interface Module {
  title: string;
  description: string;
  slides: number;
  topics: string[];
  suggestedBlocks: string[];
}

interface CourseOutline {
  title: string;
  description: string;
  totalSlides: number;
  estimatedDuration: string;
  modules: Module[];
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const rateLimitKey = session.user.id ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const { success } = outlineLimiter.check(rateLimitKey);
    if (!success) {
      return NextResponse.json({ error: "Muitas requisições. Tente novamente em breve." }, { status: 429 });
    }

    const [body, errorResponse] = await safeParseBody<{
      topic?: string;
      audience?: string;
      duration?: string;
      style?: string;
      includeQuizzes?: boolean;
      includeGames?: boolean;
      language?: string;
    }>(req);
    if (errorResponse) return errorResponse;

    const {
      topic = "General Course",
      audience = "Learners",
      duration = "4 hours",
      style = "interactive",
      includeQuizzes = true,
      includeGames = true,
      language = "pt-BR",
    } = body;

    if (!topic || topic.trim().length === 0) {
      return NextResponse.json(
        { error: "Tópico do curso não pode estar vazio." },
        { status: 400 }
      );
    }

    if (topic.trim().length > 200) {
      return NextResponse.json(
        { error: "Tópico não pode exceder 200 caracteres." },
        { status: 400 }
      );
    }

    if (!(VALID_STYLES as readonly string[]).includes(style)) {
      return NextResponse.json(
        { error: `Estilo inválido. Opções: ${VALID_STYLES.join(", ")}` },
        { status: 400 }
      );
    }

    if (!(VALID_LANGUAGES as readonly string[]).includes(language)) {
      return NextResponse.json(
        { error: `Idioma inválido. Opções: ${VALID_LANGUAGES.join(", ")}` },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Mock fallback if no API key
    if (!apiKey) {
      devLog("[Course Outline] No OPENAI_API_KEY, using mock");
      await new Promise((r) => setTimeout(r, 1500));
      return NextResponse.json({
        title: `${topic} - Curso Completo`,
        description: `Um curso abrangente sobre ${topic} projetado para ${audience}.`,
        totalSlides: 12,
        estimatedDuration: duration,
        modules: [
          {
            title: "Introdução",
            description: "Conceitos fundamentais",
            slides: 3,
            topics: ["Overview", "Objetivos", "Estrutura"],
            suggestedBlocks: ["title", "text", "image"],
          },
          {
            title: "Conceitos Principais",
            description: "Aprendizado dos tópicos essenciais",
            slides: 4,
            topics: ["Tema 1", "Tema 2", "Tema 3"],
            suggestedBlocks: ["text", "image", "code"],
          },
          {
            title: "Prática",
            description: "Exercícios e atividades",
            slides: 3,
            topics: ["Exercício 1", "Exercício 2"],
            suggestedBlocks: includeQuizzes ? ["quiz"] : ["text"],
          },
          {
            title: "Conclusão",
            description: "Resumo e próximos passos",
            slides: 2,
            topics: ["Resumo", "Recursos"],
            suggestedBlocks: ["text", "button"],
          },
        ],
      });
    }

    const { generateObject } = await import("ai");
    const { openai } = await import("@ai-sdk/openai");
    const { z } = await import("zod");

    const styleDescriptions: Record<string, string> = {
      formal: "profissional, estruturado, acadêmico",
      conversational: "amigável, acessível, coloquial",
      interactive: "engajador, dinâmico, participativo",
      storytelling: "narrativo, baseado em histórias, imersivo",
    };

    const languageNames: Record<string, string> = {
      "pt-BR": "português do Brasil",
      en: "inglês",
      es: "espanhol",
    };

    const moduleSchema = z.object({
      title: z.string().describe("Título do módulo"),
      description: z.string().describe("Descrição breve do módulo"),
      slides: z.number().describe("Número de slides neste módulo"),
      topics: z.array(z.string()).describe("Lista de tópicos cobertos"),
      suggestedBlocks: z.array(z.string()).describe("Tipos de blocos sugeridos (title, text, image, quiz, code, etc)"),
    });

    const outlineSchema = z.object({
      title: z.string().describe("Título do curso"),
      description: z.string().describe("Descrição geral do curso"),
      totalSlides: z.number().describe("Total de slides estimados"),
      estimatedDuration: z.string().describe("Duração estimada do curso"),
      modules: z.array(moduleSchema).describe("Array com os módulos do curso"),
    });

    const blockSuggestions = [];
    if (includeQuizzes) blockSuggestions.push("quiz");
    if (includeGames) blockSuggestions.push("game");

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: outlineSchema,
      prompt: `Você é um especialista em design instrucional e criação de cursos e-learning.

Crie um esboço estruturado para um curso sobre: "${topic}"

Contexto:
- Público-alvo: ${audience}
- Duração estimada: ${duration}
- Estilo: ${styleDescriptions[style]}
- Idioma: ${languageNames[language]}
${includeQuizzes ? "- Incluir quizzes de avaliação" : ""}
${includeGames ? "- Incluir elementos gamificados" : ""}

Requisitos:
1. Crie entre 3-5 módulos lógicos e sequenciais
2. Cada módulo deve ter 2-4 slides
3. Total recomendado: 10-20 slides
4. Para cada módulo, sugira blocos de conteúdo apropriados
5. Inclua variedade de tipos de conteúdo
6. Mantenha a progressão do básico ao avançado

Retorne um JSON bem estruturado com os módulos do curso.`,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("[Course Outline] Error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar esboço do curso." },
      { status: 500 }
    );
  }
}

export const maxDuration = 30;
