"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export interface AnalyticsData {
  totalCourses: number;
  totalSlides: number;
  totalUsers: number;
  totalSharedCourses: number;
  totalComments: number;
  totalAssets: number;
  courses: Array<{
    id: string;
    title: string;
    authorName: string;
    slideCount: number;
    updatedAt: string;
    createdAt: string;
  }>;
  recentActivity: Array<{
    type: "course_created" | "course_updated" | "course_shared" | "comment_added";
    title: string;
    date: string;
    author: string;
  }>;
  coursesByMonth: Array<{ month: string; count: number }>;
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, tenantId: true },
  });

  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
    throw new Error("Acesso negado. Apenas administradores podem ver analytics.");
  }

  // Tenant filter for non-super-admins
  const tenantFilter = user.role === "SUPER_ADMIN" ? {} : { tenantId: user.tenantId };

  // Get counts
  const [totalCourses, totalUsers, totalSharedCourses, totalComments, totalAssets] = await Promise.all([
    prisma.course.count({ where: { deletedAt: null, ...tenantFilter } }),
    prisma.user.count({ where: tenantFilter }),
    prisma.sharedCourse.count(),
    prisma.comment.count(),
    prisma.asset.count({ where: tenantFilter }),
  ]);

  // Get courses with details
  const courses = await prisma.course.findMany({
    where: { deletedAt: null, ...tenantFilter },
    select: {
      id: true,
      title: true,
      courseData: true,
      updatedAt: true,
      createdAt: true,
      author: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  // Count total slides across all courses
  let totalSlides = 0;
  const formattedCourses = courses.map((course: typeof courses[number]) => {
    let slideCount = 0;
    try {
      const data = course.courseData as any;
      if (data?.slides) slideCount = data.slides.length;
    } catch {}
    totalSlides += slideCount;

    return {
      id: course.id,
      title: course.title,
      authorName: course.author.name,
      slideCount,
      updatedAt: course.updatedAt.toISOString(),
      createdAt: course.createdAt.toISOString(),
    };
  });

  // Recent activity — combine course updates + shared courses + comments
  const recentCourses = await prisma.course.findMany({
    where: { deletedAt: null, ...tenantFilter },
    select: { title: true, updatedAt: true, createdAt: true, author: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const recentShared = await prisma.sharedCourse.findMany({
    select: { title: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const recentComments = await prisma.comment.findMany({
    select: { text: true, createdAt: true, reviewer: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  type ActivityType = "course_created" | "course_updated" | "course_shared" | "comment_added";

  const recentActivity: Array<{ type: ActivityType; title: string; date: string; author: string }> = [
    ...recentCourses.map((c: typeof recentCourses[number]) => ({
      type: (c.createdAt.getTime() === c.updatedAt.getTime() ? "course_created" : "course_updated") as ActivityType,
      title: c.title,
      date: c.updatedAt.toISOString(),
      author: c.author.name,
    })),
    ...recentShared.map((s: typeof recentShared[number]) => ({
      type: "course_shared" as ActivityType,
      title: s.title,
      date: s.createdAt.toISOString(),
      author: "",
    })),
    ...recentComments.map((c: typeof recentComments[number]) => ({
      type: "comment_added" as ActivityType,
      title: c.text.slice(0, 50),
      date: c.createdAt.toISOString(),
      author: c.reviewer.name,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

  // Courses by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const coursesByMonthRaw = await prisma.course.findMany({
    where: { createdAt: { gte: sixMonthsAgo }, deletedAt: null, ...tenantFilter },
    select: { createdAt: true },
  });

  const monthCounts = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthCounts.set(key, 0);
  }
  coursesByMonthRaw.forEach((c: typeof coursesByMonthRaw[number]) => {
    const key = `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (monthCounts.has(key)) {
      monthCounts.set(key, (monthCounts.get(key) || 0) + 1);
    }
  });

  const coursesByMonth = Array.from(monthCounts.entries()).map(([month, count]) => ({
    month,
    count,
  }));

  return {
    totalCourses,
    totalSlides,
    totalUsers,
    totalSharedCourses,
    totalComments,
    totalAssets,
    courses: formattedCourses,
    recentActivity,
    coursesByMonth,
  };
}
