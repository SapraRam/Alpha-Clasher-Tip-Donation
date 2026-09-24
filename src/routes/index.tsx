import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Flame,
  Gamepad2,
  Mail,
  Minus,
  Play,
  Plus,
  Radio,
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

  const tier = useMemo(() => tierFor(amount), [amount]);
  const canSend = amount >= 20 && email.includes("@");

  const step = (dir: 1 | -1) => {
    const inc = amount >= 1000 ? 500 : amount >= 100 ? 50 : 10;
    setAmount((a) => Math.max(20, Math.min(100000, a + dir * inc)));
  };

  return (
    <main
      className={`relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 transition-colors duration-500 lg:px-12 lg:py-12 ${tier.cls}`}
    >
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute -left-40 top-1/2 h-[40rem] w-[40rem] -translate-y-1/2 rounded-full blur-[120px] opacity-40"
        style={{ background: "var(--tier)" }}
      />
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-20" />

      <div className="relative z-10 w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-border console-glow bg-card/50 backdrop-blur-3xl">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* LEFT — creator poster */}
          <section className="relative flex min-h-[540px] flex-col justify-end lg:col-span-7 lg:min-h-[760px]">
            {/* Big portrait */}
            <div className="absolute inset-0 z-0">
              <img
                src={portraitAsset.url}
                alt="NovaStrike creator portrait"
                width={1024}
                height={1536}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />
            </div>

            {/* Floating live / stream HUD */}
            <div className="absolute left-6 top-6 z-20 w-[calc(100%-3rem)] max-w-sm lg:left-8 lg:top-8">
              <div className="glass flex items-center gap-4 rounded-2xl p-4 shadow-2xl">
                <div className="relative shrink-0">
                  <div className="hud-corner rounded-2xl p-0.5">
                    <img
                      src={avatarImage}
                      alt="NovaStrike avatar"
                      width={128}
                      height={128}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-red-500 ring-2 ring-background" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Radio className="h-3 w-3 text-primary" />
                    <span className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                      Live Now
                    </span>
                  </div>
                  <h2 className="mt-0.5 flex items-center gap-1.5 truncate font-display text-lg font-bold text-foreground">
                    NovaStrike
                    <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
                  </h2>
                  <p className="truncate text-[11px] text-muted-foreground">Valorant ranked grind</p>
                </div>
                <div className="group relative hidden h-14 w-24 shrink-0 overflow-hidden rounded-xl border border-border sm:block">
                  <img
                    src={streamThumbAsset.url}
                    alt="Current stream preview"
                    width={256}
                    height={144}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                    <Play className="h-5 w-5 fill-foreground text-foreground" />
                  </div>
                </div>
              </div>
            </div>

            {/* Creator info, stats & goal */}
            <div className="relative z-10 p-6 lg:p-10">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                NovaStrike
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <span>@novastrike</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                <span>YouTube Gaming</span>
              </p>

              <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
                Daily ranked grinds, chaotic customs and late-night scrims. Every tip pops up live
                on stream with your name, your message and the alert you pick.
              </p>

              <dl className="mt-8 grid max-w-md grid-cols-3 gap-3">
                {[
                  { icon: Users, k: "Subscribers", v: "1.2M" },
                  { icon: Trophy, k: "Tournaments", v: "37" },
                  { icon: Flame, k: "Tips today", v: "184" },
                ].map((s) => (
                  <div key={s.k} className="glass rounded-2xl px-4 py-3.5">
                    <s.icon className="h-4 w-4 text-primary" />
                    <dd className="mt-2 font-display text-xl font-semibold text-foreground">
                      {s.v}
                    </dd>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {s.k}
                    </dt>
                  </div>
                ))}
              </dl>

              {/* Stream goal */}
              <div className="mt-6 w-full max-w-md">
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                        Current Goal
                      </span>
                      <p className="mt-1 text-sm font-medium text-foreground">New capture card setup</p>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      ₹62,400 <span className="text-border">/</span> ₹90,000
                    </span>
                  </div>
                  <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-secondary ring-1 ring-border">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: "69%",
                        background: "linear-gradient(90deg, var(--tier-soft), var(--tier))",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT — tip console */}
          <section className="flex flex-col justify-between border-t border-border bg-card px-6 py-8 lg:col-span-5 lg:border-l lg:border-t-0 lg:px-10 lg:py-10">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                  Support Console
                </span>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary shadow-[0_0_8px_var(--tier)]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    {tier.name}
                  </span>
                </div>
              </div>

              {/* Amount dial */}
              <div className="mt-8 rounded-3xl border border-border bg-secondary p-5">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Decrease amount"
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-border bg-muted text-muted-foreground transition-all hover:border-primary hover:text-foreground"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="text-center">
                    <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
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
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-border bg-muted text-muted-foreground transition-all hover:border-primary hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="mx-auto mt-4 h-0.5 w-20 rounded-full bg-primary" />
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
                      className={`rounded-xl py-2.5 text-[11px] font-bold transition-all ${
                        active
                          ? "border border-primary bg-primary/20 text-foreground shadow-[0_0_16px_-4px_var(--tier)]"
                          : "border border-border bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      ₹{formatShort(p)}
                    </button>
                  );
                })}
              </div>

              {/* Identity + message */}
              <div className="mt-6 space-y-4 rounded-2xl border border-border bg-surface p-5">
                <div>
                  <label
                    htmlFor="name"
                    className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    Identity
                  </label>
                  <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter display name..."
                    className="mt-2 w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    maxLength={tier.max}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message..."
                    rows={3}
                    className="mt-2 w-full resize-none rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                  />
                  <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Higher tiers unlock longer messages</span>
                    <span className="font-medium text-primary">
                      {message.length}/{tier.max}
                    </span>
                  </div>
                </div>
              </div>

              {/* Alerts */}
              <div className="mt-6">
                <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
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
                        className={`flex flex-col items-center gap-2 rounded-2xl border py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${
                          active
                            ? "border-primary bg-primary/20 text-primary shadow-[0_0_16px_-6px_var(--tier)]"
                            : "border-border bg-muted text-muted-foreground hover:text-foreground"
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
            <div className="mt-8">
              <div className="relative">
                <label
                  htmlFor="email"
                  className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
                >
                  Receipt Email
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 focus-within:border-primary">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={!canSend}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-display text-sm font-black uppercase tracking-[0.25em] text-primary-foreground shadow-[0_16px_40px_-12px_var(--tier)] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Deploy Tip ₹{amount.toLocaleString("en-IN")}
                <ArrowRight className="h-4 w-4" />
              </button>

              <nav className="mt-6 flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
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
    </main>
  );
}
