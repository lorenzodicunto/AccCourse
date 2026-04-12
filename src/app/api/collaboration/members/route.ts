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

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { authorId: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 });
    }

    const members = await prisma.projectMember.findMany({
      where: { courseId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { invitedAt: "desc" },
    });

    const formattedMembers = members.map((m: any) => ({
      userId: m.user.id,
      userName: m.user.name,
      userEmail: m.user.email,
      role: m.role as "owner" | "author" | "reviewer" | "translator" | "viewer",
      invitedAt: m.invitedAt.toISOString(),
      acceptedAt: m.acceptedAt?.toISOString(),
    }));

    return NextResponse.json({ members: formattedMembers });
  } catch (error) {
    console.error("[Members GET error]:", error);
    return NextResponse.json(
      { error: "Erro ao listar membros" },
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

    const { courseId, userEmail, role } = await request.json();

    if (!courseId || !userEmail || !role) {
      return NextResponse.json(
        { error: "courseId, userEmail e role são obrigatórios" },
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

    if (course.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Apenas o proprietário pode adicionar membros" },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: { courseId_userId: { courseId, userId: user.id } },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Usuário já é membro deste curso" },
        { status: 409 }
      );
    }

    const member = await prisma.projectMember.create({
      data: {
        courseId,
        userId: user.id,
        role,
        acceptedAt: new Date(),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(
      {
        member: {
          userId: member.user.id,
          userName: member.user.name,
          userEmail: member.user.email,
          role: member.role,
          invitedAt: member.invitedAt.toISOString(),
          acceptedAt: member.acceptedAt?.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Members POST error]:", error);
    return NextResponse.json(
      { error: "Erro ao adicionar membro" },
      { status: 500 }
    );
  }
}
