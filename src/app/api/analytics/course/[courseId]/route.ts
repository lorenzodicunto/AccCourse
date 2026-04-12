import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CourseAnalytics } from "@/lib/analytics/types";

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

    // Fetch course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Fetch all attempts for this course
    const attempts = await prisma.courseAttempt.findMany({
      where: { courseId },
      include: {
        user: true,
      },
    });

    // Calculate analytics
    const totalEnrollments = attempts.length;
    const completions = attempts.filter((a: any) => a.status === "completed").length;
    const completionRate = totalEnrollments > 0 ? (completions / totalEnrollments) * 100 : 0;

    const scores = attempts
      .filter((a: any) => a.score !== null && a.maxScore !== null && a.maxScore > 0)
      .map((a: any) => (a.score! / a.maxScore!) * 100);
    const averageScore = scores.length > 0
      ? scores.reduce((sum: number, s: number) => sum + s, 0) / scores.length
      : 0;

    const timesSpent = attempts
      .filter((a: any) => a.timeSpentSec > 0)
      .map((a: any) => a.timeSpentSec);
    const averageTimeMinutes = timesSpent.length > 0
      ? timesSpent.reduce((sum: number, t: number) => sum + t, 0) / timesSpent.length / 60
      : 0;

    // Parse course data to extract slides
    const courseData = typeof course.courseData === "string"
      ? JSON.parse(course.courseData)
      : course.courseData;
    const slides = Array.isArray(courseData.slides) ? courseData.slides : [];

    // Calculate slide completion rates
    const slideCompletionRates = slides.map((slide: any, index: number) => {
      const slideAttempts = attempts.filter((a: any) => {
        const progress = a.slideProgress ? (typeof a.slideProgress === "string" ? JSON.parse(a.slideProgress) : a.slideProgress) : {};
        return progress[index] !== undefined;
      });

      const slideCompletions = slideAttempts.filter((a: any) => {
        const progress = a.slideProgress ? (typeof a.slideProgress === "string" ? JSON.parse(a.slideProgress) : a.slideProgress) : {};
        return progress[index]?.completed === true;
      });

      const totalTime = slideAttempts.reduce((sum: number, a: any) => {
        const progress = a.slideProgress ? (typeof a.slideProgress === "string" ? JSON.parse(a.slideProgress) : a.slideProgress) : {};
        return sum + (progress[index]?.timeSpentSec || 0);
      }, 0);

      return {
        slideIndex: index,
        slideTitle: slide.title || `Slide ${index + 1}`,
        viewCount: slideAttempts.length,
        completionRate: slideAttempts.length > 0 ? (slideCompletions.length / slideAttempts.length) * 100 : 0,
        averageTimeSeconds: slideAttempts.length > 0 ? totalTime / slideAttempts.length : 0,
        dropOffRate: slideAttempts.length > 0 ? ((slideAttempts.length - slideCompletions.length) / slideAttempts.length) * 100 : 0,
      };
    });

    // Calculate quiz analytics (simplified for now)
    const quizAnalytics = courseData.blocks
      ?.filter((block: any) => block.type === "quiz")
      .map((block: any) => {
        const blockResponses = attempts
          .map((a: any) => {
            const responses = a.quizResponses ? (typeof a.quizResponses === "string" ? JSON.parse(a.quizResponses) : a.quizResponses) : {};
            return responses[block.id];
          })
          .filter((r: any) => r !== undefined);

        const correctResponses = blockResponses.filter((r: any) => r.isCorrect === true);

        return {
          blockId: block.id,
          blockType: "quiz",
          question: block.question || block.title || "Quiz Question",
          correctRate: blockResponses.length > 0 ? (correctResponses.length / blockResponses.length) * 100 : 0,
          averageAttempts: blockResponses.length > 0
            ? blockResponses.reduce((sum: number, r: any) => sum + (r.attempts || 1), 0) / blockResponses.length
            : 0,
          commonWrongAnswers: [],
        };
      }) ?? [];

    const analytics: CourseAnalytics = {
      courseId,
      totalEnrollments,
      completions,
      completionRate,
      averageScore,
      averageTimeMinutes,
      slideCompletionRates,
      quizAnalytics,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching course analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
