import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

// Rate limit: 5 TTS requests per minute per IP
const ttsLimiter = rateLimit({ interval: 60_000, limit: 5 });

const VALID_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const rateLimitKey = session.user.id ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const { success } = ttsLimiter.check(rateLimitKey);
    if (!success) {
      return NextResponse.json({ error: "Muitas requisições. Tente novamente em breve." }, { status: 429 });
    }

    const { text, voice = "nova", speed = 1.0 } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Texto não pode estar vazio." },
        { status: 400 }
      );
    }

    if (text.trim().length > 4096) {
      return NextResponse.json(
        { error: "Texto excede o limite de 4096 caracteres." },
        { status: 400 }
      );
    }

    if (!VALID_VOICES.includes(voice)) {
      return NextResponse.json(
        { error: `Voz inválida. Opções: ${VALID_VOICES.join(", ")}` },
        { status: 400 }
      );
    }

    if (speed < 0.25 || speed > 4.0) {
      return NextResponse.json(
        { error: "Velocidade deve estar entre 0.25 e 4.0." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Mock fallback
    if (!apiKey) {
      console.log("[TTS] No OPENAI_API_KEY, using mock");
      await new Promise((r) => setTimeout(r, 1000));
      const timestamp = Date.now();
      return NextResponse.json({
        url: `/uploads/tts_${timestamp}.mp3`,
        filename: `tts_${timestamp}.mp3`,
      });
    }

    const OpenAI = await import("openai");

    const openaiClient = new OpenAI.default({
      apiKey,
    });

    // Generate speech with OpenAI TTS
    const mp3 = await openaiClient.audio.speech.create({
      model: "tts-1",
      voice: voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
      input: text,
      speed,
    });

    // Convert response to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Save to public/uploads directory
    const isProduction = process.env.NODE_ENV === "production";
    const uploadsDir = isProduction
      ? path.join("/app", "data", "uploads")
      : path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const timestamp = Date.now();
    const filename = `tts_${timestamp}.mp3`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);

    // Return the public URL
    const url = isProduction ? `/api/uploads/${filename}` : `/uploads/${filename}`;

    return NextResponse.json({
      url,
      filename,
    });
  } catch (error) {
    console.error("[TTS] Error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar áudio de fala." },
      { status: 500 }
    );
  }
}

export const maxDuration = 30;
