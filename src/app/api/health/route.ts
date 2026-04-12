import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/health
 * Health check endpoint for monitoring and load balancers.
 * Returns database connectivity status + basic app info.
 */
export async function GET() {
  const start = Date.now();

  let dbStatus: "ok" | "error" = "ok";
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    // Simple query to verify database connectivity
    await prisma.user.count();
    dbLatencyMs = Date.now() - dbStart;
  } catch {
    dbStatus = "error";
  }

  const totalMs = Date.now() - start;
  const healthy = dbStatus === "ok";

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: { status: dbStatus, latencyMs: dbLatencyMs },
      },
      responseTimeMs: totalMs,
    },
    { status: healthy ? 200 : 503 }
  );
}
