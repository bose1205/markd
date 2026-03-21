import { NextRequest, NextResponse } from "next/server";

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

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ title: "", thumbnail: "", favicon: "" });
  }

  try {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ title: "", thumbnail: "", favicon: "" });
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

    return NextResponse.json({
      title: title.trim(),
      thumbnail,
      favicon,
    });
  } catch {
    return NextResponse.json({ title: "", thumbnail: "", favicon: "" });
  }
}
