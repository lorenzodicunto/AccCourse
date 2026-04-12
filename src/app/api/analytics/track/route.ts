import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TrackingEvent } from "@/lib/analytics/types";

interface TrackingPayload {
  courseId: string;
  events: TrackingEvent[];
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Check authorization
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: TrackingPayload = await request.json();
    const { courseId, events } = body;

    if (!courseId || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Find or create course attempt
    let attempt = await prisma.courseAttempt.findFirst({
      where: {
        courseId,
        userId: session.user.id,
        status: "in_progress",
      },
    });

    if (!attempt) {
      attempt = await prisma.courseAttempt.create({
        data: {
          courseId,
          userId: session.user.id,
          status: "in_progress",
        },
      });
    }

    // Process events and update attempt
    let slideProgress: Record<number, any> = {};
    let quizResponses: Record<string, any> = {};
    let totalTimeSpent = attempt.timeSpentSec;
    let isCompleted = false;

    // Parse existing progress
    if (attempt.slideProgress) {
      slideProgress = typeof attempt.slideProgress === "string"
        ? JSON.parse(attempt.slideProgress)
        : attempt.slideProgress;
    }

    if (attempt.quizResponses) {
      quizResponses = typeof attempt.quizResponses === "string"
        ? JSON.parse(attempt.quizResponses)
        : attempt.quizResponses;
    }

    // Process each event
    for (const event of events) {
      switch (event.type) {
        case "slide_view":
          if (event.slideIndex !== undefined) {
            slideProgress[event.slideIndex] = slideProgress[event.slideIndex] || {};
            slideProgress[event.slideIndex].viewed = true;
            slideProgress[event.slideIndex].lastViewedAt = event.timestamp;
            slideProgress[event.slideIndex].timeSpentSec =
              (slideProgress[event.slideIndex].timeSpentSec || 0) +
              (event.data.timeSpentSec as number || 0);
          }
          break;

        case "slide_complete":
          if (event.slideIndex !== undefined) {
            slideProgress[event.slideIndex] = slideProgress[event.slideIndex] || {};
            slideProgress[event.slideIndex].completed = true;
            slideProgress[event.slideIndex].completedAt = event.timestamp;
          }
          break;

        case "quiz_answer":
          if (event.blockId) {
            quizResponses[event.blockId] = quizResponses[event.blockId] || {
              attempts: 0,
              responses: [],
            };
            quizResponses[event.blockId].attempts++;
            quizResponses[event.blockId].responses.push({
              answer: event.data.answer,
              isCorrect: event.data.isCorrect,
              timestamp: event.timestamp,
            });
            quizResponses[event.blockId].isCorrect = event.data.isCorrect;
          }
          break;

        case "course_complete":
          isCompleted = true;
          break;
      }

      // Add time spent
      if (event.data.timeSpentSec) {
        totalTimeSpent += event.data.timeSpentSec as number;
      }
    }

    // Update attempt
    const updateData: any = {
      slideProgress,
      quizResponses,
      timeSpentSec: totalTimeSpent,
    };

    if (isCompleted) {
      updateData.status = "completed";
      updateData.completedAt = new Date();
    }

    await prisma.courseAttempt.update({
      where: { id: attempt.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
    });
  } catch (error) {
    console.error("Error tracking events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
