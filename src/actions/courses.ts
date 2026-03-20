"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ─── Get courses for logged-in user (filtered by tenantId) ───
export async function getUserCourses() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) throw new Error("User not found");

  // Super Admin sees all courses; Authors see only their tenant's
  if (user.role === "SUPER_ADMIN") {
    return prisma.course.findMany({
      include: { author: { select: { name: true, email: true } }, tenant: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
    });
  }

  if (!user.tenantId) return [];

  return prisma.course.findMany({
    where: { tenantId: user.tenantId },
    include: { author: { select: { name: true, email: true } }, tenant: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

// ─── Get a single course by ID ───
export async function getCourse(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const course = await prisma.course.findUnique({
    where: { id },
  });

  return course;
}

// ─── Create a new course ───
export async function createCourse(title: string, description: string, thumbnail: string, courseData: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user || !user.tenantId) throw new Error("User has no tenant");

  const course = await prisma.course.create({
    data: {
      title,
      description,
      thumbnail,
      courseData,
      tenantId: user.tenantId,
      authorId: user.id,
    },
  });

  return { id: course.id };
}

// ─── Save course data (update) ───
export async function saveCourse(id: string, courseData: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.course.update({
    where: { id },
    data: { courseData, updatedAt: new Date() },
  });

  return { success: true };
}

// ─── Update course metadata ───
export async function updateCourseMetadata(id: string, data: { title?: string; description?: string }) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.course.update({
    where: { id },
    data: { ...data, updatedAt: new Date() },
  });

  return { success: true };
}
