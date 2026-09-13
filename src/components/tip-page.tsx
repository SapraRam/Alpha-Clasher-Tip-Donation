"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ExternalLink,
  Flame,
  Globe,
  Image as ImageIcon,
  Instagram,
  Lock,
  Mail,
  MessageSquare,
  Mic,
  Minus,
  Play,
  Plus,
  Radio,
  RotateCw,
  Shield,
  Smile,
  Sparkles,
  Square,
  Trash2,
  TrendingUp,
  Upload,
  User,
  X,
  Youtube,
} from "lucide-react";

import { createDonation, getDonationStatus, mockConfirmDonation } from "@/lib/api";
import { truncateTitle } from "@/lib/youtube/api";
import type { YouTubeChannelResult } from "@/lib/youtube/types";

const portraitImage = "/images/alpha.jpg";
const DEFAULT_MEME_URL = "https://i.imgflip.com/43a45p.png";
const STREAMER_ID_DEFAULT = "alpha-clasher";

interface TierInfo {
  name: string;
  min: number;
  maxChars: number;
  color: string;
  accent: string;
  perk: string;
  tts: boolean;
}

type TierLevel = "standard" | "rare" | "epic" | "mythic" | "legendary";

const TIERS: Record<TierLevel, TierInfo> = {
  standard: {
    name: "Standard",
    min: 20,
    maxChars: 60,
    color: "#a855f7",
    accent: "#d8b4fe",
    perk: "On-Screen Stream Alert",
    tts: false,
  },
  rare: {
    name: "Rare",
    min: 100,
    maxChars: 120,
    color: "#3b82f6",
    accent: "#93c5fd",
    perk: "Meme & GIF Pop-Up Unlocked",
    tts: false,
  },
  epic: {
    name: "Epic",
    min: 500,
    maxChars: 200,
    color: "#22c55e",
    accent: "#86efac",
    perk: "Voice Text-To-Speech (TTS)",
    tts: true,
  },
  mythic: {
    name: "Mythic",
    min: 1000,
    maxChars: 250,
    color: "#f97316",
    accent: "#fdba74",
    perk: "Live Voice Message on Stream",
    tts: true,
  },
  legendary: {
    name: "Legendary",
    min: 10000,
    maxChars: 300,
    color: "#ffc400",
    accent: "#fde047",
    perk: "Golden Takeover + VIP Pin",
    tts: true,
  },
};

const PRESETS = [40, 100, 500, 1000, 2000, 10000];

const HYPE_TAGS = ["🔥 GG WP!", "💎 Clutch God", "⚡ Beast Mode", "🍕 Snack Fund"];

const SOCIALS = [
  { label: "YouTube", href: "https://www.youtube.com/@AlphaClasher", kind: "youtube" as const },
  {
    label: "Instagram",
    href: "https://www.instagram.com/alpha_clasher/",
    kind: "instagram" as const,
  },
  { label: "X", href: "https://x.com/alpha__clasher", kind: "x" as const },
  { label: "Discord", href: "https://discord.com/invite/alphaclasher", kind: "discord" as const },
];

// Curated popular Indian stream memes & GIFs
const MEME_PRESETS = [
  {
    id: "baburao",
    title: "Baburao Style",
    tag: "Hera Pheri",
    dialogue: "Yeh Baburao Ka Style Hai!",
    emoji: "👓",
    gradient: "from-amber-600/30 to-red-600/30",
    url: "https://media.giphy.com/media/3ofSB3K9KXedXm4nmM/giphy.gif",
  },
  {
    id: "jethalal",
    title: "Jethalal Dance",
    tag: "TMKOC",
    dialogue: "Aye Hallooo! Garba Time!",
    emoji: "🕺",
    gradient: "from-purple-600/30 to-pink-600/30",
    url: "https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif",
  },
  {
    id: "akshay",
    title: "25 Din Me Paisa Double",
    tag: "Akshay Kumar",
    dialogue: "Zor Zor Se Bolke Scheme Bata De!",
    emoji: "💰",
    gradient: "from-emerald-600/30 to-teal-600/30",
    url: "https://media.giphy.com/media/3ofSB3K9KXedXm4nmM/giphy.gif",
  },
  {
    id: "puneet",
    title: "Lord Puneet Hype",
    tag: "Superstar",
    dialogue: "Nahi Sudhrenge Hum!",
    emoji: "👑",
    gradient: "from-blue-600/30 to-indigo-600/30",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3pvNnp6aWJ1YjN6aWJ1YjN6aWJ1YjN6aWJ1YjN6aWJ1YjN6JmVwPXYxX2dpZnNfc2VhcmNoJmN0PWc/3o7TKSjRrfIPjeiVyM/giphy.gif",
  },
  {
    id: "carry",
    title: "Toh Kaise Hain Aap Log",
    tag: "CarryMinati",
    dialogue: "Toh Kaise Hain Aap Log!",
    emoji: "🔥",
    gradient: "from-orange-600/30 to-yellow-600/30",
    url: "https://media.giphy.com/media/kaq6GnxDlJaBq/giphy.gif",
  },
  {
    id: "catjam",
    title: "Cat Vibing",
    tag: "Gaming Classic",
    dialogue: "Vibing to Stream BGM",
    emoji: "🐱",
    gradient: "from-cyan-600/30 to-blue-600/30",
    url: "https://media.giphy.com/media/jpbnoe3UIa8TU8LM13/giphy.gif",
  },
];

