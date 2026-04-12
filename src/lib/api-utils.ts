import { NextResponse } from "next/server";

/**
 * Maximum allowed request body size for API routes (1MB).
 * Prevents DoS attacks via oversized payloads.
 */
const MAX_BODY_SIZE = 1 * 1024 * 1024; // 1MB

/**
 * Safely parse a JSON request body with size limit enforcement.
 * Returns [data, null] on success or [null, NextResponse] on error.
 */
export async function safeParseBody<T = unknown>(
  req: Request
): Promise<[T, null] | [null, NextResponse]> {
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    return [
      null,
      NextResponse.json(
        { error: "Payload too large. Maximum size is 1MB." },
        { status: 413 }
      ),
    ];
  }

  try {
    const data = (await req.json()) as T;
    return [data, null];
  } catch {
    return [
      null,
      NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      ),
    ];
  }
}

/**
 * Development-only logger. Does nothing in production.
 */
export function devLog(message: string, ...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.log(message, ...args);
  }
}

/**
 * Development-only warning logger. Does nothing in production.
 */
export function devWarn(message: string, ...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.warn(message, ...args);
  }
}
