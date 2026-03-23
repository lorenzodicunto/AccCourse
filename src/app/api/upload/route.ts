import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { auth } from "@/lib/auth";

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
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

    // Validate file type (images and fonts only — no octet-stream fallback)
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "font/ttf",
      "font/woff2",
      "application/x-font-ttf",
      "application/font-woff2",
    ];

    const ext = path.extname(file.name).toLowerCase();
    const fontExtensions = [".ttf", ".woff2"];
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const allowedExtensions = [...fontExtensions, ...imageExtensions];

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Aceitos: imagens (jpg, png, gif, webp, svg) e fontes (ttf, woff2)." },
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

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}

// Increase body size limit for large file uploads
export const maxDuration = 30;
