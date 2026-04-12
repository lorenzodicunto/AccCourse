import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { safeParseBody } from "@/lib/api-utils";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const [body, errorResponse] = await safeParseBody<{
      courseId: string;
      studentName: string;
      score?: number;
      maxScore?: number;
      hoursSpent?: number;
    }>(req);
    if (errorResponse) return errorResponse;

    const { courseId, studentName, score, maxScore, hoursSpent } = body;

    if (!courseId || !studentName) {
      return NextResponse.json(
        { error: "courseId e studentName são obrigatórios" },
        { status: 400 }
      );
    }

    // Generate validation hash
    const hashInput = `${courseId}|${session.user?.email}|${new Date().toISOString()}|${score ?? 0}`;
    const validationHash = crypto
      .createHash("sha256")
      .update(hashInput)
      .digest("hex")
      .slice(0, 16);

    // Return certificate data without storing (storage can be added later with Prisma migration)
    const certificateData = {
      id: crypto.randomUUID(),
      courseId,
      courseName: "", // will be filled by client
      studentName,
      studentEmail: session.user?.email || "",
      completionDate: new Date().toISOString(),
      score,
      maxScore,
      hoursSpent,
      validationHash,
    };

    return NextResponse.json(certificateData);
  } catch (error) {
    console.error("[Certificate Generation Error]", error);
    return NextResponse.json(
      { error: "Erro ao gerar certificado" },
      { status: 500 }
    );
  }
}