function tierFor(amount: number): TierInfo {
  if (amount >= 10000) return TIERS.legendary;
  if (amount >= 1000) return TIERS.mythic;
  if (amount >= 500) return TIERS.epic;
  if (amount >= 100) return TIERS.rare;
  return TIERS.standard;
}

function formatShort(n: number) {
  return n >= 1000 ? `${n / 1000}k` : `${n}`;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.726-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.249.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export default function TipPage({
  youtube,
  streamerId = STREAMER_ID_DEFAULT,
}: {
  youtube: YouTubeChannelResult;
  streamerId?: string;
}) {
  const channel = youtube.channel;

  const [amount, setAmount] = useState(10000);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [tierPulse, setTierPulse] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDonationId, setPendingDonationId] = useState<string | null>(null);

  // 100+ Meme / GIF state (Meme API Integration Guide)
  interface MemeFeedItem {
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

  const [selectedMeme, setSelectedMeme] = useState<MemeFeedItem | null>(null);
  const [isMemeModalOpen, setIsMemeModalOpen] = useState(false);
  const [customMemeUrl, setCustomMemeUrl] = useState("");
  const [memeSearch, setMemeSearch] = useState("");
  const [memeCategory, setMemeCategory] = useState("all");
  const [memeSort, setMemeSort] = useState<"trending" | "score" | "newest">("trending");
  const [apiMemes, setApiMemes] = useState<MemeFeedItem[]>([]);
  const [isLoadingMemes, setIsLoadingMemes] = useState(false);
  const [isRefreshingMemes, setIsRefreshingMemes] = useState(false);
  const [previewMeme, setPreviewMeme] = useState<MemeFeedItem | null>(null);

  // 1000+ Voice message state
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const tier = useMemo(() => tierFor(amount), [amount]);
  const tierKey = tier.name.toLowerCase();

  const isMemeUnlocked = amount >= 100;
  const isVoiceUnlocked = amount >= 1000;

  // Fetch memes from /api/memes when modal opens or query/category/sort changes
  useEffect(() => {
    if (!isMemeModalOpen) return;
    const fetchMemes = async () => {
      setIsLoadingMemes(true);
      try {
        const res = await fetch(
          `/api/memes?q=${encodeURIComponent(memeSearch)}&category=${encodeURIComponent(memeCategory)}&sort=${encodeURIComponent(memeSort)}`,
        );
        const data = await res.json();
        if (data && Array.isArray(data.memes)) {
          setApiMemes(data.memes);
          if (!previewMeme && data.memes.length > 0) {
            setPreviewMeme(data.memes[0]);
          }
        }
      } catch (e) {
        console.error("Failed to load memes from API:", e);
      } finally {
        setIsLoadingMemes(false);
      }
    };

    const timer = setTimeout(fetchMemes, 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMemeModalOpen, memeSearch, memeCategory, memeSort]);

  // Handle manual cache refresh trigger
  const handleRefreshMemes = async () => {
    setIsRefreshingMemes(true);
    try {
      await fetch("/api/memes/refresh", { method: "POST" });
      const res = await fetch(
        `/api/memes?q=${encodeURIComponent(memeSearch)}&category=${encodeURIComponent(memeCategory)}&sort=${encodeURIComponent(memeSort)}`,
      );
      const data = await res.json();
      if (data && Array.isArray(data.memes)) {
        setApiMemes(data.memes);
        if (data.memes.length > 0) {
          setPreviewMeme(data.memes[0]);
        }
      }
    } catch (e) {
      console.error("Error refreshing memes:", e);
    } finally {
      setIsRefreshingMemes(false);
    }
  };

  useEffect(() => {
    setTierPulse(true);
    const timer = window.setTimeout(() => setTierPulse(false), 500);
    return () => window.clearTimeout(timer);
  }, [tierKey]);

  // Clean up recording on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const pollDonation = async (donationId: string) => {
    const maxAttempts = 60;
    for (let i = 0; i < maxAttempts; i++) {
      const status = await getDonationStatus(donationId);
      if (status.status === "confirmed") {
        setIsSuccess(true);
        setPendingDonationId(null);
        return;
      }
      if (status.status === "expired" || status.status === "failed") {
        setError(`Payment ${status.status}. Please try again.`);
        setPendingDonationId(null);
        return;
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    setError("Payment still pending. Complete UPI payment, then refresh.");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const donationId = params.get("donation");
    const isMock = params.get("mock") === "1";
    if (!donationId) return;

    setPendingDonationId(donationId);
    if (isMock) {
      mockConfirmDonation(donationId)
        .then(() => pollDonation(donationId))
        .catch(() => setError("Mock payment failed"));
    } else {
      pollDonation(donationId);
    }
  }, []);

  const canSend = amount >= 20 && email.includes("@") && !isSubmitting;

  const step = (dir: 1 | -1) => {
    const inc = amount >= 1000 ? 500 : amount >= 100 ? 50 : 10;
    setAmount((a) => Math.max(20, Math.min(100000, a + dir * inc)));
  };

  const addHypeTag = (tag: string) => {
    setMessage((prev) => (prev ? `${prev} ${tag}` : tag));
  };

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedAudioUrl(url);
        setSelectedVoice("Personal Voice Note (Recorded)");
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => {
          if (s >= 14) {
            stopRecording();
            return 15;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      // Microphone access unavailable or denied
      setSelectedVoice("Custom Stream Shoutout Voice Note");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  };

  const clearVoice = () => {
    setRecordedBlob(null);
    if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    setRecordedAudioUrl(null);
    setSelectedVoice(null);
  };

  const handleSendTip = async () => {
    if (!canSend) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const memeUrl = selectedMeme?.image_url ?? DEFAULT_MEME_URL;
      const formData = new FormData();
      formData.append("streamer_id", streamerId);
      formData.append("amount", String(amount));
      formData.append("meme_url", memeUrl);
      if (name.trim()) formData.append("name", name.trim());
      if (message.trim()) formData.append("message", message.trim());
      if (recordedBlob && isVoiceUnlocked) {
        formData.append("voice", recordedBlob, "voice.webm");
      }

      const result = await createDonation(formData);
      setPendingDonationId(result.donation_id);

      if (result.dev_mock_pay && result.short_url?.includes("mock=1")) {
        await mockConfirmDonation(result.donation_id);
        await pollDonation(result.donation_id);
        return;
      }

      if (result.short_url) {
        const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = result.short_url;
        } else {
          window.open(result.short_url, "_blank", "noopener,noreferrer");
          await pollDonation(result.donation_id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send tip");
    } finally {
      setIsSubmitting(false);
    }
  };

  const channelName = channel?.channelTitle ?? "Alpha Clasher";
  const isLive = Boolean(channel?.liveStream);

  const statCards = [
    {
      icon: Youtube,
      iconClass: "text-red-500",
      k: "Subscribers",
      v: channel?.subscriberLabel ?? "1.6M",
      href: "https://www.youtube.com/@AlphaClasher",
      live: false,
    },
    {
      icon: Play,
      iconClass: "text-white/70",
      k: "Latest Video",
      v: channel?.latestVideo ? truncateTitle(channel.latestVideo.title, 18) : "ALPHA TROLLING 😁",
      href: channel?.latestVideo?.watchUrl,
      live: false,
    },
    {
      icon: Radio,
      iconClass: "text-emerald-400",
      k: "Live Now",
      v: isLive ? "On Air" : "Standby ⚡",
      href: channel?.liveStream?.watchUrl,
      live: true,
    },
  ];

  return (
    <main className="tier-theme relative h-dvh w-full overflow-hidden bg-black">
      {/* Full-page cinematic background — one image across the whole layout */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <img src={portraitImage} alt="" className="hero-portrait" />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/75" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_36%,rgba(0,0,0,0.5)_100%)]" />

        <div className="absolute bottom-[22%] left-[28%] h-72 w-72 rounded-full bg-[#ffc400]/25 blur-[110px]" />
        <div className="absolute top-[18%] right-[18%] h-40 w-40 rounded-full bg-[#ffc400]/10 blur-[80px]" />

        <span className="gold-spark top-[22%] left-[14%] h-1 w-1" />
        <span className="gold-spark top-[38%] left-[8%] h-1.5 w-1.5 [animation-delay:0.6s]" />
        <span className="gold-spark top-[28%] right-[22%] h-1 w-1 [animation-delay:1.2s]" />
        <span className="gold-spark bottom-[42%] left-[18%] h-1 w-1 [animation-delay:1.8s]" />
        <span className="gold-spark top-[16%] right-[32%] h-0.5 w-0.5 [animation-delay:2.1s]" />
        <span className="gold-spark bottom-[36%] right-[28%] h-1.5 w-1.5 [animation-delay:0.9s]" />
      </div>

      <div className="relative z-10 flex h-full min-h-0 w-full flex-col lg:flex-row">
        {/* LEFT SIDE: creator copy over the shared background */}
        <section className="relative flex min-h-0 w-full flex-[1] flex-col justify-end px-6 pb-10 pt-10 sm:px-10 sm:pb-12 lg:w-[50%] lg:flex-none lg:pl-16 lg:pr-8 lg:pb-16">
          <div className="relative z-10 max-w-2xl space-y-4 lg:space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {channelName}
                </h1>
              </div>
              <p className="mt-2 text-sm text-[#a0a0a0] sm:text-base">
                YouTube Gaming Partner • Competitive Customs & Scrims
              </p>
            </div>

            <p className="max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
              Send a live on-screen tip with your custom message, Indian memes & GIFs (₹100+), or
              live voice notes (₹1000+) on Alpha Clasher&apos;s stream!
            </p>

            <div className="grid grid-cols-3 gap-2.5 pt-1 sm:gap-3">
              {statCards.map((s) => {
                const card = (
                  <div className="rounded-xl border border-white/10 bg-black/45 px-3.5 py-3.5 backdrop-blur-md transition-all hover:border-[#ffc400]/35 hover:bg-black/55 sm:px-4 sm:py-4">
                    {s.live ? (
                      <span className="relative mt-0.5 flex h-2.5 w-2.5">
                        <span className="live-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      </span>
                    ) : (
                      <s.icon className={`h-5 w-5 ${s.iconClass}`} />
                    )}
                    <div className="mt-2 truncate font-display text-sm font-bold text-white sm:text-base">
                      {s.v}
                    </div>
                    <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/50 sm:text-xs">
                      {s.k}
                    </div>
                  </div>
                );

                return s.href ? (
                  <a
                    key={s.k}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {card}
                  </a>
                ) : (
                  <div key={s.k}>{card}</div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3 pt-2">
              <p className="font-display text-base italic tracking-wide text-white/70 sm:text-lg">
                Same Games. Different Energy.
              </p>
              <div className="flex items-center gap-2.5">
                {SOCIALS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/40 text-white/70 transition-all hover:-translate-y-0.5 hover:border-[#ffc400]/40 hover:text-[#ffc400]"
                  >
                    {social.kind === "youtube" && <Youtube className="h-4 w-4" />}
                    {social.kind === "instagram" && <Instagram className="h-4 w-4" />}
                    {social.kind === "x" && <XIcon className="h-4 w-4" />}
                    {social.kind === "discord" && <DiscordIcon className="h-4 w-4" />}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE: the only major card — floating glass panel */}
        <section className="relative flex min-h-0 w-full flex-[1.15] items-center justify-center overflow-hidden px-4 py-4 sm:px-6 lg:h-full lg:w-[50%] lg:flex-none lg:px-5 lg:py-5 lg:pr-8">
          <div
            className={`tip-panel relative flex h-[92%] max-h-full w-full max-w-[42rem] flex-col justify-between rounded-[2rem] p-6 sm:p-8 ${
              tierPulse ? "tier-pulse" : ""
            }`}
          >
            {pendingDonationId && !isSuccess && (
              <div className="mb-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                Waiting for UPI payment… complete payment in the opened tab.
              </div>
            )}
            {error && (
              <div className="mb-3 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {error}
              </div>
            )}
            <div className="flex min-h-0 flex-1 flex-col justify-between space-y-5">
              {/* Header Bar */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-white/90">
                    <span className="h-2 w-2 rounded-full bg-[#ffc400]" />
                    <span>{tier.name} Tier</span>
                    <span className="text-white/40">•</span>
                    <span className="text-[#fde047]">{tier.perk}</span>
                  </div>
                </div>

                <span className="rounded-full border border-[#ffc400]/40 bg-[#ffc400]/15 px-2.5 py-0.5 font-display text-[10px] font-black uppercase tracking-wider text-[#fde047]">
                  {tier.name}
                </span>
              </div>

              {/* Amount Stepper Box */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center sm:p-6">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Decrease tip"
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-all hover:-translate-y-0.5 hover:border-primary hover:text-white active:scale-95"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <div className="flex-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">
                      Tip Amount
                    </span>
                    <div className="mt-0.5 flex items-baseline justify-center gap-1 font-display text-4xl sm:text-5xl font-black text-white">
                      <span className="text-xl sm:text-2xl text-primary font-bold">₹</span>
                      <input
                        value={amount}
                        inputMode="numeric"
                        onChange={(e) => {
                          const v = Number(e.target.value.replace(/\D/g, ""));
                          setAmount(Number.isFinite(v) ? Math.min(v, 100000) : 0);
                        }}
                        aria-label="Tip amount in rupees"
                        className="w-[5.5ch] bg-transparent text-center outline-none font-display font-black text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Increase tip"
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-all hover:-translate-y-0.5 hover:border-primary hover:text-white active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Clean Presets Row */}
                <div className="mt-3.5 grid grid-cols-6 gap-2">
                  {PRESETS.map((p) => {
                    const active = p === amount;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setAmount(p)}
                        className={`rounded-lg py-2.5 text-sm font-bold transition-all active:scale-95 ${
                          active
                            ? "bg-[#ffc400] text-black font-extrabold shadow-[0_0_18px_rgba(255,196,0,0.45)]"
                            : "border border-white/10 bg-white/5 text-white/70 hover:-translate-y-0.5 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        ₹{formatShort(p)}
                      </button>
                    );
                  })}
                </div>

                {/* Interactive Stream Media Perks Unlock Bar */}
                <div className="mt-3.5 grid grid-cols-2 gap-2 border-t border-white/10 pt-2.5">
                  {/* ₹100+ Meme / GIF Perk Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!isMemeUnlocked) {
                        setAmount(100);
                      }
                      setIsMemeModalOpen(true);
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-[11px] font-bold transition-all hover:-translate-y-0.5 ${
                      isMemeUnlocked
                        ? selectedMeme
                          ? selectedMeme.is_gif
                            ? "border border-pink-500 bg-pink-500/20 text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.3)]"
                            : "border border-primary/50 bg-primary/15 text-primary"
                          : "border border-white/15 bg-white/5 text-white/90 hover:border-primary/50 hover:bg-white/10"
                        : "border border-white/5 bg-black/40 text-white/40 hover:text-white/70"
                    }`}
                  >
                    {isMemeUnlocked ? (
                      <>
                        <ImageIcon
                          className={`h-3.5 w-3.5 ${selectedMeme?.is_gif ? "text-pink-400" : "text-primary"}`}
                        />
                        <span className="truncate">
                          {selectedMeme
                            ? selectedMeme.is_gif
                              ? `GIF: ${selectedMeme.title}`
                              : `Meme: ${selectedMeme.title}`
                            : "Attach Meme / GIF (₹100+)"}
                        </span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3" />
                        <span>Meme / GIF (₹100+)</span>
                      </>
                    )}
                  </button>

                  {/* ₹1000+ Voice Note Perk Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!isVoiceUnlocked) {
                        setAmount(1000);
                      }
                      setIsVoiceModalOpen(true);
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-[11px] font-bold transition-all hover:-translate-y-0.5 ${
                      isVoiceUnlocked
                        ? selectedVoice
                          ? "border border-orange-500 bg-orange-500/20 text-orange-300"
                          : "border border-white/15 bg-white/5 text-white/90 hover:border-primary/50 hover:bg-white/10"
                        : "border border-white/5 bg-black/40 text-white/40 hover:text-white/70"
                    }`}
                  >
                    {isVoiceUnlocked ? (
                      <>
                        <Mic className="h-3.5 w-3.5 text-orange-400" />
                        <span className="truncate">
                          {selectedVoice ? "Voice Attached 🎙️" : "Voice Note (₹1k+)"}
                        </span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3" />
                        <span>Voice Msg (₹1k+)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-3">
                {/* Gamer Tag */}
                <div>
                  <label
                    htmlFor="name"
                    className="flex items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-widest text-white/60"
                  >
                    <User className="h-3 w-3 text-primary" />
                    <span>Your Gamer Tag / Name</span>
                  </label>
                  <input
                    id="name"
                    value={name}
                    maxLength={30}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. ShadowGamer"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-primary"
                  />
                </div>

                {/* Message + Quick Hype Tags */}
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="message"
                      className="flex items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-widest text-white/60"
                    >
                      <MessageSquare className="h-3 w-3 text-primary" />
                      <span>Stream Message</span>
                    </label>
                    <span className="text-[10px] text-white/40">
                      {message.length}/{tier.maxChars}
                    </span>
                  </div>
                  <textarea
                    id="message"
                    value={message}
                    maxLength={tier.maxChars}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Drop a message for the stream..."
                    rows={2}
                    className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-primary"
                  />

                  {/* Clean Hype Tags */}
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {HYPE_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addHypeTag(tag)}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/70 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-white/10 hover:text-white active:scale-95"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="flex items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-widest text-white/60"
                  >
                    <Mail className="h-3 w-3 text-primary" />
                    <span>Receipt Email</span>
                  </label>
                  <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 focus-within:border-primary">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                    />
                  </div>
                </div>
              </div>

              {/* Clean Live Alert Summary Pill */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-white/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                    </span>
                    <span className="font-semibold text-white/90 truncate">
                      {name.trim() || "Anonymous Gamer"}
                    </span>
                    <span className="text-white/50">tipping</span>
                    <span className="font-bold text-primary">₹{amount}</span>
                  </div>

                  {/* Attached Media Badges */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {selectedMeme && (
                      <span
                        className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          selectedMeme.is_gif
                            ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-pink-300 border border-pink-500/30 shadow-[0_0_10px_rgba(236,72,153,0.3)]"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        <ImageIcon className="h-2.5 w-2.5" />
                        {selectedMeme.is_gif ? "🎬 Animated GIF" : "Meme"}
                      </span>
                    )}
                    {selectedVoice && (
                      <span className="flex items-center gap-1 rounded bg-orange-500/20 px-1.5 py-0.5 text-[9px] font-bold text-orange-300">
                        <Mic className="h-2.5 w-2.5" />
                        Voice
                      </span>
                    )}
                  </div>
                </div>

                {message && (
                  <p className="mt-1 truncate italic text-white/60 text-[11px]">
                    &ldquo;{message}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 space-y-3 pt-1">
              <button
                type="button"
                disabled={!canSend}
                onClick={handleSendTip}
                className="tier-cta group flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffc400] py-4 font-display text-sm font-black uppercase tracking-wider text-black transition-all hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                <span>
                  {isSubmitting
                    ? "Opening UPI..."
                    : `Send ₹${amount.toLocaleString("en-IN")} Tip to Stream`}
                </span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <div className="flex items-center justify-center gap-3 text-[10px] font-medium text-white/40">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-emerald-400" />
                  Instant Live Alert
                </span>
                <span>•</span>
                <span>UPI only</span>
                <span>•</span>
                <span>Secure</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ENHANCED LARGE MEME / GIF PICKER MODAL (100+) WITH LIVE STREAM PREVIEW & API FETCHING */}
      {isMemeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-5 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-black/95 shadow-[0_0_50px_rgba(59,130,246,0.2)] max-h-[92dvh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 sm:px-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>Attach Indian Meme / GIF on Stream</span>
                    <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-300 border border-blue-500/30">
                      ₹100+ Perk
                    </span>
                  </h3>
                  <p className="text-[11px] text-white/50">
                    Live stream overlay pop-up • Pops up on screen with your donation
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMemeModalOpen(false)}
                className="rounded-xl p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Bar, Refresh Action & Category Filters */}
            <div className="border-b border-white/10 bg-white/[0.02] px-5 py-3 sm:px-6 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={memeSearch}
                    onChange={(e) => setMemeSearch(e.target.value)}
                    placeholder="Search 100+ Indian memes, Hera Pheri, CarryMinati, templates..."
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs sm:text-sm text-white outline-none placeholder:text-white/30 transition-all focus:border-blue-500 focus:bg-black/70"
                  />
                  {memeSearch && (
                    <button
                      type="button"
                      onClick={() => setMemeSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Refresh Feed Button */}
                <button
                  type="button"
                  onClick={handleRefreshMemes}
                  disabled={isRefreshingMemes}
                  title="Pull fresh memes from Reddit & Imgflip"
                  className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/15 px-3 py-2.5 text-xs font-bold text-blue-300 hover:bg-blue-500/25 transition-all active:scale-95 disabled:opacity-50"
                >
                  <RotateCw className={`h-3.5 w-3.5 ${isRefreshingMemes ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Refresh Feed</span>
                </button>
              </div>

              {/* Category Filter Pills & Sort Options */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: "all", label: "✨ All Feeds" },
                    { id: "gifs", label: "🎬 Animated GIFs (40+)" },
                    { id: "indian", label: "🔥 Fresh Indian (Reddit)" },
                    { id: "global", label: "🌍 Global Memes" },
                    { id: "templates", label: "🎨 Imgflip Templates" },
                    { id: "classic", label: "👑 Stream Classics" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setMemeCategory(c.id)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                        memeCategory === c.id
                          ? c.id === "gifs"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md ring-1 ring-pink-400"
                            : "bg-blue-600 text-white shadow-md"
                          : "border border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-1 text-[10px] text-white/60">
                  <span className="font-semibold uppercase tracking-wider text-white/40">
                    Sort:
                  </span>
                  {(["trending", "score", "newest"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setMemeSort(s)}
                      className={`rounded px-1.5 py-0.5 capitalize transition-colors ${
                        memeSort === s
                          ? "bg-white/20 text-white font-bold"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Modal Body: Split 2 Columns */}
            <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-12 overflow-hidden">
              {/* Left Column: Meme Grid (7 Cols) */}
              <div className="md:col-span-7 flex flex-col border-b md:border-b-0 md:border-r border-white/10 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                  {isLoadingMemes ? (
                    <div className="flex h-56 flex-col items-center justify-center gap-2 text-white/50 text-xs">
                      <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                      <span>Ingesting fresh memes from Reddit & Imgflip...</span>
                    </div>
                  ) : apiMemes.length === 0 ? (
                    <div className="flex h-56 flex-col items-center justify-center text-white/50 text-xs">
                      <p>No memes found matching &ldquo;{memeSearch}&rdquo;</p>
                      <button
                        type="button"
                        onClick={() => {
                          setMemeSearch("");
                          setMemeCategory("all");
                        }}
                        className="mt-2 text-blue-400 underline font-semibold"
                      >
                        Reset filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {apiMemes.map((m) => {
                        const isSelectedForPreview = previewMeme?.id === m.id;
                        const isFinalSelected = selectedMeme?.id === m.id;

                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPreviewMeme(m)}
                            className={`group relative flex flex-col overflow-hidden rounded-2xl border p-1.5 text-left transition-all ${
                              isSelectedForPreview
                                ? "border-blue-500 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)] ring-1 ring-blue-500"
                                : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
                            }`}
                          >
                            <div className="relative h-28 w-full overflow-hidden rounded-xl bg-black/80 flex items-center justify-center">
                              <img
                                src={m.image_url}
                                alt={m.title}
                                className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                                onError={(e) => {
                                  // Graceful fallback for occasional expired reddit images
                                  (e.target as HTMLImageElement).src =
                                    "https://i.imgflip.com/43a45p.png";
                                }}
                              />
                              {isFinalSelected && (
                                <div className="absolute top-1.5 left-1.5 z-10 rounded-full bg-blue-500 p-0.5 text-black shadow">
                                  <Check className="h-3 w-3 stroke-[3]" />
                                </div>
                              )}
                              {m.is_gif && (
                                <span className="absolute top-1.5 right-1.5 z-10 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow-md animate-pulse">
                                  🎬 GIF
                                </span>
                              )}
                              {m.score > 0 && (
                                <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-bold text-white/80 backdrop-blur-sm">
                                  ▲ {m.score.toLocaleString()}
                                </span>
                              )}
                              <span className="absolute top-1 left-1 rounded bg-black/70 px-1 py-0.5 text-[8px] font-bold text-blue-300 backdrop-blur-sm max-w-[70%] truncate">
                                {m.subreddit ? `r/${m.subreddit}` : m.source}
                              </span>
                            </div>

                            <div className="mt-1.5 px-1">
                              <div
                                className="truncate text-xs font-bold text-white"
                                title={m.title}
                              >
                                {m.title}
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-white/50 mt-0.5">
                                <span className="truncate">u/{m.author}</span>
                                {m.language && (
                                  <span className="uppercase text-[9px] text-white/40">
                                    {m.language}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Custom Image / GIF URL Input Footer */}
                <div className="border-t border-white/10 bg-black/40 p-3 sm:p-4">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
                    <span>Or Paste Custom Image / GIF Link</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customMemeUrl}
                      onChange={(e) => setCustomMemeUrl(e.target.value)}
                      placeholder="Paste image/GIF link (https://...)"
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-white/30 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      disabled={!customMemeUrl.startsWith("http")}
                      onClick={() => {
                        const custom: MemeFeedItem = {
                          id: `custom-${Date.now()}`,
                          source: "classic",
                          source_id: `custom-${Date.now()}`,
                          title: "Custom Stream GIF",
                          image_url: customMemeUrl,
                          post_url: customMemeUrl,
                          author: name.trim() || "Donor",
                          category: "classic",
                          score: 100,
                          created_at: new Date().toISOString(),
                          nsfw: false,
                          spoiler: false,
                          tag: "Custom Upload",
                        };
                        setPreviewMeme(custom);
                      }}
                      className="rounded-xl bg-white/15 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-white/25 disabled:opacity-40"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Stream Alert Preview (5 Cols) */}
              <div className="md:col-span-5 flex flex-col justify-between bg-black/50 p-4 sm:p-6 overflow-y-auto">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                        Stream Alert Preview
                      </span>
                      {previewMeme?.is_gif && (
                        <span className="rounded bg-gradient-to-r from-purple-600 to-pink-600 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow animate-pulse">
                          🎬 Animated GIF
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-400">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      OBS SCREEN
                    </span>
                  </div>

                  {/* The Simulated Live Stream Popup Box */}
                  <div
                    className={`mt-3.5 overflow-hidden rounded-2xl border p-4 shadow-xl transition-all ${
                      previewMeme?.is_gif
                        ? "border-pink-500/50 bg-gradient-to-br from-purple-950/30 via-black to-pink-950/20 shadow-[0_0_25px_rgba(236,72,153,0.2)]"
                        : "border-blue-500/40 bg-gradient-to-br from-blue-950/30 via-black to-blue-950/20"
                    }`}
                  >
                    {previewMeme ? (
                      <div className="space-y-3">
                        {/* Actual Selected Meme Image / GIF */}
                        <div className="relative h-48 w-full overflow-hidden rounded-xl border border-white/10 bg-black flex items-center justify-center">
                          <img
                            src={previewMeme.image_url}
                            alt={previewMeme.title}
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://i.imgflip.com/43a45p.png";
                            }}
                          />
                          <div className="absolute top-2 left-2 rounded bg-black/75 px-2 py-0.5 text-[10px] font-bold text-blue-300 backdrop-blur-md">
                            {previewMeme.subreddit
                              ? `Reddit r/${previewMeme.subreddit}`
                              : previewMeme.source}
                          </div>
                          {previewMeme.score > 0 && (
                            <div className="absolute top-2 right-2 rounded bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white/80 backdrop-blur-md">
                              ▲ {previewMeme.score.toLocaleString()}
                            </div>
                          )}
                        </div>

                        {/* Stream Alert Details Banner */}
                        <div className="rounded-xl border border-white/10 bg-black/60 p-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-display font-bold text-white">
                              {name.trim() || "Anonymous Gamer"}
                            </span>
                            <span className="font-display font-black text-blue-400">
                              ₹{amount.toLocaleString("en-IN")}
                            </span>
                          </div>

                          <div className="mt-1 text-xs text-white/80 italic">
                            &ldquo;
                            {message.trim() ||
                              (previewMeme.dialogue
                                ? previewMeme.dialogue
                                : `[Attached ${previewMeme.title}] Alpha bhai clutch kardo OP!`)}
                            &rdquo;
                          </div>

                          <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-1.5 text-[10px] text-white/50">
                            <span className="truncate">By u/{previewMeme.author}</span>
                            <span
                              className={`font-bold ${previewMeme.is_gif ? "text-pink-300" : "text-blue-300"}`}
                            >
                              {previewMeme.is_gif
                                ? "🎬 Animated GIF Alert"
                                : `${previewMeme.category} meme`}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-56 flex-col items-center justify-center text-center text-white/40 text-xs">
                        <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                        <span>
                          Select any meme on the left to preview how it looks live on stream
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Confirm Attachment Action */}
                <div className="mt-5 space-y-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    disabled={!previewMeme}
                    onClick={() => {
                      if (previewMeme) {
                        setSelectedMeme(previewMeme);
                        setIsMemeModalOpen(false);
                      }
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-lg transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-40"
                  >
                    <Check className="h-4 w-4 stroke-[3]" />
                    <span>Attach Meme to Stream Tip</span>
                  </button>

                  {selectedMeme && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMeme(null);
                        setIsMemeModalOpen(false);
                      }}
                      className="w-full text-center text-[11px] font-semibold text-red-400 hover:underline"
                    >
                      Remove attached meme
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VOICE MESSAGE MODAL (1000+) */}

      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-black/95 p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                  <Mic className="h-4 w-4 text-orange-400" />
                  <span>Send Voice Message to Stream</span>
                </h3>
                <p className="text-[11px] text-white/60">
                  Plays live through Alpha Clasher&apos;s stream speakers (Unlocked at ₹1,000+)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsVoiceModalOpen(false)}
                className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mic Recorder Box */}
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-orange-500/50 bg-orange-500/10">
                {isRecording ? (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white animate-pulse"
                    title="Stop recording"
                  >
                    <Square className="h-5 w-5 fill-current" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-black hover:scale-105 transition-transform"
                    title="Start recording"
                  >
                    <Mic className="h-6 w-6" />
                  </button>
                )}
              </div>

              <div className="mt-3">
                <div className="font-display text-sm font-bold text-white">
                  {isRecording
                    ? `Recording Voice Note... 0:${recordingSeconds < 10 ? "0" : ""}${recordingSeconds}`
                    : recordedAudioUrl
                      ? "Voice Note Ready (0:15s max)"
                      : "Tap Mic to Record Custom Voice Note"}
                </div>
                <div className="text-[10px] text-white/50 mt-0.5">
                  Record your direct voice note to play live on stream
                </div>
              </div>

              {recordedAudioUrl && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  <audio src={recordedAudioUrl} controls className="h-8 max-w-[220px]" />
                  <button
                    type="button"
                    onClick={clearVoice}
                    className="rounded-lg border border-red-500/30 p-1.5 text-red-400 hover:bg-red-500/10"
                    title="Delete voice note"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {selectedVoice && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-white/5 p-2 text-xs">
                <span className="text-white/70 truncate">Selected: {selectedVoice}</span>
                <button
                  type="button"
                  onClick={() => setSelectedVoice(null)}
                  className="text-red-400 hover:text-red-300 font-semibold shrink-0 ml-2"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clean Success Modal */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl border border-primary/40 bg-black/90 p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-black">
              <Check className="h-6 w-6 stroke-[3]" />
            </div>

            <h3 className="mt-3 font-display text-xl font-bold text-white">
              Tip Sent Successfully!
            </h3>
            <p className="mt-1 text-xs text-white/70">
              ₹{amount.toLocaleString("en-IN")} confirmed — live on {channelName}&apos;s stream!
            </p>

            <div className="mt-3 space-y-1 rounded-xl bg-white/5 p-3 text-left text-xs">
              <div className="flex justify-between">
                <span className="text-white/50">Donor:</span>
                <span className="font-bold text-white">{name.trim() || "Anonymous Gamer"}</span>
              </div>
              {selectedMeme && (
                <div className="flex justify-between text-blue-300">
                  <span>Meme:</span>
                  <span className="font-medium">{selectedMeme.title}</span>
                </div>
              )}
              {selectedVoice && (
                <div className="flex justify-between text-orange-300">
                  <span>Voice Note:</span>
                  <span className="font-medium">Attached 🎙️</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsSuccess(false);
                setError(null);
                const path = streamerId === STREAMER_ID_DEFAULT ? "/" : `/donate/${streamerId}`;
                window.history.replaceState({}, "", path);
              }}
              className="mt-4 w-full rounded-xl bg-white/10 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
