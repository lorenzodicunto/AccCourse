import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fetch from "node-fetch";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

// Rate limit: 3 image generation requests per minute per IP
const imageLimiter = rateLimit({ interval: 60_000, limit: 3 });

const VALID_STYLES = ["realistic", "illustration", "3d", "watercolor", "flat"] as const;
const VALID_SIZES = ["1024x1024", "1792x1024", "1024x1792"] as const;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const rateLimitKey = session.user.id ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const { success } = imageLimiter.check(rateLimitKey);
    if (!success) {
      return NextResponse.json({ error: "Muitas requisições. Tente novamente em breve." }, { status: 429 });
    }

    const { prompt, style = "realistic", size = "1024x1024" } = await req.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Descrição da imagem não pode estar vazia." },
        { status: 400 }
      );
    }

    if (prompt.trim().length > 4000) {
      return NextResponse.json(
        { error: "Descrição excede o limite de 4000 caracteres." },
        { status: 400 }
      );
    }

    if (!VALID_STYLES.includes(style)) {
      return NextResponse.json(
        { error: `Estilo inválido. Opções: ${VALID_STYLES.join(", ")}` },
        { status: 400 }
      );
    }

    if (!VALID_SIZES.includes(size)) {
      return NextResponse.json(
        { error: `Tamanho inválido. Opções: ${VALID_SIZES.join(", ")}` },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Mock fallback
    if (!apiKey) {
      console.log("[Image Gen] No OPENAI_API_KEY, using mock");
      await new Promise((r) => setTimeout(r, 1500));
      const timestamp = Date.now();
      return NextResponse.json({
        url: `https://placeholder.co/${size}?text=Mock+Image`,
        revisedPrompt: prompt,
      });
    }

    // Build styled prompt
    const styleDescriptions: Record<string, string> = {
      realistic: "fotografia realista, alta qualidade, profissional",
      illustration: "ilustração artística, estilo de desenho",
      "3d": "renderização 3D, estilo digital 3D",
      watercolor: "aquarela, pintura em aquarela",
      flat: "design flat, minimalista, cores sólidas",
    };

    const styledPrompt = `${prompt}. Estilo: ${styleDescriptions[style]}. Alta qualidade, detalhado.`;

    const OpenAI = await import("openai");
    const openaiClient = new OpenAI.default({
      apiKey,
    });

    // Generate image with DALL-E 3
    const response = await openaiClient.images.generate({
      model: "dall-e-3",
      prompt: styledPrompt,
      size: size as "1024x1024" | "1792x1024" | "1024x1792",
      quality: "standard",
      n: 1,
    });

    if (!response.data || response.data.length === 0) {
      return NextResponse.json(
        { error: "Falha ao gerar imagem." },
        { status: 500 }
      );
    }

    const imageUrl = response.data[0].url;
    const revisedPrompt = response.data[0].revised_prompt || styledPrompt;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "URL da imagem não foi retornada." },
        { status: 500 }
      );
    }

    // Download image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: "Falha ao baixar imagem gerada." },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(await imageResponse.arrayBuffer());

    // Save to public/uploads directory
    const isProduction = process.env.NODE_ENV === "production";
    const uploadsDir = isProduction
      ? path.join("/app", "data", "uploads")
      : path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const timestamp = Date.now();
    const filename = `ai_img_${timestamp}.png`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);

    // Return the public URL
    const url = isProduction ? `/api/uploads/${filename}` : `/uploads/${filename}`;

    return NextResponse.json({
      url,
      revisedPrompt,
    });
  } catch (error) {
    console.error("[Image Gen] Error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar imagem." },
      { status: 500 }
    );
  }
}

export const maxDuration = 60;
