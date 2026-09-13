"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Image as ImageIcon,
  Lock,
  MessageSquare,
  Mic,
  Minus,
  Plus,
  RotateCw,
  Shield,
  Square,
  Trash2,
  User,
  X,
} from "lucide-react";

import { createDonation, getDonationStatus, mockConfirmDonation } from "@/lib/api";
import type { MemeFeedItem } from "@/lib/donation-types";

const PRESETS = [40, 100, 500, 1000, 2000, 10000];
const MIN_AMOUNT = 20;
const VOICE_MIN = 1000;

const DEFAULT_MEME: MemeFeedItem = {
  id: "default",
  source: "classic",
  source_id: "default",
  title: "GG WP",
  image_url: "https://i.imgflip.com/43a45p.png",
  post_url: "https://i.imgflip.com/43a45p.png",
  author: "system",
  category: "classic",
  score: 0,
  created_at: new Date().toISOString(),
  nsfw: false,
  spoiler: false,
};

function formatShort(n: number) {
  return n >= 1000 ? `${n / 1000}k` : `${n}`;
}

export default function DonatePage({
  streamerId,
  displayName,
}: {
  streamerId: string;
  displayName: string;
}) {
  const [amount, setAmount] = useState(100);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedMeme, setSelectedMeme] = useState<MemeFeedItem>(DEFAULT_MEME);
  const [memes, setMemes] = useState<MemeFeedItem[]>([DEFAULT_MEME]);
  const [loadingMemes, setLoadingMemes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pendingDonationId, setPendingDonationId] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isVoiceUnlocked = amount >= VOICE_MIN;
  const canDonate = amount >= MIN_AMOUNT && Boolean(selectedMeme?.image_url);

  const loadMemes = useCallback(async () => {
    setLoadingMemes(true);
    try {
      const res = await fetch("/api/memes?category=all&sort=trending");
      const data = await res.json();
      if (data?.memes?.length) {
        setMemes(data.memes);
        setSelectedMeme(data.memes[0]);
      }
    } catch {
      setMemes([DEFAULT_MEME]);
      setSelectedMeme(DEFAULT_MEME);
    } finally {
      setLoadingMemes(false);
    }
  }, []);

  useEffect(() => {
    loadMemes();
  }, [loadMemes]);

  const pollDonation = useCallback(async (donationId: string) => {
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
    setError("Payment is still pending. Refresh after completing UPI payment.");
  }, []);

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
  }, [pollDonation]);

  const step = (dir: 1 | -1) => {
    const inc = amount >= 1000 ? 500 : amount >= 100 ? 50 : 10;
    setAmount((a) => Math.max(MIN_AMOUNT, Math.min(100000, a + dir * inc)));
  };

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setRecordedBlob(blob);
        setRecordedAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
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
      setError("Microphone access denied. Voice note skipped.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const clearVoice = () => {
    setRecordedBlob(null);
    if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    setRecordedAudioUrl(null);
  };

  const handleDonate = async () => {
    if (!canDonate || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("streamer_id", streamerId);
      formData.append("amount", String(amount));
      formData.append("meme_url", selectedMeme.image_url);
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
          pollDonation(result.donation_id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Donation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const memeGrid = useMemo(() => memes.slice(0, 24), [memes]);

  return (
    <main className="min-h-dvh bg-black text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 lg:flex-row lg:py-14">
        <section className="flex-1 space-y-4">
          <h1 className="font-display text-4xl font-extrabold">Donate to {displayName}</h1>
          <p className="text-white/70">
            Pick a meme, add a message, and pay via UPI. Your alert goes live on stream after
            payment confirms.
          </p>
          {pendingDonationId && !isSuccess && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Waiting for UPI payment… complete payment in the opened tab, then return here.
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
        </section>

        <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-center">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => step(-1)}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/40">Amount</div>
                <div className="font-display text-4xl font-black text-primary">
                  ₹{amount.toLocaleString("en-IN")}
                </div>
              </div>
              <button
                type="button"
                onClick={() => step(1)}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p)}
                  className={`rounded-lg py-2 text-xs font-bold ${
                    p === amount
                      ? "bg-primary text-black"
                      : "border border-white/10 bg-white/5 text-white/70"
                  }`}
                >
                  ₹{formatShort(p)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60">
              <User className="h-3 w-3 text-primary" />
              Name (optional)
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              placeholder="Anonymous Gamer"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />

            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60">
              <MessageSquare className="h-3 w-3 text-primary" />
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={300}
              rows={2}
              placeholder="Drop a message for the stream..."
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                Pick a meme / GIF
              </span>
              <button
                type="button"
                onClick={loadMemes}
                className="flex items-center gap-1 text-[10px] text-blue-300"
              >
                <RotateCw className="h-3 w-3" />
                Refresh
              </button>
            </div>
            {loadingMemes ? (
              <div className="flex h-32 items-center justify-center text-sm text-white/50">
                Loading memes...
              </div>
            ) : (
              <div className="grid max-h-56 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
                {memeGrid.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMeme(m)}
                    className={`relative overflow-hidden rounded-xl border p-1 ${
                      selectedMeme.id === m.id
                        ? "border-primary ring-2 ring-primary/50"
                        : "border-white/10"
                    }`}
                  >
                    <img
                      src={m.image_url}
                      alt={m.title}
                      className="h-16 w-full object-cover"
                      loading="lazy"
                    />
                    {selectedMeme.id === m.id && (
                      <span className="absolute left-1 top-1 rounded-full bg-primary p-0.5 text-black">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Mic className="h-4 w-4 text-orange-400" />
                Voice note (₹1000+)
              </span>
              {!isVoiceUnlocked && (
                <span className="flex items-center gap-1 text-[10px] text-white/40">
                  <Lock className="h-3 w-3" />
                  Locked
                </span>
              )}
            </div>
            {isVoiceUnlocked ? (
              <div className="mt-3 text-center">
                {isRecording ? (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-600"
                  >
                    <Square className="h-5 w-5 fill-current" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-black"
                  >
                    <Mic className="h-6 w-6" />
                  </button>
                )}
                <p className="mt-2 text-xs text-white/60">
                  {isRecording
                    ? `Recording… 0:${recordingSeconds < 10 ? "0" : ""}${recordingSeconds}`
                    : recordedAudioUrl
                      ? "Voice ready (max 15s)"
                      : "Tap to record (plays on stream, no TTS)"}
                </p>
                {recordedAudioUrl && (
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <audio src={recordedAudioUrl} controls className="h-8 max-w-[220px]" />
                    <button
                      type="button"
                      onClick={clearVoice}
                      className="rounded-lg border border-red-500/30 p-1.5 text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-2 text-xs text-white/40">
                Increase amount to ₹1000+ to attach a recorded voice clip.
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={!canDonate || isSubmitting}
            onClick={handleDonate}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-display text-sm font-black uppercase tracking-wider text-black disabled:opacity-40"
          >
            {isSubmitting
              ? "Creating UPI link..."
              : `Donate ₹${amount.toLocaleString("en-IN")} via UPI`}
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-white/40">
            <Shield className="h-3 w-3 text-emerald-400" />
            UPI only • Secure Razorpay
          </div>
        </section>
      </div>

      {isSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-primary/40 bg-black/90 p-6 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
            <h3 className="mt-3 font-display text-xl font-bold">Donation confirmed!</h3>
            <p className="mt-1 text-sm text-white/70">
              ₹{amount.toLocaleString("en-IN")} alert is live on {displayName}&apos;s stream.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsSuccess(false);
                window.history.replaceState({}, "", `/donate/${streamerId}`);
              }}
              className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-black"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
