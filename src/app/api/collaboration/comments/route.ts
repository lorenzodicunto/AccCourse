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
    const slideIndex = request.nextUrl.searchParams.get("slideIndex");

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId é obrigatório" },
        { status: 400 }
      );
    }

    const where: any = { courseId };
    if (slideIndex) {
      where.slideIndex = parseInt(slideIndex);
    }

    const comments = await prisma.courseComment.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedComments = comments.map((c: any) => ({
      id: c.id,
      courseId: c.courseId,
      slideIndex: c.slideIndex,
      blockId: c.blockId,
      position: c.positionX && c.positionY ? { x: c.positionX, y: c.positionY } : undefined,
      author: {
        id: c.author.id,
        name: c.author.name,
        email: c.author.email,
      },
      content: c.content,
      mentions: (c.mentions as string[]) || [],
      status: c.status as "open" | "resolved" | "wontfix",
      priority: c.priority as "low" | "medium" | "high",
      createdAt: c.createdAt.toISOString(),
      resolvedAt: c.resolvedAt?.toISOString(),
      resolvedBy: c.resolvedBy,
      replies: (c.replies as any[]) || [],
    }));

    return NextResponse.json({ comments: formattedComments });
  } catch (error) {
    console.error("[Comments GET error]:", error);
    return NextResponse.json(
      { error: "Erro ao listar comentários" },
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

    const { courseId, slideIndex, blockId, content, priority } = await request.json();

    if (!courseId || slideIndex === undefined || !content) {
      return NextResponse.json(
        { error: "courseId, slideIndex e content são obrigatórios" },
        { status: 400 }
      );
    }

    const comment = await prisma.courseComment.create({
      data: {
        courseId,
        slideIndex,
        blockId: blockId || null,
        authorId: session.user.id,
        content,
        priority: priority || "medium",
        mentions: [],
        replies: [],
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(
      {
        comment: {
          id: comment.id,
          courseId: comment.courseId,
          slideIndex: comment.slideIndex,
          blockId: comment.blockId,
          author: {
            id: comment.author.id,
            name: comment.author.name,
            email: comment.author.email,
          },
          content: comment.content,
          mentions: [],
          status: comment.status,
          priority: comment.priority,
          createdAt: comment.createdAt.toISOString(),
          replies: [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Comments POST error]:", error);
    return NextResponse.json(
      { error: "Erro ao criar comentário" },
      { status: 500 }
    );
  }
}
