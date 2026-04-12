import { NextResponse, NextRequest } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { devLog } from "@/lib/api-utils";

// Rate limit: 20 Unsplash requests per minute per IP
const unsplashLimiter = rateLimit({ interval: 60_000, limit: 20 });

interface UnsplashImage {
  id: string;
  url: string;
  thumbUrl: string;
  description: string;
  author: string;
}

interface UnsplashResponse {
  results: UnsplashImage[];
  totalPages: number;
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const { success } = unsplashLimiter.check(ip);
    if (!success) {
      return NextResponse.json({ error: "Muitas requisições. Tente novamente em breve." }, { status: 429 });
    }

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("query") || "nature";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get("perPage") || "12", 10)));

    if (query.length > 100) {
      return NextResponse.json(
        { error: "Termo de busca não pode exceder 100 caracteres." },
        { status: 400 }
      );
    }

    const apiKey = process.env.UNSPLASH_API_KEY;

    // Mock fallback
    if (!apiKey) {
      devLog("[Unsplash] No UNSPLASH_API_KEY, using mock");

      const mockResults: UnsplashImage[] = Array.from({ length: perPage }, (_, i) => {
        const idx = (page - 1) * perPage + i + 1;
        const size = "400x300";
        return {
          id: `mock-${idx}`,
          url: `https://placeholder.co/${size}?text=Image+${idx}`,
          thumbUrl: `https://placeholder.co/200x150?text=Image+${idx}`,
          description: `Mock image ${idx} for query "${query}"`,
          author: "Mock Author",
        };
      });

      return NextResponse.json({
        results: mockResults,
        totalPages: Math.ceil(100 / perPage),
      });
    }

    // Fetch from Unsplash API
    const encodedQuery = encodeURIComponent(query);
    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodedQuery}&page=${page}&per_page=${perPage}&client_id=${apiKey}`;

    const response = await fetch(unsplashUrl);

    if (!response.ok) {
      console.error("[Unsplash] API error:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Erro ao buscar imagens do Unsplash." },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Transform Unsplash response to our format
    const results: UnsplashImage[] = (data.results || []).map((img: any) => ({
      id: img.id,
      url: img.urls?.regular || img.urls?.full || "",
      thumbUrl: img.urls?.thumb || img.urls?.small || "",
      description: img.alt_description || img.description || "Imagem do Unsplash",
      author: img.user?.name || "Desconhecido",
    }));

    return NextResponse.json({
      results,
      totalPages: data.total_pages || 1,
    });
  } catch (error) {
    console.error("[Unsplash] Error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar imagens." },
      { status: 500 }
    );
  }
}
