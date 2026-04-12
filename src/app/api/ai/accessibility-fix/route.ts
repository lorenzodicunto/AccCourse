import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { safeParseBody, devLog } from "@/lib/api-utils";

// Rate limit: 5 accessibility fix requests per minute per IP
const a11yLimiter = rateLimit({ interval: 60_000, limit: 5 });

const VALID_FIX_TYPES = ["contrast", "alttext", "structure", "fonts", "colors", "all"] as const;

interface AccessibilityFix {
  blockId: string;
  issue: string;
  severity: "critical" | "warning" | "info";
  fixDetails: string;
  suggestedAction: string;
}

interface AccessibilityFixResponse {
  summary: string;
  totalIssues: number;
  fixes: AccessibilityFix[];
  recommendations: string[];
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const rateLimitKey = session.user.id ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const { success } = a11yLimiter.check(rateLimitKey);
    if (!success) {
      return NextResponse.json({ error: "Muitas requisições. Tente novamente em breve." }, { status: 429 });
    }

    const [body, errorResponse] = await safeParseBody<{
      courseData?: any;
      fixTypes?: string[];
    }>(req);
    if (errorResponse) return errorResponse;

    const { courseData, fixTypes = ["all"] } = body;

    if (!courseData) {
      return NextResponse.json(
        { error: "Dados do curso não fornecidos." },
        { status: 400 }
      );
    }

    // Validate fix types
    const normalizedTypes = fixTypes.includes("all") ? ["contrast", "alttext", "structure", "fonts", "colors"] : fixTypes;
    const validTypes = normalizedTypes.filter((t) => (VALID_FIX_TYPES as readonly string[]).includes(t));

    if (validTypes.length === 0) {
      return NextResponse.json(
        { error: `Tipos de correção inválidos. Opções: ${VALID_FIX_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Mock fallback if no API key
    if (!apiKey) {
      devLog("[Accessibility Fix] No OPENAI_API_KEY, using mock");
      await new Promise((r) => setTimeout(r, 1000));
      return NextResponse.json({
        summary: "Análise de acessibilidade concluída com sucesso.",
        totalIssues: 3,
        fixes: [
          {
            blockId: "block-1",
            issue: "Contraste de cores insuficiente",
            severity: "critical",
            fixDetails: "Texto cinza em fundo claro não atende WCAG AA",
            suggestedAction: "Aumentar contraste para #333333",
          },
          {
            blockId: "block-2",
            issue: "Texto alternativo ausente",
            severity: "warning",
            fixDetails: "Imagem sem descrição alt",
            suggestedAction: "Adicionar atributo alt descritivo",
          },
          {
            blockId: "block-3",
            issue: "Fonte muito pequena",
            severity: "info",
            fixDetails: "Tamanho de fonte 10px é pequeno para leitura",
            suggestedAction: "Aumentar para mínimo 12px",
          },
        ],
        recommendations: [
          "Adicionar descrições de imagens em todas as figuras",
          "Padronizar tamanhos de fonte (mínimo 12px)",
          "Usar cores de alto contraste para texto",
          "Adicionar labels em formulários interativos",
        ],
      });
    }

    const { generateObject } = await import("ai");
    const { openai } = await import("@ai-sdk/openai");
    const { z } = await import("zod");

    const fixSchema = z.object({
      blockId: z.string().describe("ID do bloco de conteúdo"),
      issue: z.string().describe("Descrição do problema de acessibilidade"),
      severity: z.enum(["critical", "warning", "info"]).describe("Severidade do problema"),
      fixDetails: z.string().describe("Detalhes técnicos do problema"),
      suggestedAction: z.string().describe("Ação sugerida para correção"),
    });

    const responseSchema = z.object({
      summary: z.string().describe("Resumo geral da análise"),
      totalIssues: z.number().describe("Total de problemas encontrados"),
      fixes: z.array(fixSchema).describe("Array com as correções de acessibilidade"),
      recommendations: z.array(z.string()).describe("Lista de recomendações gerais"),
    });

    const typesList = validTypes.join(", ");
    const courseDataStr = JSON.stringify(courseData).slice(0, 4000);

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: responseSchema,
      prompt: `Você é um especialista em acessibilidade web (WCAG 2.1).

Analise o seguinte conteúdo de curso quanto aos seguintes aspectos de acessibilidade: ${typesList}

Dados do curso (resumido):
${courseDataStr}

Verificar:
1. Contraste de cores (mínimo WCAG AA: 4.5:1 para texto)
2. Texto alternativo em imagens
3. Estrutura hierárquica de heading
4. Tamanhos de fonte legíveis (mínimo 12px)
5. Uso de cores como informação única

Para cada problema encontrado:
- Identifique o blockId (use "block-1", "block-2", etc.)
- Descreva o problema
- Categorize a severidade
- Explique o impacto técnico
- Sugira uma ação corretiva

Inclua também recomendações gerais para melhorar a acessibilidade geral.

Responda em português do Brasil.`,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("[Accessibility Fix] Error:", error);
    return NextResponse.json(
      { error: "Erro ao analisar acessibilidade." },
      { status: 500 }
    );
  }
}

export const maxDuration = 30;
