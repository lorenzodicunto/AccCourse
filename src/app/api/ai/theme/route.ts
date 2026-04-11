import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

// Rate limit: 10 AI theme requests per minute per IP
const themeLimiter = rateLimit({ interval: 60_000, limit: 10 });

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const rateLimitKey = session.user.id ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const { success } = themeLimiter.check(rateLimitKey);
    if (!success) {
      return NextResponse.json({ error: "Muitas requisições. Tente novamente em breve." }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Convert file to Base64 data URI
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "image/png";
    const dataUri = `data:${mimeType};base64,${base64}`;

    const apiKey = process.env.OPENAI_API_KEY;

    // If no API key, use mock fallback
    if (!apiKey) {
      console.log("[AI Theme] No OPENAI_API_KEY found, using mock fallback");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return NextResponse.json({
        primaryColor: "#0f172a",
        secondaryColor: "#3b82f6",
        fontFamily: "Montserrat",
      });
    }

    // Use Vercel AI SDK with OpenAI
    const { generateObject } = await import("ai");
    const { openai } = await import("@ai-sdk/openai");
    const { z } = await import("zod");

    const themeSchema = z.object({
      primaryColor: z
        .string()
        .describe("Primary brand hex color extracted from the image"),
      secondaryColor: z
        .string()
        .describe("Secondary/accent brand hex color extracted from the image"),
      fontFamily: z
        .string()
        .describe(
          "A Google Font name that matches the brand vibe (e.g. Inter, Merriweather, Roboto, Montserrat, Outfit, Poppins)"
        ),
    });

    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: themeSchema,
      messages: [
        {
          role: "system",
          content:
            "You are an expert UI/UX designer. Analyze the uploaded brand logo/image. Extract the primary and secondary hex colors. Suggest a suitable Google Font name (e.g., 'Inter', 'Merriweather', 'Roboto', 'Montserrat') that matches the brand's vibe. Return only valid hex color strings starting with #.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this brand image and extract the theme colors and suggest a matching font.",
            },
            {
              type: "image",
              image: dataUri,
            },
          ],
        },
      ],
    });

    return NextResponse.json(result.object);
  } catch (error) {
    console.error("[AI Theme] Error:", error);

    // Fallback on any error
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return NextResponse.json({
      primaryColor: "#0f172a",
      secondaryColor: "#3b82f6",
      fontFamily: "Montserrat",
    });
  }
}
