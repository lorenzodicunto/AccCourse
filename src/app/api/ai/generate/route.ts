import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, slideCount = 5, includeQuiz = true } = await req.json();

    if (!prompt || prompt.trim().length < 10) {
      return NextResponse.json(
        { error: "Descreva o curso com pelo menos 10 caracteres." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Mock fallback
    if (!apiKey) {
      console.log("[AI Course] No OPENAI_API_KEY, using mock");
      await new Promise((r) => setTimeout(r, 2000));
      return NextResponse.json({
        title: "Curso Gerado por AI",
        description: "Curso criado automaticamente sobre: " + prompt,
        slides: [
          {
            title: "Introdução",
            blocks: [
              { type: "text", content: "<h1>Introdução</h1><p>Bem-vindo ao curso sobre " + prompt + "</p>", x: 60, y: 40, width: 840, height: 200 },
            ],
            backgroundColor: "#ffffff",
          },
          {
            title: "Conceitos Principais",
            blocks: [
              { type: "text", content: "<h2>Conceitos</h2><p>Aqui estão os conceitos principais do tema.</p>", x: 60, y: 40, width: 840, height: 250 },
            ],
            backgroundColor: "#f8fafc",
          },
          {
            title: "Quiz",
            blocks: [
              { type: "quiz", question: "Qual é o conceito principal?", options: [
                { text: "Resposta correta", isCorrect: true },
                { text: "Alternativa A", isCorrect: false },
                { text: "Alternativa B", isCorrect: false },
              ], x: 60, y: 40, width: 840, height: 300 },
            ],
            backgroundColor: "#ffffff",
          },
        ],
      });
    }

    const { generateObject } = await import("ai");
    const { openai } = await import("@ai-sdk/openai");
    const { z } = await import("zod");

    const blockSchema = z.discriminatedUnion("type", [
      z.object({
        type: z.literal("text"),
        content: z.string().describe("HTML content with h1, h2, p, ul, strong tags"),
        x: z.number(), y: z.number(), width: z.number(), height: z.number(),
      }),
      z.object({
        type: z.literal("quiz"),
        question: z.string(),
        options: z.array(z.object({ text: z.string(), isCorrect: z.boolean() })).min(2).max(5),
        x: z.number(), y: z.number(), width: z.number(), height: z.number(),
      }),
      z.object({
        type: z.literal("truefalse"),
        statement: z.string(),
        isTrue: z.boolean(),
        x: z.number(), y: z.number(), width: z.number(), height: z.number(),
      }),
    ]);

    const slideSchema = z.object({
      title: z.string(),
      blocks: z.array(blockSchema).min(1).max(4),
      backgroundColor: z.string().describe("Hex color, e.g. #ffffff"),
    });

    const courseSchema = z.object({
      title: z.string(),
      description: z.string(),
      slides: z.array(slideSchema).min(3).max(15),
    });

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: courseSchema,
      prompt: `Você é um designer instrucional expert. Crie um curso e-learning completo com base na descrição abaixo.

Descrição: ${prompt}
Número de slides: ${slideCount}
Incluir quizzes: ${includeQuiz ? "sim, ao final de cada seção" : "não"}

Regras:
- O canvas é 960x540px
- Posicione blocos com x,y,width,height dentro dessas dimensões
- Use HTML no content dos blocos de texto (h1, h2, p, ul, li, strong)
- Slide 1: título do curso + subtítulo
- Slides intermediários: conteúdo educacional
- ${includeQuiz ? "Adicione quizzes após cada 2-3 slides de conteúdo" : ""}
- Último slide: conclusão/agradecimento
- Cores de fundo suaves (#ffffff, #f8fafc, #eef2ff, etc.)
- Português do Brasil
- Conteúdo rico e educativo, não genérico`,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("[AI Course] Error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar curso" },
      { status: 500 }
    );
  }
}
