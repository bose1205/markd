import { NextRequest, NextResponse } from "next/server";

// ─── Rate Limiting ──────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const WINDOW_MS = 60_000;

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Clean up expired entries
  rateLimitMap.forEach((entry, key) => {
    if (entry.resetAt < now) rateLimitMap.delete(key);
  });

  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT;
}

// ─── CORS ───────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://markd-rouge.vercel.app",
  "http://localhost:3000",
];

function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : "https://markd-rouge.vercel.app";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// ─── Helpers ────────────────────────────────────────────────
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// ─── OPTIONS (CORS preflight) ───────────────────────────────
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request),
  });
}

// ─── GET ────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  const emptyResponse = { title: "", thumbnail: "", favicon: "" };

  // Rate limit check
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: corsHeaders }
    );
  }

  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(emptyResponse, { headers: corsHeaders });
  }

  try {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(emptyResponse, { headers: corsHeaders });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Markd/1.0; +https://markd.app)",
      },
    });
    clearTimeout(timeout);

    const html = await response.text();

    // Extract title
    let title = "";
    const ogTitleMatch = html.match(
      /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i
    );
    if (ogTitleMatch) {
      title = ogTitleMatch[1];
    } else {
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      if (titleMatch) {
        title = titleMatch[1];
      }
    }

    // Extract thumbnail
    let thumbnail = "";
    const youtubeId = extractYouTubeId(url);
    if (youtubeId) {
      thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    } else {
      const ogImageMatch = html.match(
        /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i
      );
      if (ogImageMatch) {
        thumbnail = ogImageMatch[1];
      }
    }

    // Favicon
    const favicon = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=32`;

    return NextResponse.json(
      { title: title.trim(), thumbnail, favicon },
      { headers: corsHeaders }
    );
  } catch {
    return NextResponse.json(emptyResponse, { headers: corsHeaders });
  }
}
