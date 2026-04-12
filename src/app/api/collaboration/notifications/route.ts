import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const notifications = await prisma.courseNotification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const formattedNotifications = notifications.map((n: any) => ({
      id: n.id,
      userId: n.userId,
      type: n.type as "comment" | "mention" | "review_request" | "status_change" | "share",
      title: n.title,
      message: n.message,
      courseId: n.courseId,
      link: n.link,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }));

    return NextResponse.json({ notifications: formattedNotifications });
  } catch (error) {
    console.error("[Notifications GET error]:", error);
    return NextResponse.json(
      { error: "Erro ao listar notificações" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { notificationId, read } = await request.json();

    if (!notificationId || read === undefined) {
      return NextResponse.json(
        { error: "notificationId e read são obrigatórios" },
        { status: 400 }
      );
    }

    const notification = await prisma.courseNotification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notificação não encontrada" },
        { status: 404 }
      );
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Apenas o destinatário pode atualizar a notificação" },
        { status: 403 }
      );
    }

    const updated = await prisma.courseNotification.update({
      where: { id: notificationId },
      data: { read },
    });

    return NextResponse.json({
      notification: {
        id: updated.id,
        userId: updated.userId,
        type: updated.type as "comment" | "mention" | "review_request" | "status_change" | "share",
        title: updated.title,
        message: updated.message,
        courseId: updated.courseId,
        link: updated.link,
        read: updated.read,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[Notifications PATCH error]:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar notificação" },
      { status: 500 }
    );
  }
}
