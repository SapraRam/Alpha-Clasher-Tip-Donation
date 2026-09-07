export interface MemeObject {
  id: string;
  source: "reddit" | "imgflip" | "classic" | "stream_gif";
  source_id: string;
  title: string;
  image_url: string;
  post_url: string;
  author: string;
  subreddit: string;
  category: "indian" | "global" | "templates" | "classic" | "gifs";
  media_type: "gif" | "image";
  is_gif: boolean;
  language: "hinglish" | "hindi" | "english";
  score: number;
  comments?: number;
  trend_score?: number;
  created_at: string;
  nsfw: boolean;
  spoiler: boolean;
  dialogue?: string;
  tag?: string;
}

// Subreddit configurations from guide
export const INDIAN_SUBREDDITS = ["IndianDankMemes", "indiameme", "HindiMemes", "dankinindia"];

export const GLOBAL_SUBREDDITS = ["memes", "dankmemes", "me_irl", "funny"];

export const GIF_SUBREDDITS = ["gifs", "reactiongifs"];

// Verified stream classic memes & iconic animated GIFs
export const STREAM_CLASSIC_MEMES: MemeObject[] = [
  // --- Dedicated Animated Stream GIFs ---
  {
    id: "gif-hype-reaction",
    source: "stream_gif",
    source_id: "stream-reaction-hype",
    title: "Streamer Big Brain Hype",
    image_url: "https://i.redd.it/ajtyfxhaa6gh1.gif",
    post_url: "https://youtube.com/@alphaclasher",
    author: "AlphaArmy",
    subreddit: "streamgifs",
    category: "gifs",
    media_type: "gif",
    is_gif: true,
    language: "hinglish",
    score: 15400,
    comments: 650,
    trend_score: 16000,
    created_at: new Date().toISOString(),
    nsfw: false,
    spoiler: false,
    dialogue: "Bhai kya hi reflex tha! Pure clutch!",
    tag: "Animated Reaction",
  },
  {
    id: "gif-stream-loop",
    source: "stream_gif",
    source_id: "stream-neon-loop",
    title: "Satisfying Neon Stream Loop",
    image_url: "https://i.redd.it/5lxdbd1n1chh1.gif",
    post_url: "https://youtube.com/@alphaclasher",
    author: "AlphaArmy",
    subreddit: "streamgifs",
    category: "gifs",
    media_type: "gif",
    is_gif: true,
    language: "english",
    score: 12100,
    comments: 480,
    trend_score: 13000,
    created_at: new Date().toISOString(),
    nsfw: false,
    spoiler: false,
    dialogue: "Vibing in the chat full night!",
    tag: "Animated Stream Visual",
  },
  {
    id: "gif-clutch-celebration",
    source: "stream_gif",
    source_id: "clutch-celebration-dance",
    title: "1v4 Clutch Celebration Dance",
    image_url: "https://i.redd.it/ajtyfxhaa6gh1.gif",
    post_url: "https://youtube.com/@alphaclasher",
    author: "EsportsGod",
    subreddit: "reactiongifs",
    category: "gifs",
    media_type: "gif",
    is_gif: true,
    language: "hinglish",
    score: 18900,
    comments: 920,
    trend_score: 19500,
    created_at: new Date().toISOString(),
    nsfw: false,
    spoiler: false,
    dialogue: "LET'S GOOO! Clan victory unlocked!",
    tag: "Animated Victory",
  },
  {
    id: "gif-dank-laugh",
    source: "stream_gif",
    source_id: "dank-laugh-reaction",
    title: "Chat Can't Stop Laughing",
    image_url: "https://i.redd.it/gge38j0wwzjh1.gif",
    post_url: "https://youtube.com/@alphaclasher",
    author: "DankStreamer",
    subreddit: "reactiongifs",
    category: "gifs",
    media_type: "gif",
    is_gif: true,
    language: "hinglish",
    score: 16500,
    comments: 730,
    trend_score: 17200,
    created_at: new Date().toISOString(),
    nsfw: false,
    spoiler: false,
    dialogue: "Hahaha chat spam karo laughing emojis!",
    tag: "Animated Reaction",
  },
  {
    id: "gif-gaming-play",
    source: "stream_gif",
    source_id: "gaming-200iq-play",
    title: "200 IQ Esports Strategy",
    image_url: "https://i.redd.it/pdvqnemgbjnh1.gif",
    post_url: "https://youtube.com/@alphaclasher",
    author: "ProTactics",
    subreddit: "gaming",
    category: "gifs",
    media_type: "gif",
    is_gif: true,
    language: "english",
    score: 14800,
    comments: 560,
    trend_score: 15400,
    created_at: new Date().toISOString(),
    nsfw: false,
    spoiler: false,
    dialogue: "Calculated play! Nobody saw that coming!",
    tag: "Animated Gaming",
  },
  {
    id: "gif-breaking-news",
    source: "stream_gif",
    source_id: "stream-breaking-news",
    title: "Alpha Clasher on Beast Mode",
    image_url: "https://i.redd.it/ab4fgjork6nh1.gif",
    post_url: "https://youtube.com/@alphaclasher",
    author: "NewsStream",
    subreddit: "reactiongifs",
    category: "gifs",
    media_type: "gif",
    is_gif: true,
    language: "english",
    score: 13700,
    comments: 490,
    trend_score: 14200,
    created_at: new Date().toISOString(),
    nsfw: false,
    spoiler: false,
    dialogue: "Breaking News: Streamer drops another ace!",
    tag: "Animated News Alert",
  },
  {
    id: "gif-confetti-party",
    source: "stream_gif",
    source_id: "confetti-party-stream",
    title: "Hype Party Confetti Drop",
    image_url: "https://i.redd.it/g2h3d7s98sih1.gif",
    post_url: "https://youtube.com/@alphaclasher",
    author: "PartyGamer",
    subreddit: "gifs",
    category: "gifs",
    media_type: "gif",
    is_gif: true,
    language: "english",
    score: 17200,
    comments: 810,
    trend_score: 18000,
    created_at: new Date().toISOString(),
    nsfw: false,
    spoiler: false,
    dialogue: "Party time! 100K sub celebration!",
    tag: "Animated Hype",
  },

  // --- Classic Memes ---
  {
    id: "classic-baburao",
    source: "classic",
    source_id: "baburao-hera-pheri",
    title: "Yeh Baburao Ka Style Hai",
    image_url: "https://i.imgflip.com/43a45p.png",
    post_url: "https://youtube.com/@alphaclasher",
    author: "BaburaoApte",
    subreddit: "HeraPheri",
    category: "indian",
    media_type: "image",
    is_gif: false,
    language: "hinglish",
    score: 9540,
    comments: 420,
    trend_score: 9800,
    created_at: new Date().toISOString(),
    nsfw: false,
    spoiler: false,
    dialogue: "Yeh Baburao Ka Style Hai!",
    tag: "Hera Pheri Classic",
  },
  {
    id: "classic-jethalal",
    source: "classic",
    source_id: "jethalal-garba",
    title: "Aye Hallooo! Jethalal Garba",
    image_url: "https://i.imgflip.com/30b1gx.jpg",
    post_url: "https://youtube.com/@alphaclasher",
    author: "GadaElectronics",
    subreddit: "TMKOC",
    category: "indian",
    media_type: "image",
    is_gif: false,
    language: "hinglish",
    score: 8420,
    comments: 310,
    trend_score: 8700,
    created_at: new Date().toISOString(),
    nsfw: false,
    spoiler: false,
    dialogue: "Chai Piyo Biscuit Khao!",
    tag: "TMKOC Stream Hype",
  },
  {
    id: "classic-akshay",
    source: "classic",
    source_id: "paisa-double",
    title: "25 Din Me Paisa Double",
    image_url: "https://i.imgflip.com/1ur9b0.jpg",
    post_url: "https://youtube.com/@alphaclasher",
    author: "RajuChor",
    subreddit: "PhirHeraPheri",
    category: "indian",
    media_type: "image",
    is_gif: false,
    language: "hinglish",
    score: 12500,
    comments: 890,
    trend_score: 13000,
    created_at: new Date().toISOString(),
    nsfw: false,
    spoiler: false,
    dialogue: "Zor zor se bolke sabko scheme bata de!",
    tag: "Akshay Kumar Scheme",
  },
  {
    id: "classic-carry",
    source: "classic",
    source_id: "carry-intro",
    title: "Toh Kaise Hain Aap Log",
    image_url: "https://i.imgflip.com/1g8my4.jpg",
    post_url: "https://youtube.com/@alphaclasher",
    author: "CarryMinati",
    subreddit: "CarryMinati",
    category: "indian",
    media_type: "image",
    is_gif: false,
    language: "hindi",
    score: 14200,
    comments: 1100,
    trend_score: 15000,
    created_at: new Date().toISOString(),
    nsfw: false,
    spoiler: false,
    dialogue: "Toh Kaise Hain Aap Log!",
    tag: "Carry Stream Intro",
  },
];

