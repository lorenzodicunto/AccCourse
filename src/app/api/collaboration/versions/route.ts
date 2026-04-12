import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const courseId = request.nextUrl.searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId é obrigatório" },
        { status: 400 }
      );
    }

    const versions = await prisma.courseVersion.findMany({
      where: { courseId },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedVersions = versions.map((v: any) => ({
      id: v.id,
      courseId: v.courseId,
      version: v.version,
      label: v.label,
      snapshot: v.snapshot,
      author: {
        id: v.author.id,
        name: v.author.name,
      },
      createdAt: v.createdAt.toISOString(),
      changesSummary: v.changesSummary || "",
    }));

    return NextResponse.json({ versions: formattedVersions });
  } catch (error) {
    console.error("[Versions GET error]:", error);
    return NextResponse.json(
      { error: "Erro ao listar versões" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { courseId, label, snapshot, changesSummary } = await request.json();

    if (!courseId || !snapshot) {
      return NextResponse.json(
        { error: "courseId e snapshot são obrigatórios" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { authorId: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 });
    }

    const latestVersion = await prisma.courseVersion.findFirst({
      where: { courseId },
      orderBy: { version: "desc" },
    });

    const nextVersion = (latestVersion?.version || 0) + 1;

    const version = await prisma.courseVersion.create({
      data: {
        courseId,
        version: nextVersion,
        label: label || `Versão ${nextVersion}`,
        snapshot,
        authorId: session.user.id,
        changesSummary: changesSummary || "",
      },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(
      {
        version: {
          id: version.id,
          courseId: version.courseId,
          version: version.version,
          label: version.label,
          snapshot: version.snapshot,
          author: {
            id: version.author.id,
            name: version.author.name,
          },
          createdAt: version.createdAt.toISOString(),
          changesSummary: version.changesSummary,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Versions POST error]:", error);
    return NextResponse.json(
      { error: "Erro ao criar versão" },
      { status: 500 }
    );
  }
}
