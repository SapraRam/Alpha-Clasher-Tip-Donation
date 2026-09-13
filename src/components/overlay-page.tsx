"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { getApiUrl, getBrowserApiUrl } from "@/lib/api";
import type { NewDonationEvent } from "@/lib/donation-types";

const MIN_ALERT_MS = 7000;

const TEST_ALERT: NewDonationEvent = {
  id: "test",
  name: "Test Donor",
  amount: 500,
  meme_url: "https://i.imgflip.com/43a45p.png",
  message: "OBS overlay is working!",
};

export default function OverlayPage({
  streamerId,
  token,
  debug = false,
  obs = false,
}: {
  streamerId: string;
  token: string;
  debug?: boolean;
  obs?: boolean;
}) {
  const [current, setCurrent] = useState<NewDonationEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [connected, setConnected] = useState(false);
  const [usingPoll, setUsingPoll] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const queueRef = useRef<NewDonationEvent[]>([]);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const playingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const resolveVoiceUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    return `${getApiUrl()}${url.startsWith("/") ? url : `/${url}`}`;
  };
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
  }, []);

  const playNext = useCallback(async () => {
    if (playingRef.current) return;
    const next = queueRef.current.shift();
    if (!next) return;

    playingRef.current = true;
    setCurrent(next);
    setVisible(true);

    if (next.voice_url) {
      try {
        const audio = audioRef.current ?? new Audio();
        audioRef.current = audio;
        audio.src = resolveVoiceUrl(next.voice_url);
        audio.load();
        await new Promise<void>((resolve) => {
          const done = () => resolve();
          audio.onended = done;
          audio.onerror = done;
          audio.play().catch(done);
          setTimeout(done, 30000);
        });
      } catch {
        // optional
      }
    } else {
      await new Promise((r) => setTimeout(r, MIN_ALERT_MS));
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setVisible(false);
    setCurrent(null);
    playingRef.current = false;

    if (queueRef.current.length > 0) {
      playNext();
    }
  }, []);

  const enqueue = useCallback(
    (donation: NewDonationEvent) => {
      const id = donation.id ?? `${donation.name}-${donation.amount}-${donation.message}`;
      if (seenIdsRef.current.has(id)) return;
      seenIdsRef.current.add(id);
      queueRef.current.push(donation);
      playNext();
    },
    [playNext],
  );

  // Socket.io via same-origin proxy (/socket.io -> backend)
  useEffect(() => {
    if (!token) {
      setConnectError("Missing token in URL");
      return;
    }

    const socket = io({
      path: "/socket.io",
      transports: ["polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      auth: { streamerId, token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setUsingPoll(false);
      setConnectError(null);
      if (debug) {
        setTimeout(() => enqueue(TEST_ALERT), 1500);
      }
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("connect_error", (err) => {
      setConnected(false);
      setConnectError(err.message || "Socket failed — using poll fallback");
    });

    socket.on("new_donation", (payload: NewDonationEvent) => {
      enqueue(payload);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [streamerId, token, debug, enqueue]);

  // Poll fallback only when socket is disconnected (avoids duplicate traffic)
  useEffect(() => {
    if (!token || connected) return;

    let lastSince: string | null = null;
    let primed = false;

    const poll = async () => {
      try {
        const qs = lastSince ? `&since=${encodeURIComponent(lastSince)}` : "";
        const res = await fetch(
          `${getBrowserApiUrl()}/overlay/poll?streamer=${streamerId}&token=${encodeURIComponent(token)}${qs}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.server_time) lastSince = data.server_time;
        const donations = data.donations as NewDonationEvent[];
        setUsingPoll(true);
        if (!primed) {
          for (const d of donations) {
            const id = d.id ?? `${d.name}-${d.amount}`;
            seenIdsRef.current.add(id);
          }
          primed = true;
          return;
        }
        for (const d of donations) {
          enqueue(d);
        }
      } catch {
        // ignore
      }
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [streamerId, token, connected, enqueue]);

  const showStatus = debug || obs || !connected;

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ width: 1920, height: 1080, background: "transparent" }}
    >
      {showStatus && (
        <div
          className="absolute left-4 top-4 rounded-lg px-3 py-2 text-sm font-bold"
          style={{
            background: connected ? "rgba(0,128,0,0.9)" : "rgba(180,0,0,0.9)",
            color: "#fff",
            zIndex: 9999,
            fontFamily: "Arial, sans-serif",
          }}
        >
          {connected ? "LIVE" : "OFFLINE"}
          {usingPoll && connected === false && " (poll)"}
          {connectError && !connected && (
            <div style={{ fontSize: 11, fontWeight: "normal", marginTop: 4 }}>{connectError}</div>
          )}
        </div>
      )}

      {visible && current && (
        <div
          className="absolute bottom-16 left-16 max-w-xl rounded-2xl border-2 border-[#ffc400] bg-black p-5"
          style={{ zIndex: 100, fontFamily: "Arial, sans-serif" }}
        >
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <img
              src={current.meme_url}
              alt=""
              width={112}
              height={112}
              style={{ borderRadius: 12, objectFit: "cover" }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  alignItems: "baseline",
                }}
              >
                <span style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
                  {current.name || "Anonymous"}
                </span>
                <span style={{ color: "#ffc400", fontSize: 24, fontWeight: "bold" }}>
                  ₹{current.amount.toLocaleString("en-IN")}
                </span>
              </div>
              {current.message && (
                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 8 }}>
                  &ldquo;{current.message}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DOM audio element — OBS captures this better than programmatic Audio() */}
      <audio ref={audioRef} preload="auto" style={{ position: "fixed", left: -9999, opacity: 0 }} />

      <style
        dangerouslySetInnerHTML={{
          __html: `html,body{background:transparent!important;margin:0;padding:0;overflow:hidden;}`,
        }}
      />
    </div>
  );
}
