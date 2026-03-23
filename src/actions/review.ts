"use server";

import { prisma } from "@/lib/prisma";

// ─── Share a Course ───
export async function shareCourse(title: string, courseData: string) {
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
