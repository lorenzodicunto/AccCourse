import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

// Maximum file size: 100MB (for video support)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Rate limit: 20 uploads per minute per IP
const uploadLimiter = rateLimit({ interval: 60_000, limit: 20 });

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const { success } = uploadLimiter.check(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Muitas requisições. Tente novamente em breve." },
        { status: 429 }
      );
    }

    // Verify authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo fornecido" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Arquivo muito grande. Máximo permitido: ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 413 }
      );
    }

    // Validate file type (images, fonts, video, and audio)
    const allowedTypes = [
      // Images
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      // Fonts
      "font/ttf",
      "font/woff2",
      "application/x-font-ttf",
      "application/font-woff2",
      // Audio
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/mp4",
      "audio/flac",
      "audio/aac",
      // Video
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
    ];

    const ext = path.extname(file.name).toLowerCase();
    const fontExtensions = [".ttf", ".woff2"];
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const audioExtensions = [".mp3", ".wav", ".ogg", ".m4a", ".flac", ".aac"];
    const videoExtensions = [".mp4", ".webm", ".mov", ".avi"];
    const allowedExtensions = [
      ...fontExtensions,
      ...imageExtensions,
      ...audioExtensions,
      ...videoExtensions,
    ];

    if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(ext)) {
      return NextResponse.json(
        {
          error:
            "Tipo de arquivo não permitido. Aceitos: imagens (jpg, png, gif, webp, svg), fontes (ttf, woff2), áudio (mp3, wav, ogg, m4a, flac, aac) e vídeo (mp4, webm, mov, avi).",
        },
        { status: 400 }
      );
    }

    // Use /app/data/uploads in production (persistent volume), public/uploads locally
    const isProduction = process.env.NODE_ENV === "production";
    const uploadsDir = isProduction
      ? path.join("/app", "data", "uploads")
      : path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const uniqueId = crypto.randomUUID();
    const fileName = `${uniqueId}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Return the public URL - in production, serve from API route
    const url = isProduction
      ? `/api/uploads/${fileName}`
      : `/uploads/${fileName}`;

    // Determine asset type
    let assetType = "document";
    if (file.type.startsWith("image/")) assetType = "image";
    else if (file.type.startsWith("video/")) assetType = "video";
    else if (file.type.startsWith("audio/")) assetType = "audio";
    else if (fontExtensions.includes(ext)) assetType = "font";

    // Save to Asset DB (get user info)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (user && assetType !== "font") {
      await prisma.asset.create({
        data: {
          name: file.name,
          url,
          type: assetType,
          size: file.size,
          tenantId: user.tenantId ?? undefined,
          uploadedBy: user.id,
        },
      });
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Falha ao fazer upload" },
      { status: 500 }
    );
  }
}

// Increase body size limit for large file uploads
export const maxDuration = 30;
