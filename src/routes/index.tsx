import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CircleCheck,
  Flame,
  Gamepad2,
  Mail,
  Minus,
  Plus,
  Radio,
  Send,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

import portraitAsset from "@/assets/creator-portrait.jpg.asset.json";
import streamThumbAsset from "@/assets/stream-thumb.jpg.asset.json";
import avatarImage from "@/assets/avatar.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NovaStrike — Send a Tip & On-Stream Alert" },
      {
        name: "description",
        content:
          "Support NovaStrike with a tip, drop a message and trigger a live on-stream alert. Instant, secure, no account needed.",
      },
      { property: "og:title", content: "NovaStrike — Send a Tip & On-Stream Alert" },
      {
        property: "og:description",
        content:
          "Support NovaStrike with a tip, drop a message and trigger a live on-stream alert.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TipPage,
});

const PRESETS = [40, 100, 500, 1000, 2000, 10000];

const ALERTS = [
  { id: "hype", label: "Hype", icon: Zap },
  { id: "clutch", label: "Clutch", icon: Trophy },
  { id: "fire", label: "Fire", icon: Flame },
  { id: "gg", label: "GG", icon: Gamepad2 },
];

const TICKER = [
  { user: "ShadowBlade", amt: 200, alert: "Clutch" },
  { user: "NyxGamer", amt: 1000, alert: "Fire" },
  { user: "VoidWalker", amt: 50, alert: "Hype" },
  { user: "PixelQueen", amt: 2000, alert: "GG" },
  { user: "AimBotAce", amt: 500, alert: "Hype" },
  { user: "RazeMain", amt: 100, alert: "Clutch" },
  { user: "GhostPepper", amt: 10000, alert: "Fire" },
  { user: "SageHeals", amt: 40, alert: "GG" },
];

function tierFor(amount: number) {
  if (amount >= 10000) return { cls: "tier-legendary", name: "Legendary", max: 300 };
  if (amount >= 2000) return { cls: "tier-mythic", name: "Mythic", max: 250 };
  if (amount >= 500) return { cls: "tier-epic", name: "Epic", max: 200 };
  if (amount >= 100) return { cls: "tier-rare", name: "Rare", max: 120 };
  return { cls: "tier-standard", name: "Standard", max: 60 };
}

function formatShort(n: number) {
  return n >= 1000 ? `${n / 1000}k` : `${n}`;
}

