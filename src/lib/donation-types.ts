export interface MemeFeedItem {
  id: string;
  source: "reddit" | "imgflip" | "classic" | "stream_gif";
  source_id: string;
  title: string;
  image_url: string;
  post_url: string;
  author: string;
  subreddit?: string;
  category: "indian" | "global" | "templates" | "classic" | "gifs";
  media_type?: "gif" | "image";
  is_gif?: boolean;
  language?: "hinglish" | "hindi" | "english";
  score: number;
  comments?: number;
  trend_score?: number;
  created_at: string;
  nsfw: boolean;
  spoiler: boolean;
  dialogue?: string;
  tag?: string;
}

export interface NewDonationEvent {
  id?: string;
  name: string;
  amount: number;
  meme_url: string;
  message?: string | null;
  voice_url?: string | null;
}
