import { NextResponse } from "next/server";
import { fetchImgflipMemes } from "@/lib/memes";

// GET /api/memes/templates
export async function GET() {
  try {
    const templates = await fetchImgflipMemes();
    return NextResponse.json({
      success: true,
      total: templates.length,
      source: "imgflip",
      templates,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
