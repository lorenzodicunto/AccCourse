import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type (images and fonts only)
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
      "application/octet-stream", // fallback for font files
    ];

    const ext = path.extname(file.name).toLowerCase();
    const fontExtensions = [".ttf", ".woff2"];
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];

    if (
      !allowedTypes.includes(file.type) &&
      ![...fontExtensions, ...imageExtensions].includes(ext)
    ) {
      return NextResponse.json(
        { error: "File type not allowed" },
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
