import { handlers } from "@/lib/auth";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

// Rate limit login attempts: 5 per minute per IP
const loginLimiter = rateLimit({ interval: 60_000, limit: 5 });

export const { GET } = handlers;

// Wrap POST to add rate limiting for sign-in attempts
export async function POST(req: Request) {
  // Check if this is a credentials sign-in attempt
  if (req.url.includes("/callback/credentials")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const { success } = loginLimiter.check(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Muitas tentativas de login. Aguarde 1 minuto." },
        { status: 429 }
      );
    }
  }

  return handlers.POST(req as any);
}
