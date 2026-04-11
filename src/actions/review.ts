"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ─── Share a Course (with ownership verification) ───
export async function shareCourse(title: string, courseData: string, courseId?: string) {
  // Verify user is authenticated
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error("Usuário não encontrado");

  // If courseId is provided, verify ownership before sharing
  if (courseId) {
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        ...(user.role === "SUPER_ADMIN" ? {} :
          user.tenantId ? { tenantId: user.tenantId } :
          { authorId: user.id }),
      },
    });
    if (!course) throw new Error("Curso não encontrado ou sem permissão para compartilhar.");
  }

  const shared = await prisma.sharedCourse.create({
    data: { title, courseData: JSON.parse(courseData) },
  });
  return { id: shared.id };
}

// ─── Register a Reviewer ───
export async function registerReviewer(name: string, email: string) {
  // Check if reviewer already exists by email
  const existing = await prisma.reviewer.findFirst({
    where: { email },
  });
  if (existing) {
    return { id: existing.id, name: existing.name };
  }
  const reviewer = await prisma.reviewer.create({
    data: { name, email },
  });
  return { id: reviewer.id, name: reviewer.name };
}

// ─── Fetch Shared Course + Comments ───
export async function getSharedCourse(id: string) {
  const course = await prisma.sharedCourse.findUnique({
    where: { id },
    include: {
      comments: {
        include: { reviewer: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!course) return null;
  return course;
}

// ─── Add a Comment ───
export async function addComment(
  sharedCourseId: string,
  slideId: string,
  reviewerId: string,
  text: string
) {
  const comment = await prisma.comment.create({
    data: {
      sharedCourseId,
      slideId,
      reviewerId,
      text,
    },
    include: { reviewer: true },
  });
  return comment;
}

// ─── Get Comments for a Slide ───
export async function getSlideComments(
  sharedCourseId: string,
  slideId: string
) {
  const comments = await prisma.comment.findMany({
    where: { sharedCourseId, slideId },
    include: { reviewer: true },
    orderBy: { createdAt: "asc" },
  });
  return comments;
}

// ─── Toggle Comment Status (pending <-> resolved) ───
export async function toggleCommentStatus(commentId: string) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { status: true },
  });
  if (!comment) throw new Error("Comentário não encontrado.");

  const newStatus = comment.status === "resolved" ? "pending" : "resolved";
  await prisma.comment.update({
    where: { id: commentId },
    data: { status: newStatus },
  });
  return { status: newStatus };
}

// ─── Delete a Comment ───
export async function deleteComment(commentId: string, reviewerId: string) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { reviewerId: true },
  });
  if (!comment) throw new Error("Comentário não encontrado.");
  if (comment.reviewerId !== reviewerId) throw new Error("Sem permissão para excluir este comentário.");

  await prisma.comment.delete({
    where: { id: commentId },
  });
  return { success: true };
}