function TipPage() {
  const [amount, setAmount] = useState(100);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [alert, setAlert] = useState<string | null>("hype");
  const [sent, setSent] = useState(false);

  const tier = useMemo(() => tierFor(amount), [amount]);
  const canSend = amount >= 20 && email.includes("@");

  const step = (dir: 1 | -1) => {
    const inc = amount >= 1000 ? 500 : amount >= 100 ? 50 : 10;
    setAmount((a) => Math.max(20, Math.min(100000, a + dir * inc)));
  };

  const handleSend = () => {
    if (!canSend) return;
    setSent(true);
  };

  return (
    <main
      className={`relative flex min-h-screen flex-col overflow-hidden bg-background transition-colors duration-500 ${tier.cls}`}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -left-1/4 top-0 h-[50rem] w-[50rem] rounded-full blur-[140px] opacity-30"
        style={{ background: "var(--tier)" }}
      />
      <div
        className="pointer-events-none absolute -right-1/4 bottom-0 h-[40rem] w-[40rem] rounded-full blur-[140px] opacity-20"
        style={{ background: "#22d3ee" }}
      />
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" />
      <div className="pointer-events-none absolute inset-0 scanlines opacity-40" />

      {/* Top status bar */}
      <header className="relative z-30 flex items-center justify-between border-b border-border bg-surface/80 px-4 py-3 backdrop-blur-xl lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary">
              <Radio className="h-4 w-4 text-primary" />
            </div>
            <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-foreground">
              NovaStrike<span className="text-primary">.gg</span>
            </span>
          </div>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <div className="hidden items-center gap-2 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
              LIVE
            </span>
          </div>
        </div>

        {/* Live tip ticker */}
        <div className="hidden flex-1 items-center justify-center overflow-hidden px-8 md:flex">
          <div className="relative w-full max-w-xl overflow-hidden">
            <div
              className="flex gap-8 whitespace-nowrap font-mono text-[11px] text-muted-foreground"
              style={{ animation: "ticker 30s linear infinite" }}
            >
              {[...TICKER, ...TICKER].map((t, i) => (
                <span key={i} className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-primary" />
                  <span className="text-foreground">{t.user}</span>
                  <span className="text-primary">₹{t.amt}</span>
                  <span className="text-accent">[{t.alert}]</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 sm:flex">
            <Activity className="h-3 w-3 text-primary" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              8.4K watching
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-6 lg:px-8 lg:py-8">
        <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-2xl border border-border console-glow bg-card/40 backdrop-blur-2xl lg:grid-cols-12">
          {/* LEFT — creator poster */}
          <section className="relative flex min-h-[480px] flex-col justify-end lg:col-span-7 lg:min-h-[720px]">
            {/* Portrait */}
            <div className="absolute inset-0 z-0">
              <img
                src={portraitAsset.url}
                alt="NovaStrike creator portrait"
                width={1024}
                height={1536}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
              <div className="absolute inset-0 scanlines opacity-30" />
            </div>

            {/* Floating HUD card */}
            <div className="absolute left-4 top-4 z-20 w-[calc(100%-2rem)] max-w-sm lg:left-6 lg:top-6">
              <div className="glass clip-corner flex items-center gap-3 rounded-xl p-3 shadow-2xl lg:gap-4 lg:p-4">
                <div className="hud-corner relative shrink-0 rounded-xl p-0.5">
                  <img
                    src={avatarImage}
                    alt="NovaStrike avatar"
                    width={128}
                    height={128}
                    className="h-12 w-12 rounded-lg object-cover lg:h-14 lg:w-14"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Radio className="h-3 w-3 text-primary" />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                      Streaming
                    </span>
                  </div>
                  <h2 className="mt-0.5 flex items-center gap-1.5 truncate font-display text-base font-bold text-foreground lg:text-lg">
                    NovaStrike
                    <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
                  </h2>
                  <p className="truncate font-mono text-[10px] text-muted-foreground">
                    Valorant · Ranked Grind
                  </p>
                </div>
                <div className="group relative hidden h-14 w-24 shrink-0 overflow-hidden rounded-lg border border-border sm:block">
                  <img
                    src={streamThumbAsset.url}
                    alt="Current stream preview"
                    width={256}
                    height={144}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Send className="h-4 w-4 fill-foreground text-foreground" />
                  </div>
                </div>
              </div>
            </div>

            {/* Creator info */}
            <div className="relative z-10 p-5 lg:p-10">
              <h1 className="text-4xl font-bold tracking-tight text-foreground text-glow sm:text-5xl lg:text-6xl">
                NovaStrike
              </h1>
              <p className="mt-2 flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <span className="text-primary">@novastrike</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                <span>YouTube Gaming</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                <span className="text-accent">VERIFIED</span>
              </p>

              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground lg:text-base">
                Daily ranked grinds, chaotic customs and late-night scrims. Every tip pops up live
                on stream with your name, your message and the alert you pick.
              </p>

              {/* Stats grid */}
              <dl className="mt-6 grid max-w-md grid-cols-3 gap-3">
                {[
                  { icon: Users, k: "Subs", v: "1.2M" },
                  { icon: Trophy, k: "Wins", v: "847" },
                  { icon: Flame, k: "Tips", v: "184" },
                ].map((s) => (
                  <div
                    key={s.k}
                    className="glass clip-corner rounded-xl px-3 py-3 lg:px-4 lg:py-3.5"
                  >
                    <s.icon className="h-4 w-4 text-primary" />
                    <dd className="mt-2 font-display text-lg font-bold text-foreground lg:text-xl">
                      {s.v}
                    </dd>
                    <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {s.k}
                    </dt>
                  </div>
                ))}
              </dl>

              {/* Stream goal */}
              <div className="mt-5 w-full max-w-md">
                <div className="glass clip-corner rounded-xl p-4 lg:p-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                        Active Goal
                      </span>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        New capture card setup
                      </p>
                    </div>
                    <span className="font-mono text-xs font-medium text-muted-foreground">
                      ₹62,400 <span className="text-border">/</span> ₹90,000
                    </span>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary ring-1 ring-border">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: "69%",
                        background: "linear-gradient(90deg, var(--tier-soft), var(--tier))",
                      }}
                    />
                  </div>
                  <div className="mt-2 flex justify-end">
                    <span className="font-mono text-[10px] font-bold text-primary">69%</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT — tip console */}
          <section className="flex flex-col justify-between border-t border-border bg-card px-5 py-6 lg:col-span-5 lg:border-l lg:border-t-0 lg:px-8 lg:py-8">
            <div>
              {/* Console header */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                  Support Console
                </span>
                <div className="flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary shadow-[0_0_8px_var(--tier)]" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
                    {tier.name}
                  </span>
                </div>
              </div>

              {/* Amount display */}
              <div className="mt-6 clip-corner rounded-2xl border border-border bg-secondary p-5">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Decrease amount"
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-border bg-muted text-muted-foreground transition-all hover:border-primary hover:text-primary active:scale-90"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="text-center">
                    <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      Tip Amount
                    </span>
                    <div className="mt-1 flex items-baseline justify-center gap-1 font-display text-5xl font-bold text-foreground">
                      <span className="text-xl text-primary">₹</span>
                      <input
                        value={amount}
                        inputMode="numeric"
                        onChange={(e) => {
                          const v = Number(e.target.value.replace(/\D/g, ""));
                          setAmount(Number.isFinite(v) ? Math.min(v, 100000) : 0);
                        }}
                        aria-label="Tip amount"
                        className="w-[5.5ch] bg-transparent text-center outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Increase amount"
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-border bg-muted text-muted-foreground transition-all hover:border-primary hover:text-primary active:scale-90"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="mx-auto mt-4 h-0.5 w-16 rounded-full bg-primary shadow-[0_0_8px_var(--tier)]" />
              </div>

              {/* Presets */}
              <div className="mt-3 grid grid-cols-6 gap-2">
                {PRESETS.map((p) => {
                  const active = p === amount;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAmount(p)}
                      className={`rounded-lg py-2.5 font-mono text-[11px] font-bold transition-all ${
                        active
                          ? "border border-primary bg-primary/15 text-primary shadow-[0_0_16px_-4px_var(--tier)]"
                          : "border border-border bg-muted text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      ₹{formatShort(p)}
                    </button>
                  );
                })}
              </div>

              {/* Identity + message */}
              <div className="mt-5 space-y-4 rounded-xl border border-border bg-surface p-5">
                <div>
                  <label
                    htmlFor="name"
                    className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    Display Name
                  </label>
                  <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your tag..."
                    className="mt-2 w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    maxLength={tier.max}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Drop your message..."
                    rows={3}
                    className="mt-2 w-full resize-none rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary"
                  />
                  <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                    <span>Higher tiers = longer messages</span>
                    <span className="font-bold text-primary">
                      {message.length}/{tier.max}
                    </span>
                  </div>
                </div>
              </div>

              {/* Alerts */}
              <div className="mt-5">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  On-Stream Alert
                </p>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {ALERTS.map((a) => {
                    const active = alert === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setAlert(active ? null : a.id)}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 font-mono text-[10px] font-bold uppercase tracking-widest transition-all ${
                          active
                            ? "border-primary bg-primary/15 text-primary shadow-[0_0_16px_-6px_var(--tier)]"
                            : "border-border bg-muted text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        <a.icon className="h-5 w-5" />
                        {a.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Email + submit */}
            <div className="mt-6">
              <label
                htmlFor="email"
                className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
              >
                Receipt Email
              </label>
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors focus-within:border-primary">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                />
              </div>

              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-mono text-sm font-black uppercase tracking-[0.25em] text-primary-foreground shadow-[0_16px_40px_-12px_var(--tier)] transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                Deploy Tip ₹{amount.toLocaleString("en-IN")}
                <ArrowRight className="h-4 w-4" />
              </button>

              <nav className="mt-5 flex items-center justify-center gap-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                <a href="#terms" className="transition-colors hover:text-foreground">
                  Privacy
                </a>
                <a href="#refund" className="transition-colors hover:text-foreground">
                  Refunds
                </a>
                <a href="#contact" className="transition-colors hover:text-foreground">
                  Support
                </a>
              </nav>
            </div>
          </section>
        </div>
      </div>

      {/* Success overlay */}
      {sent && (
        <SuccessOverlay
          amount={amount}
          displayName={name || "Anonymous"}
          alertLabel={ALERTS.find((a) => a.id === alert)?.label ?? null}
          tierName={tier.name}
          onClose={() => {
            setSent(false);
            setMessage("");
          }}
        />
      )}
    </main>
  );
}

function SuccessOverlay({
  amount,
  displayName,
  alertLabel,
  tierName,
  onClose,
}: {
  amount: number;
  displayName: string;
  alertLabel: string | null;
  tierName: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="animate-scale-in clip-corner relative w-full max-w-md rounded-2xl border border-border bg-card p-8 console-glow">
        <div className="flex flex-col items-center text-center">
          <div className="animate-pulse-ring flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
            <CircleCheck className="h-8 w-8 text-primary" />
          </div>

          <h2 className="mt-6 font-display text-2xl font-bold text-foreground text-glow">
            Tip Deployed!
          </h2>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            {tierName} tier activated
          </p>

          <div className="mt-6 w-full space-y-2 rounded-xl border border-border bg-secondary p-4">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-bold text-foreground">₹{amount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-muted-foreground">From</span>
              <span className="font-bold text-foreground">{displayName}</span>
            </div>
            {alertLabel && (
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-muted-foreground">Alert</span>
                <span className="font-bold text-accent">[{alertLabel}]</span>
              </div>
            )}
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Your tip and message are now live on stream!
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-mono text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground transition-all hover:brightness-110 active:scale-95"
          >
            Send Another
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