// In-Memory Cache (10-minute TTL as recommended in guide)
export interface CacheStore {
  memes: MemeObject[];
  templates: MemeObject[];
  gifs: MemeObject[];
  lastFetched: number;
}

let cache: CacheStore = {
  memes: [],
  templates: [],
  gifs: [],
  lastFetched: 0,
};

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Helper: check if media is a clean image/GIF format
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const clean = url.toLowerCase().split("?")[0] || "";
  return (
    clean.endsWith(".jpg") ||
    clean.endsWith(".jpeg") ||
    clean.endsWith(".png") ||
    clean.endsWith(".webp") ||
    clean.endsWith(".gif") ||
    url.includes("i.redd.it") ||
    url.includes("i.imgflip.com") ||
    url.startsWith("/memes/")
  );
}

export function isGifUrl(url: string): boolean {
  if (!url) return false;
  const clean = url.toLowerCase().split("?")[0] || "";
  return clean.endsWith(".gif");
}

// Helper: compute ranking score from guide
// trend_score = upvotes * 0.5 + comments * 0.1 + freshness_score * 0.4
export function calculateTrendScore(score: number, comments: number, createdAt: string): number {
  const hoursOld = Math.max(1, (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60));
  const freshnessScore = Math.max(0, 1000 - hoursOld * 20);
  return Math.round(score * 0.5 + comments * 0.1 + freshnessScore * 0.4);
}

