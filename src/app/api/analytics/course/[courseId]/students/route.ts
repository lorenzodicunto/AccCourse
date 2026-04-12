import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudentProgress } from "@/lib/analytics/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const session = await auth();

    // Check authorization (admin only)
    if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    // Build filter
    const where: any = { courseId };
    if (status) {
      where.status = status;
    }

    // Fetch attempts
    const [attempts, total] = await Promise.all([
      prisma.courseAttempt.findMany({
        where,
        include: { user: true },
        orderBy: { startedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.courseAttempt.count({ where }),
    ]);

    const students: StudentProgress[] = attempts.map((attempt: any) => ({
      userId: attempt.userId,
      userName: attempt.user.name,
      status: attempt.status,
      score: attempt.score,
      maxScore: attempt.maxScore,
      timeSpentMinutes: attempt.timeSpentSec / 60,
      completedAt: attempt.completedAt?.toISOString() || null,
      startedAt: attempt.startedAt.toISOString(),
    }));

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching student progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
