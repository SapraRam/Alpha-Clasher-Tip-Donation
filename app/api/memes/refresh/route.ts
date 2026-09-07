import { NextResponse } from "next/server";
import { refreshMemeCache } from "@/lib/memes";

// POST /api/memes/refresh
export async function POST() {
  try {
    const refreshed = await refreshMemeCache(true);
    return NextResponse.json({
      success: true,
      message: "Meme cache refreshed successfully from Reddit and Imgflip",
      total_memes: refreshed.memes.length,
      total_templates: refreshed.templates.length,
      refreshed_at: new Date(refreshed.lastFetched).toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
