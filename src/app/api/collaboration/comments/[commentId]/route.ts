import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { commentId } = await params;
    const { status, reply } = await request.json();

    const comment = await prisma.courseComment.findUnique({
      where: { id: commentId },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comentário não encontrado" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (status === "resolved") {
      updateData.status = "resolved";
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = session.user.id;
    } else if (status === "open" || status === "wontfix") {
      updateData.status = status;
    }

    if (reply) {
      const currentReplies = (comment.replies as any[]) || [];
      currentReplies.push({
        id: Math.random().toString(36).substr(2, 9),
        author: { id: session.user.id, name: session.user.name },
        content: reply,
        createdAt: new Date().toISOString(),
      });
      updateData.replies = currentReplies;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Nenhuma alteração fornecida" },
        { status: 400 }
      );
    }

    const updatedComment = await prisma.courseComment.update({
      where: { id: commentId },
      data: updateData,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      comment: {
        id: updatedComment.id,
        courseId: updatedComment.courseId,
        slideIndex: updatedComment.slideIndex,
        blockId: updatedComment.blockId,
        author: {
          id: updatedComment.author.id,
          name: updatedComment.author.name,
          email: updatedComment.author.email,
        },
        content: updatedComment.content,
        mentions: (updatedComment.mentions as string[]) || [],
        status: updatedComment.status as "open" | "resolved" | "wontfix",
        priority: updatedComment.priority as "low" | "medium" | "high",
        createdAt: updatedComment.createdAt.toISOString(),
        resolvedAt: updatedComment.resolvedAt?.toISOString(),
        resolvedBy: updatedComment.resolvedBy,
        replies: (updatedComment.replies as any[]) || [],
      },
    });
  } catch (error) {
    console.error("[Comment PATCH error]:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar comentário" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { commentId } = await params;

    const comment = await prisma.courseComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comentário não encontrado" },
        { status: 404 }
      );
    }

    if (comment.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Apenas o autor pode deletar o comentário" },
        { status: 403 }
      );
    }

    await prisma.courseComment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Comment DELETE error]:", error);
    return NextResponse.json(
      { error: "Erro ao deletar comentário" },
      { status: 500 }
    );
  }
}
