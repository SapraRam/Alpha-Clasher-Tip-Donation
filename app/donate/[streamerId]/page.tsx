import type { Metadata } from "next";
import { notFound } from "next/navigation";

import TipPage from "@/components/tip-page";
import { fetchStreamer } from "@/lib/api";
import { getYouTubeChannel } from "@/lib/youtube/get-channel";

type Props = {
  params: Promise<{ streamerId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { streamerId } = await params;
  try {
    const streamer = await fetchStreamer(streamerId);
    return {
      title: `Donate to ${streamer.display_name}`,
      description: `Send a UPI donation with meme and voice alert to ${streamer.display_name}.`,
    };
  } catch {
    return { title: "Donate" };
  }
}

export default async function DonateRoutePage({ params }: Props) {
  const { streamerId } = await params;

  try {
    await fetchStreamer(streamerId);
    const youtube = await getYouTubeChannel();
    return <TipPage youtube={youtube} streamerId={streamerId} />;
  } catch {
    notFound();
  }
}