// Fetch Imgflip meme templates
export async function fetchImgflipMemes(): Promise<MemeObject[]> {
  try {
    const res = await fetch("https://api.imgflip.com/get_memes", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data?.memes)) return [];

    return data.data.memes
      .slice(0, 50)
      .map((m: { id: string; name: string; url: string; box_count: number }) => ({
        id: `imgflip-${m.id}`,
        source: "imgflip" as const,
        source_id: m.id,
        title: m.name,
        image_url: m.url,
        post_url: `https://imgflip.com/meme/${m.id}`,
        author: "Imgflip",
        subreddit: "templates",
        category: "templates" as const,
        media_type: "image" as const,
        is_gif: false,
        language: "english" as const,
        score: 5000 + Math.floor(Math.random() * 5000),
        comments: m.box_count * 10,
        trend_score: 8000,
        created_at: new Date().toISOString(),
        nsfw: false,
        spoiler: false,
        tag: "Imgflip Template",
      }));
  } catch (err) {
    console.error("[MemeAPI] Failed to fetch Imgflip templates:", err);
    return [];
  }
}

// Fetch Reddit memes & animated GIFs using reliable endpoint
export async function fetchRedditMemes(): Promise<MemeObject[]> {
  const redditMemes: MemeObject[] = [];
  const seenUrls = new Set<string>();

  // Ingest Indian Subreddits
  for (const sub of INDIAN_SUBREDDITS) {
    try {
      const res = await fetch(`https://meme-api.com/gimme/${sub}/12`, {
        next: { revalidate: 600 },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.memes)) {
          for (const m of data.memes) {
            if (m.nsfw || m.spoiler || !isValidImageUrl(m.url) || seenUrls.has(m.url)) continue;
            seenUrls.add(m.url);

            const isGif = isGifUrl(m.url);
            const score = Number(m.ups) || 0;
            const comments = 12;
            const createdAt = new Date().toISOString();

            redditMemes.push({
              id: `reddit-${sub}-${m.postLink ? m.postLink.split("/").pop() : Math.random().toString(36).substring(7)}`,
              source: "reddit",
              source_id: m.postLink || m.url,
              title: m.title || "Indian Stream Meme",
              image_url: m.url,
              post_url: m.postLink || `https://reddit.com/r/${sub}`,
              author: m.author || "reddit_user",
              subreddit: sub,
              category: isGif ? "gifs" : "indian",
              media_type: isGif ? "gif" : "image",
              is_gif: isGif,
              language: sub === "HindiMemes" ? "hindi" : "hinglish",
              score,
              comments,
              trend_score: calculateTrendScore(score, comments, createdAt),
              created_at: createdAt,
              nsfw: false,
              spoiler: false,
              tag: `r/${sub}`,
            });
          }
        }
      }
    } catch (err) {
      console.warn(`[MemeAPI] Subreddit ${sub} fetch warning:`, err);
    }
  }

  // Ingest Global Subreddits
  for (const sub of GLOBAL_SUBREDDITS) {
    try {
      const res = await fetch(`https://meme-api.com/gimme/${sub}/8`, {
        next: { revalidate: 600 },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.memes)) {
          for (const m of data.memes) {
            if (m.nsfw || m.spoiler || !isValidImageUrl(m.url) || seenUrls.has(m.url)) continue;
            seenUrls.add(m.url);

            const isGif = isGifUrl(m.url);
            const score = Number(m.ups) || 0;
            const comments = 25;
            const createdAt = new Date().toISOString();

            redditMemes.push({
              id: `reddit-${sub}-${m.postLink ? m.postLink.split("/").pop() : Math.random().toString(36).substring(7)}`,
              source: "reddit",
              source_id: m.postLink || m.url,
              title: m.title || "Global Viral Meme",
              image_url: m.url,
              post_url: m.postLink || `https://reddit.com/r/${sub}`,
              author: m.author || "reddit_user",
              subreddit: sub,
              category: isGif ? "gifs" : "global",
              media_type: isGif ? "gif" : "image",
              is_gif: isGif,
              language: "english",
              score,
              comments,
              trend_score: calculateTrendScore(score, comments, createdAt),
              created_at: createdAt,
              nsfw: false,
              spoiler: false,
              tag: `r/${sub}`,
            });
          }
        }
      }
    } catch (err) {
      console.warn(`[MemeAPI] Subreddit ${sub} fetch warning:`, err);
    }
  }

  // Ingest Dedicated Animated GIF Subreddits (r/gifs, r/reactiongifs)
  for (const sub of GIF_SUBREDDITS) {
    try {
      const res = await fetch(`https://meme-api.com/gimme/${sub}/15`, {
        next: { revalidate: 600 },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.memes)) {
          for (const m of data.memes) {
            if (m.nsfw || m.spoiler || !isValidImageUrl(m.url) || seenUrls.has(m.url)) continue;
            seenUrls.add(m.url);

            const score = Number(m.ups) || 0;
            const comments = 40;
            const createdAt = new Date().toISOString();

            redditMemes.push({
              id: `reddit-gif-${sub}-${m.postLink ? m.postLink.split("/").pop() : Math.random().toString(36).substring(7)}`,
              source: "reddit",
              source_id: m.postLink || m.url,
              title: m.title || "Animated Reaction GIF",
              image_url: m.url,
              post_url: m.postLink || `https://reddit.com/r/${sub}`,
              author: m.author || "reddit_user",
              subreddit: sub,
              category: "gifs",
              media_type: "gif",
              is_gif: true,
              language: "english",
              score,
              comments,
              trend_score: calculateTrendScore(score, comments, createdAt) + 500,
              created_at: createdAt,
              nsfw: false,
              spoiler: false,
              tag: `r/${sub} (GIF)`,
            });
          }
        }
      }
    } catch (err) {
      console.warn(`[MemeAPI] GIF Subreddit ${sub} fetch warning:`, err);
    }
  }

  return redditMemes;
}

// Master refresh function
export async function refreshMemeCache(force = false): Promise<CacheStore> {
  const now = Date.now();
  if (!force && cache.memes.length > 0 && now - cache.lastFetched < CACHE_TTL_MS) {
    return cache;
  }

  const [redditMemes, imgflipMemes] = await Promise.all([fetchRedditMemes(), fetchImgflipMemes()]);

  // Deduplicate and combine
  const combined = [...STREAM_CLASSIC_MEMES, ...redditMemes, ...imgflipMemes];

  const gifsList = combined.filter((m) => m.is_gif);

  cache = {
    memes: combined,
    templates: imgflipMemes,
    gifs: gifsList,
    lastFetched: now,
  };

  return cache;
}
