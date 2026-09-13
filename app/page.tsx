import type { Metadata } from "next";

import TipPage from "@/components/tip-page";
import { getYouTubeChannel } from "@/lib/youtube/get-channel";

export const metadata: Metadata = {
  title: "Alpha Clasher",
  description:
    "Support Alpha Clasher with a tip and drop a message on stream. Instant, secure, no account needed.",
  openGraph: {
    title: "Alpha Clasher",
    description: "Support Alpha Clasher with a tip and drop a message on stream.",
  },
};

export default async function HomePage() {
  const youtube = await getYouTubeChannel();
  return <TipPage youtube={youtube} streamerId="alpha-clasher" />;
}
