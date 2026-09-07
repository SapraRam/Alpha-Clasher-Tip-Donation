import { NextResponse } from "next/server";
import { refreshMemeCache } from "@/lib/memes";

// GET /api/memes
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category")?.toLowerCase();
  const language = searchParams.get("language")?.toLowerCase();
  const type = searchParams.get("type")?.toLowerCase();
  const sort = searchParams.get("sort")?.toLowerCase() || "trending";
  const source = searchParams.get("source")?.toLowerCase();
  const q = searchParams.get("q")?.toLowerCase();

  // Load from cache or fetch
  const store = await refreshMemeCache();
  let results = [...store.memes];

  // 1. Filter by category
  if (category && category !== "all") {
    if (category === "gifs") {
      results = results.filter((m) => m.is_gif || m.category === "gifs");
    } else {
      results = results.filter((m) => m.category === category);
    }
  }

  // 1b. Filter by media type (gif / image)
  if (type === "gif") {
    results = results.filter((m) => m.is_gif);
  } else if (type === "image") {
    results = results.filter((m) => !m.is_gif);
  }

  // 2. Filter by language
  if (language) {
    results = results.filter((m) => m.language === language);
  }

  // 3. Filter by source (reddit / imgflip / classic)
  if (source) {
    results = results.filter((m) => m.source === source);
  }

  // 4. Filter by search query (title, author, subreddit, dialogue, tag)
  if (q) {
    results = results.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.subreddit.toLowerCase().includes(q) ||
        m.author.toLowerCase().includes(q) ||
        (m.tag && m.tag.toLowerCase().includes(q)) ||
        (m.dialogue && m.dialogue.toLowerCase().includes(q)),
    );
  }

  // 5. Apply Ranking / Sorting
  if (sort === "trending") {
    results.sort((a, b) => (b.trend_score || 0) - (a.trend_score || 0));
  } else if (sort === "score") {
    results.sort((a, b) => b.score - a.score);
  } else if (sort === "newest") {
    results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return NextResponse.json({
    success: true,
    total: results.length,
    category: category || "all",
    sort,
    cached_at: new Date(store.lastFetched).toISOString(),
    memes: results,
  });
}
