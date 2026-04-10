"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ─── Helper: Get authenticated user with ownership check ───
async function getAuthenticatedUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) throw new Error("User not found");
  return user;
}

// ─── Helper: Build ownership filter for queries ───
function ownershipFilter(user: { id: string; role: string; tenantId: string | null }) {
  if (user.role === "SUPER_ADMIN") return {};
  if (!user.tenantId) return { tenantId: null, authorId: user.id };
  return { tenantId: user.tenantId };
}

// ─── Get courses for logged-in user (filtered by tenantId) ───
export async function getUserCourses() {
  const user = await getAuthenticatedUser();

  const selectFields = {
    id: true,
    title: true,
    description: true,
    thumbnail: true,
    courseData: true,
    updatedAt: true,
    author: { select: { name: true, email: true } },
    tenant: { select: { name: true } },
  } as const;

  // Super Admin sees all courses; Authors see only their tenant's
  if (user.role === "SUPER_ADMIN") {
    return prisma.course.findMany({
      select: selectFields,
      orderBy: { updatedAt: "desc" },
    });
  }

  // Users without tenant see only their own courses
  if (!user.tenantId) {
    return prisma.course.findMany({
      where: { authorId: user.id },
      select: selectFields,
      orderBy: { updatedAt: "desc" },
    });
  }

  return prisma.course.findMany({
    where: { tenantId: user.tenantId },
    select: selectFields,
    orderBy: { updatedAt: "desc" },
  });
}

// ─── Get a single course by ID (with ownership check) ───
export async function getCourse(id: string) {
  const user = await getAuthenticatedUser();

  const course = await prisma.course.findFirst({
    where: { id, ...ownershipFilter(user) },
  });

  if (!course) throw new Error("Curso não encontrado ou sem permissão.");
  return course;
}

// ─── Create a new course ───
export async function createCourse(title: string, description: string, thumbnail: string, courseData: string) {
  const user = await getAuthenticatedUser();

  // Create course (tenantId is optional — SUPER_ADMIN and unassigned users can create without tenant)
  const course = await prisma.course.create({
    data: {
      title,
      description,
      thumbnail,
      courseData: JSON.parse(courseData), // Store as JSON object for PostgreSQL
      tenantId: user.tenantId || null,
      authorId: user.id,
    },
  });

  return { id: course.id };
}

// ─── Save course data (update with ownership check) ───
export async function saveCourse(
  id: string,
  courseData: string,
  metadata?: { title?: string; description?: string; thumbnail?: string }
) {
  const user = await getAuthenticatedUser();

  // Verify ownership before updating
  const existing = await prisma.course.findFirst({
    where: { id, ...ownershipFilter(user) },
    select: { id: true },
  });
  if (!existing) throw new Error("Curso não encontrado ou sem permissão.");

  await prisma.course.update({
    where: { id },
    data: {
      courseData: JSON.parse(courseData), // Store as JSON object
      ...(metadata?.title && { title: metadata.title }),
      ...(metadata?.description !== undefined && { description: metadata.description }),
      ...(metadata?.thumbnail && { thumbnail: metadata.thumbnail }),
      updatedAt: new Date(),
    },
  });

  return { success: true };
}

// ─── Update course metadata (with ownership check) ───
export async function updateCourseMetadata(id: string, data: { title?: string; description?: string }) {
  const user = await getAuthenticatedUser();

  const existing = await prisma.course.findFirst({
    where: { id, ...ownershipFilter(user) },
    select: { id: true },
  });
  if (!existing) throw new Error("Curso não encontrado ou sem permissão.");

  await prisma.course.update({
    where: { id },
    data: { ...data, updatedAt: new Date() },
  });

  return { success: true };
}

// ─── Delete a course (with ownership check) ───
export async function deleteCourse(id: string) {
  const user = await getAuthenticatedUser();

  const existing = await prisma.course.findFirst({
    where: { id, ...ownershipFilter(user) },
    select: { id: true },
  });
  if (!existing) throw new Error("Curso não encontrado ou sem permissão.");

  await prisma.course.delete({
    where: { id },
  });

  return { success: true };
}
