import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

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

// ─── DELETE: Remove asset ───
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Asset ID required" }, { status: 400 });
  }

  await prisma.asset.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
