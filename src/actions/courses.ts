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
    status: true,
    publishedAt: true,
    updatedAt: true,
    author: { select: { name: true, email: true } },
    tenant: { select: { name: true } },
  } as const;

  // Super Admin sees all courses; Authors see only their tenant's
  // Always exclude soft-deleted courses from the main list
  if (user.role === "SUPER_ADMIN") {
    return prisma.course.findMany({
      where: { deletedAt: null },
      select: selectFields,
      orderBy: { updatedAt: "desc" },
    });
  }

  // Users without tenant see only their own courses
  if (!user.tenantId) {
    return prisma.course.findMany({
      where: { authorId: user.id, deletedAt: null },
      select: selectFields,
      orderBy: { updatedAt: "desc" },
    });
  }

  return prisma.course.findMany({
    where: { tenantId: user.tenantId, deletedAt: null },
    select: selectFields,
    orderBy: { updatedAt: "desc" },
  });
}

// ─── Get a single course by ID (with ownership check) ───
export async function getCourse(id: string) {
  const user = await getAuthenticatedUser();

  const course = await prisma.course.findFirst({
    where: { id, deletedAt: null, ...ownershipFilter(user) },
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

// ─── Soft-delete a course (move to trash) ───
export async function deleteCourse(id: string) {
  const user = await getAuthenticatedUser();

  const existing = await prisma.course.findFirst({
    where: { id, deletedAt: null, ...ownershipFilter(user) },
    select: { id: true },
  });
  if (!existing) throw new Error("Curso não encontrado ou sem permissão.");

  await prisma.course.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return { success: true };
}

// ─── Get trashed courses ───
export async function getTrashedCourses() {
  const user = await getAuthenticatedUser();

  const selectFields = {
    id: true,
    title: true,
    description: true,
    thumbnail: true,
    updatedAt: true,
    deletedAt: true,
    author: { select: { name: true, email: true } },
  } as const;

  const where = {
    deletedAt: { not: null },
    ...(user.role === "SUPER_ADMIN"
      ? {}
      : user.tenantId
        ? { tenantId: user.tenantId }
        : { authorId: user.id }),
  };

  return prisma.course.findMany({
    where,
    select: selectFields,
    orderBy: { deletedAt: "desc" },
  });
}

// ─── Restore a trashed course ───
export async function restoreCourse(id: string) {
  const user = await getAuthenticatedUser();

  const existing = await prisma.course.findFirst({
    where: { id, deletedAt: { not: null }, ...ownershipFilter(user) },
    select: { id: true },
  });
  if (!existing) throw new Error("Curso não encontrado na lixeira ou sem permissão.");

  await prisma.course.update({
    where: { id },
    data: { deletedAt: null },
  });

  return { success: true };
}

// ─── Permanently delete a trashed course ───
export async function permanentlyDeleteCourse(id: string) {
  const user = await getAuthenticatedUser();

  const existing = await prisma.course.findFirst({
    where: { id, deletedAt: { not: null }, ...ownershipFilter(user) },
    select: { id: true },
  });
  if (!existing) throw new Error("Curso não encontrado na lixeira ou sem permissão.");

  await prisma.course.delete({
    where: { id },
  });

  return { success: true };
}

// ─── Duplicate a course ───
export async function duplicateCourse(id: string) {
  const user = await getAuthenticatedUser();

  const original = await prisma.course.findFirst({
    where: { id, deletedAt: null, ...ownershipFilter(user) },
  });
  if (!original) throw new Error("Curso não encontrado ou sem permissão.");

  const copy = await prisma.course.create({
    data: {
      title: `${original.title} (Cópia)`,
      description: original.description,
      thumbnail: original.thumbnail,
      courseData: original.courseData as object,
      tenantId: user.tenantId || null,
      authorId: user.id,
    },
  });

  return { id: copy.id };
}

// ─── Toggle course publication status (draft ↔ published) ───
export async function toggleCourseStatus(id: string) {
  const user = await getAuthenticatedUser();

  const existing = await prisma.course.findFirst({
    where: { id, deletedAt: null, ...ownershipFilter(user) },
    select: { id: true, status: true },
  });
  if (!existing) throw new Error("Curso não encontrado ou sem permissão.");

  const newStatus = existing.status === "published" ? "draft" : "published";

  await prisma.course.update({
    where: { id },
    data: {
      status: newStatus,
      publishedAt: newStatus === "published" ? new Date() : undefined,
      updatedAt: new Date(),
    },
  });

  return { success: true, status: newStatus };
}

// ─── Create course from template ───
export async function createCourseFromTemplate(templateId: string) {
  const user = await getAuthenticatedUser();

  // Templates are stored in the TEMPLATES constant on the client
  // This action receives the template data as a pre-built courseData JSON string
  // See /src/lib/templates.ts for available templates
  throw new Error("Use createCourse with template data instead.");
}
