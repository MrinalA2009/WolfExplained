import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { WolfNetwork } from "../components/WolfNetwork";
import { Reveal } from "../components/Reveal";
import { MagneticButton } from "../components/MagneticButton";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/workshops")({
  head: () => ({
    meta: [
      { title: "Workshops — WOLF" },
      { name: "description", content: "Workshops and talks on AI deception, trust, and multi-agent reasoning." },
      { property: "og:title", content: "WOLF Workshops" },
      { property: "og:description", content: "Talks, classes, and live sessions." },
    ],
  }),
  component: Workshops,
});

const WORKSHOPS = [
  { title: "Can You Trust AI?", date: "DEC 12, 2024", loc: "NeurIPS · Vancouver", tag: "Featured", desc: "A live, audience-participatory exploration of how language models lie, detect deception, and build social trust.", featured: true },
  { title: "Deception by Design", date: "JAN 24, 2025", loc: "MIT Media Lab · Cambridge", tag: "Talk", desc: "How adversarial dialogue benchmarks reveal latent reasoning capabilities in frontier models." },
  { title: "Building WOLF", date: "FEB 18, 2025", loc: "Stanford HAI · Online", tag: "Workshop", desc: "Hands-on session: design your own multi-agent evaluation framework." },
  { title: "Reasoning Under Suspicion", date: "MAR 09, 2025", loc: "Anthropic · San Francisco", tag: "Talk", desc: "What Werewolf agents teach us about uncertainty, persuasion, and theory of mind." },
];

function Workshops() {
  return (
    <div>
      <PageHeader
        section="Workshops"
        kicker="SESSIONS · 2024 — 2025"
        title={<>Talks, classes, <span className="text-foreground/55">and live experiments.</span></>}
        description="We bring WOLF into the room — to researchers, practitioners, and curious audiences. Each session is part lecture, part live simulation."
      />

      <section className="mx-auto max-w-7xl px-6 mt-14">
        <FeaturedCard w={WORKSHOPS[0]} />
      </section>

      <section className="mx-auto max-w-7xl px-6 mt-10 grid gap-5 md:grid-cols-2">
        {WORKSHOPS.slice(1).map((w, i) => (
          <Reveal key={w.title} delay={i * 100}>
            <WorkshopCard w={w} />
          </Reveal>
        ))}
      </section>
    </div>
  );
}

function FeaturedCard({ w }: { w: typeof WORKSHOPS[number] }) {
  return (
    <Reveal>
      <article className="relative overflow-hidden rounded-[2rem] glass-strong p-10 md:p-16 group">
        <div className="absolute inset-0 -z-10">
          {/* Phase 3: detection — seer illuminated, pattern emerging; fits "Can You Trust AI?" theme */}
          <WolfNetwork phase={3} />
          <div className="absolute inset-0 bg-gradient-to-tr from-background/85 via-background/40 to-transparent" />
        </div>
        <div className="font-mono text-[11px] tracking-[0.3em] text-gold">{w.tag.toUpperCase()}</div>
        <h2 className="mt-5 font-display text-5xl md:text-7xl font-light tracking-tight leading-[0.95] text-balance">
          {w.title}
        </h2>
        <p className="mt-6 max-w-xl text-muted-foreground leading-relaxed">{w.desc}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-[11px] tracking-[0.2em] text-foreground/80">
          <span>{w.date}</span>
          <span className="h-3 w-px bg-white/20" />
          <span>{w.loc}</span>
        </div>
        <div className="mt-10">
          <MagneticButton variant="primary">Register interest →</MagneticButton>
        </div>
      </article>
    </Reveal>
  );
}

function WorkshopCard({ w }: { w: typeof WORKSHOPS[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <article
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
      className="glass relative overflow-hidden rounded-3xl p-7 transition-all duration-500 hover:-translate-y-1.5 hover:glow-electric"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.3em] text-gold/80">{w.tag.toUpperCase()}</span>
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">{w.date}</span>
      </div>
      <h3 className="mt-5 font-display text-2xl tracking-tight leading-snug">{w.title}</h3>
      <div className="mt-2 text-xs text-muted-foreground">{w.loc}</div>

      <div
        className="grid transition-[grid-template-rows] duration-500 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="mt-5 text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
          <div className="mt-5 inline-flex items-center gap-2 text-xs text-gold">Register →</div>
        </div>
      </div>
    </article>
  );
}
