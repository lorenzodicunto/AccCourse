export interface CourseAnalytics {
  courseId: string;
  totalEnrollments: number;
  completions: number;
  completionRate: number;
  averageScore: number;
  averageTimeMinutes: number;
  slideCompletionRates: {
    slideIndex: number;
    slideTitle: string;
    viewCount: number;
    completionRate: number;
    averageTimeSeconds: number;
    dropOffRate: number;
  }[];
  quizAnalytics: {
    blockId: string;
    blockType: string;
    question: string;
    correctRate: number;
    averageAttempts: number;
    commonWrongAnswers: { answer: string; count: number }[];
  }[];
}

export interface StudentProgress {
  userId: string;
  userName: string;
  status: string;
  score: number | null;
  maxScore: number | null;
  timeSpentMinutes: number;
  completedAt: string | null;
  startedAt: string;
}

export interface TrackingEvent {
  type: "slide_view" | "slide_complete" | "quiz_answer" | "interaction" | "course_complete";
  courseId: string;
  slideIndex: number;
  blockId?: string;
  data: Record<string, unknown>;
  timestamp: string;
}
