import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { rateLimit } from "@/lib/rateLimit";

// Rate limit: 30 requests per minute per IP for asset operations
const assetLimiter = rateLimit({ interval: 60_000, limit: 30 });

// ─── GET: List assets for current tenant ───
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // "image", "video", etc.

  const where: Record<string, unknown> = {};

  // Filter by tenant (or show all for SUPER_ADMIN)
  if (user.role !== "SUPER_ADMIN" && user.tenantId) {
    where.tenantId = user.tenantId;
  }

  if (type) {
    where.type = type;
  }

  const assets = await prisma.asset.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      uploader: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json(assets);
}

// ─── POST: Upload new asset ───
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  const { success } = assetLimiter.check(ip);
  if (!success) {
    return NextResponse.json({ error: "Muitas requisições. Tente novamente em breve." }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Determine asset type from MIME
  let assetType = "document";
  if (file.type.startsWith("image/")) assetType = "image";
  else if (file.type.startsWith("video/")) assetType = "video";
  else if (file.type.startsWith("audio/")) assetType = "audio";

  // Save file to /app/data/uploads/assets/
  const uploadsDir = join(process.cwd(), "data", "uploads", "assets");
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  const ext = file.name.split(".").pop() || "bin";
  const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const filepath = join(uploadsDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  const url = `/api/uploads/assets/${filename}`;

  // Save to database
  const asset = await prisma.asset.create({
    data: {
      name: file.name,
      url,
      type: assetType,
      size: file.size,
      tenantId: user.tenantId ?? undefined,
      uploadedBy: user.id,
    },
  });

  return NextResponse.json(asset, { status: 201 });
}

// ─── DELETE: Remove asset (with ownership check + file cleanup) ───
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Asset ID required" }, { status: 400 });
  }

  // Fetch asset and verify ownership
  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  // Only allow delete if: SUPER_ADMIN, or same tenant, or the uploader themselves
  const isOwner = asset.uploadedBy === user.id;
  const isSameTenant = user.tenantId && asset.tenantId === user.tenantId;
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  if (!isOwner && !isSameTenant && !isSuperAdmin) {
    return NextResponse.json({ error: "Sem permissão para excluir este asset" }, { status: 403 });
  }

  // Delete file from disk
  try {
    const filename = asset.url.split("/").pop();
    if (filename) {
      const { unlink } = await import("fs/promises");
      const uploadsDir = join(process.cwd(), "data", "uploads", "assets");
      const filepath = join(uploadsDir, filename);
      if (existsSync(filepath)) {
        await unlink(filepath);
      }
      // Also try the main uploads dir (files from /api/upload)
      const mainDir = join(process.env.NODE_ENV === "production" ? "/app" : process.cwd(), "data", "uploads");
      const mainPath = join(mainDir, filename);
      if (existsSync(mainPath)) {
        await unlink(mainPath);
      }
    }
  } catch (e) {
    console.warn("Failed to delete file from disk:", e);
  }

  // Delete DB record
  await prisma.asset.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
