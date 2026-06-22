import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { WolfNetwork } from "../components/WolfNetwork";
import { Reveal } from "../components/Reveal";
import { MagneticButton } from "../components/MagneticButton";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Mrinal Agarwal · WOLF" },
      { name: "description", content: "Mrinal Agarwal is an AI safety researcher studying deception, trust, and reasoning in AI systems, and building public AI literacy through workshops and education." },
      { property: "og:title", content: "About — Mrinal Agarwal" },
      { property: "og:description", content: "Building safer and more trustworthy AI through research, education, and public engagement." },
    ],
  }),
  component: About,
});

// ─── Data ────────────────────────────────────────────────────────────────────

const RESEARCH_CARDS = [
  {
    icon: "◎",
    title: "AI Safety",
    body: "Studying how AI systems can be made more reliable, transparent, and trustworthy as they become integrated into everyday life.",
  },
  {
    icon: "◈",
    title: "AI Deception",
    body: "Understanding when and why language models produce deceptive or misleading behavior, and what conditions make it more or less likely.",
  },
  {
    icon: "⬡",
    title: "Interpretability",
    body: "Developing methods for understanding what AI systems are doing internally and making their reasoning visible, auditable, and transparent.",
  },
  {
    icon: "△",
    title: "Multi-Agent Systems",
    body: "Studying how multiple AI agents cooperate, compete, and influence one another in structured social environments.",
  },
  {
    icon: "◇",
    title: "Public AI Literacy",
    body: "Helping communities understand AI through workshops, demonstrations, and educational programs designed for non-technical audiences.",
  },
];

const MILESTONES = [
  {
    year: "2022",
    tag: "Origins",
    title: "Began AI Safety Research",
    desc: "Started exploring the intersection of language models, game theory, and deception. The central question: can we measure trustworthiness in AI systems the same way we measure capability? This led to a year of reading, prototyping, and framing what would become WOLF.",
  },
  {
    year: "2023",
    tag: "Research",
    title: "Development of WOLF",
    desc: "Designed and built WOLF, a multi-agent evaluation framework built around the social deduction game Werewolf. Over 100 experimental runs with 8 AI agents each, producing 7,320 measurable statements across structured night-day cycles, debate turns, and voting rounds.",
  },
  {
    year: "Dec 2024",
    tag: "Recognition",
    title: "NeurIPS Spotlight",
    desc: "WOLF research was spotlighted at NeurIPS 2024 in Vancouver, reaching an audience of 400+ researchers, educators, and industry professionals. Key finding: AI agents produced deceptive statements in 31% of strategic opportunities, with peer detection reaching 71 to 73% precision.",
  },
  {
    year: "2025",
    tag: "Education",
    title: "Community AI Literacy Workshops",
    desc: "Launched a series of AI literacy and safety workshops for libraries, schools, senior centers, and community organizations. The goal: make AI safety research accessible to everyone, not just researchers.",
  },
  {
    year: "2025+",
    tag: "Next",
    title: "Interpretability and Safeguards",
    desc: "Expanding into representation analysis, mechanistic interpretability, and AI safeguards. The next goal is not just observing AI behavior from the outside, but understanding why it happens from the inside, and building tools that help researchers and the public see it.",
  },
];

const ACHIEVEMENTS = [
  { icon: "◉", title: "NeurIPS Spotlight Research", desc: "Research on AI deception and trust spotlighted at NeurIPS 2024, Vancouver.", accent: true },
  { icon: "◈", title: "AACL-IJCNLP Research", desc: "Published research at the Asia-Pacific Chapter of the Association for Computational Linguistics.", accent: false },
  { icon: "△", title: "SAT Score 1560", desc: "Near-perfect score, 98th percentile nationally.", accent: false },
  { icon: "◇", title: "AIME Qualifier", desc: "Qualified for the American Invitational Mathematics Examination.", accent: false },
  { icon: "○", title: "Nationally Ranked Debater", desc: "Nationally ranked competitor in Public Forum Debate.", accent: false },
  { icon: "⬡", title: "Founder, MathSim", desc: "Founded MathSim, an educational mathematics simulation platform.", accent: false },
  { icon: "⊕", title: "Founder, DebateSim", desc: "Founded DebateSim, an AI-powered debate practice platform.", accent: false },
];

// ─── Root component ───────────────────────────────────────────────────────────

function About() {
  return (
    <div>
      <HeroSection />
      <MissionSection />
      <ResearchFocusSection />
      <JourneySection />
      <SelectedWorkSection />
      <CommunityImpactSection />
      <AchievementsSection />
      <LookingAheadSection />
      <CtaSection />
    </div>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-28 sm:pt-32 pb-16">
      <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-20 items-end">

        {/* Portrait */}
        <Reveal>
          <div className="relative w-full overflow-hidden rounded-3xl glass-strong"
            style={{ aspectRatio: "3/4" }}>
            <div className="absolute inset-0" style={{
              background:
                "radial-gradient(circle at 28% 22%, color-mix(in oklab, var(--gold) 22%, transparent), transparent 55%)," +
                "radial-gradient(circle at 72% 78%, color-mix(in oklab, var(--electric) 18%, transparent), transparent 55%)," +
                "linear-gradient(160deg, color-mix(in oklab, var(--surface) 85%, black) 0%, var(--surface-2) 100%)",
            }} />
            {/* Subtle grid */}
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            <div className="absolute inset-0 grid place-items-center">
              <span className="font-display font-light select-none"
                style={{ fontSize: "clamp(8rem,22vw,18rem)", color: "color-mix(in oklab, var(--foreground) 7%, transparent)", lineHeight: 1 }}>
                M
              </span>
            </div>
            {/* Name badge */}
            <div className="absolute bottom-5 left-5 right-5 glass rounded-2xl px-5 py-4 flex items-center justify-between">
              <div>
                <div className="font-mono text-[9px] tracking-[0.35em] text-muted-foreground/70 mb-1">AI SAFETY RESEARCHER</div>
                <div className="font-display text-lg tracking-tight">Mrinal Agarwal</div>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-gold shadow-[0_0_14px_var(--gold)]" />
            </div>
          </div>
        </Reveal>

        {/* Headline */}
        <div>
          <Reveal delay={160}>
            <h1 className="font-display text-[clamp(3rem,6vw,5.5rem)] font-light tracking-[-0.03em] leading-[1.02] text-balance">
              Building safer and more trustworthy{" "}
              <span className="text-foreground/40">artificial intelligence.</span>
            </h1>
          </Reveal>
          <Reveal delay={260}>
            <p className="mt-8 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              Through research, education, and public engagement, I study the gap between what
              AI systems appear to do and what they are actually doing. That gap is where trust
              breaks down, and where the most important work in AI safety lives.
            </p>
          </Reveal>
          <Reveal delay={360}>
            <div className="mt-10 flex flex-wrap gap-2">
              {["AI Safety", "AI Deception", "Multi-Agent Systems", "Interpretability", "Education"].map(tag => (
                <span key={tag} className="glass rounded-full px-3.5 py-1.5 font-mono text-[10px] tracking-[0.2em] text-foreground/60">
                  {tag}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── Mission ─────────────────────────────────────────────────────────────────

function MissionSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] glass-strong p-12 md:p-20">
          <div className="absolute inset-0 -z-10">
            <WolfNetwork phase={1} />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/90" />
          </div>

          <div className="max-w-3xl">
            <div className="font-mono text-[11px] tracking-[0.3em] text-gold/80 mb-5">WHY I DO THIS WORK</div>
            <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight leading-[1.06] text-balance">
              My interest is not simply
              <br />
              <span className="text-foreground/45">building more capable AI.</span>
            </h2>
            <div className="mt-9 space-y-5 max-w-2xl">
              <p className="text-base text-muted-foreground leading-relaxed">
                I want to understand how AI systems reason, where they fail, when they become
                misleading, and how we can design methods that make them more transparent,
                trustworthy, and aligned with human values. Capability without understanding
                is not progress worth celebrating.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                Research and public education are equally important to me. As AI becomes
                integrated into everyday life, understanding its limitations is just as
                important as understanding its capabilities. The public deserves to know not
                just what AI can do, but when to question it and why.
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Research Focus ───────────────────────────────────────────────────────────

function ResearchFocusSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <Reveal>
        <div className="font-mono text-[11px] tracking-[0.3em] text-gold/80">RESEARCH FOCUS</div>
        <h2 className="mt-5 font-display text-4xl md:text-5xl font-light tracking-tight leading-[1.06] max-w-3xl text-balance">
          Five areas. One question:{" "}
          <span className="text-foreground/45">can we trust it?</span>
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {RESEARCH_CARDS.map((card, i) => (
          <Reveal key={card.title} delay={i * 80}>
            <ResearchCard {...card} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ResearchCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="glass group relative h-full overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:-translate-y-1.5 hover:glow-electric cursor-default"
    >
      <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-electric/6 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="font-mono text-xl transition-colors duration-300"
        style={{ color: hovered ? "var(--gold)" : "color-mix(in oklab, var(--foreground) 28%, transparent)" }}>
        {icon}
      </div>
      <h3 className="mt-5 font-display text-[1.15rem] tracking-tight leading-snug">{title}</h3>
      <p className="mt-3 text-sm text-muted-foreground leading-[1.75]">{body}</p>
    </article>
  );
}

// ─── Journey (timeline) ───────────────────────────────────────────────────────

function JourneySection() {
  const [expanded, setExpanded] = useState<number | null>(2);

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-16 lg:grid-cols-[380px_1fr] items-start">
        <Reveal>
          <div className="lg:sticky lg:top-28">
            <div className="font-mono text-[11px] tracking-[0.3em] text-gold/80">RESEARCH JOURNEY</div>
            <h2 className="mt-5 font-display text-4xl md:text-5xl font-light tracking-tight leading-[1.06] text-balance">
              How the work
              <br />
              <span className="text-foreground/45">took shape.</span>
            </h2>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
              Each milestone built on the last. Click any entry to read more.
            </p>
          </div>
        </Reveal>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[1.15rem] top-3 bottom-3 w-px bg-gradient-to-b from-gold/40 via-white/10 to-transparent" />

          <div className="space-y-0">
            {MILESTONES.map((m, i) => (
              <Reveal key={m.title} delay={i * 80}>
                <TimelineItem
                  {...m}
                  isExpanded={expanded === i}
                  onClick={() => setExpanded(expanded === i ? null : i)}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineItem({
  year, tag, title, desc, isExpanded, onClick,
}: {
  year: string; tag: string; title: string; desc: string;
  isExpanded: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex gap-6 pb-8 group"
    >
      {/* Dot */}
      <div className="relative flex-shrink-0 pt-1">
        <div className={`h-[9px] w-[9px] rounded-full border-2 transition-all duration-300 ${
          isExpanded ? "border-gold bg-gold shadow-[0_0_12px_var(--gold)]" : "border-white/20 bg-background group-hover:border-white/50"
        }`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1.5">
          <span className="font-mono text-[9px] tracking-[0.28em] text-muted-foreground/50 uppercase">{year}</span>
          <span className={`font-mono text-[9px] tracking-[0.22em] uppercase border rounded-full px-2 py-0.5 transition-colors ${
            isExpanded ? "text-gold border-gold/30 bg-gold/8" : "text-muted-foreground/40 border-white/10"
          }`}>{tag}</span>
        </div>
        <h3 className={`font-display text-xl tracking-tight leading-snug transition-colors ${isExpanded ? "text-foreground" : "text-foreground/70 group-hover:text-foreground"}`}>
          {title}
        </h3>
        <div
          className="grid transition-[grid-template-rows] duration-500 ease-out"
          style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <p className="pt-4 text-sm text-muted-foreground leading-relaxed max-w-lg">
              {desc}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Selected Work ────────────────────────────────────────────────────────────

function SelectedWorkSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <Reveal>
        <div className="font-mono text-[11px] tracking-[0.3em] text-gold/80">SELECTED WORK</div>
        <h2 className="mt-5 font-display text-4xl md:text-5xl font-light tracking-tight leading-[1.06] max-w-3xl text-balance">
          What I am building.
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {/* WOLF card */}
        <Reveal delay={80}>
          <article className="relative overflow-hidden rounded-[2rem] glass-strong p-10 md:p-12 group h-full">
            <div className="absolute inset-0 -z-10">
              <WolfNetwork phase={3} />
              <div className="absolute inset-0 bg-gradient-to-tr from-background/90 via-background/55 to-transparent" />
            </div>
            <div className="font-mono text-[10px] tracking-[0.3em] text-gold/80">FEATURED RESEARCH</div>
            <h3 className="mt-4 font-display text-4xl md:text-5xl font-light tracking-tight leading-[0.97]">WOLF</h3>
            <p className="mt-5 text-muted-foreground leading-relaxed max-w-sm">
              A study of deception, trust, and reasoning in multi-agent AI systems.
              Eight agents. One hundred runs. Seven thousand statements measured.
            </p>
            <div className="mt-6 flex items-center gap-3 font-mono text-[10px] tracking-[0.2em] text-muted-foreground/60">
              <span className="text-gold/80">NeurIPS Spotlight</span>
              <span className="h-3 w-px bg-white/20" />
              <span>arXiv 2512.09187</span>
            </div>
            <div className="mt-8">
              <MagneticButton href="/research" variant="primary">
                Explore Research
                <span className="opacity-75">→</span>
              </MagneticButton>
            </div>
          </article>
        </Reveal>

        {/* Future card */}
        <Reveal delay={180}>
          <article className="glass relative overflow-hidden rounded-[2rem] p-10 md:p-12 h-full">
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-electric/8 blur-3xl" />
            <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground/50">IN PROGRESS</div>
            <h3 className="mt-4 font-display text-4xl md:text-5xl font-light tracking-tight leading-[0.97] text-foreground/80">
              What's Next
            </h3>
            <div className="mt-6 space-y-3">
              {[
                "Mechanistic interpretability of deceptive circuits",
                "Representation analysis across model families",
                "AI safeguards and detection methods",
                "Public AI literacy tools",
              ].map(item => (
                <div key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-2 h-1 w-1 rounded-full bg-electric/70 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-xs font-mono tracking-[0.18em] text-muted-foreground/40 uppercase">
              This card evolves as research progresses.
            </p>
          </article>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Community Impact ─────────────────────────────────────────────────────────

function CommunityImpactSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-16 lg:grid-cols-[1fr_2fr] items-center">
        <Reveal>
          <div>
            <div className="font-mono text-[11px] tracking-[0.3em] text-gold/80">COMMUNITY IMPACT</div>
            <h2 className="mt-5 font-display text-4xl md:text-5xl font-light tracking-tight leading-[1.06] text-balance">
              Research beyond
              <br />
              <span className="text-foreground/45">the lab.</span>
            </h2>
            <p className="mt-7 text-base text-muted-foreground leading-relaxed">
              Research should benefit the people most affected by it. I have spent four years
              teaching, presenting, and building tools that make AI safety research accessible
              to communities far outside academia.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-4">
          <StatCard value={4} suffix="+" label="Years Teaching Ages 12 to 18" />
          <StatCard value={400} suffix="+" label="Researchers, Educators & Professionals" />
          <StatCard value="NeurIPS" label="Spotlight Research" />
          <StatCard value="Public" label="AI Safety Workshops" />
        </div>
      </div>
    </section>
  );
}

function StatCard({ value, suffix = "", label }: { value: number | string; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);
  const [count, setCount] = useState(0);
  const numericValue = typeof value === "number" ? value : 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTriggered(true); },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!triggered || typeof value !== "number") return;
    let raf: number;
    const start = performance.now();
    const dur = 1800;
    const step = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * numericValue));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [triggered, numericValue, value]);

  const display = typeof value === "number" ? `${count}${suffix}` : value;

  return (
    <Reveal>
      <div ref={ref} className="glass relative overflow-hidden rounded-3xl p-8 text-center group hover:-translate-y-1 hover:glow-electric transition-all duration-500 cursor-default">
        <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-0 bg-electric/4" />
        </div>
        <div className="font-display font-light text-gold leading-none"
          style={{ fontSize: "clamp(2.8rem,7vw,4.5rem)" }}>
          {display}
        </div>
        <div className="mt-3 font-mono text-[10px] tracking-[0.22em] text-muted-foreground/55 uppercase leading-snug">
          {label}
        </div>
      </div>
    </Reveal>
  );
}

// ─── Achievements ─────────────────────────────────────────────────────────────

function AchievementsSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <Reveal>
        <div className="font-mono text-[11px] tracking-[0.3em] text-gold/80">SELECTED ACHIEVEMENTS</div>
        <h2 className="mt-5 font-display text-4xl md:text-5xl font-light tracking-tight leading-[1.06] max-w-3xl text-balance">
          A record of
          <span className="text-foreground/45"> milestones.</span>
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ACHIEVEMENTS.map((a, i) => (
          <Reveal key={a.title} delay={i * 60}>
            <AchievementCard {...a} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function AchievementCard({ icon, title, desc, accent }: { icon: string; title: string; desc: string; accent: boolean }) {
  return (
    <article className={`glass group relative overflow-hidden rounded-3xl p-6 transition-all duration-500 hover:-translate-y-1.5 cursor-default ${accent ? "hover:glow-gold" : "hover:glow-electric"}`}>
      <div className={`absolute -top-10 -right-10 h-20 w-20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${accent ? "bg-gold/10" : "bg-electric/8"}`} />
      <div className={`font-mono text-lg ${accent ? "text-gold/70" : "text-foreground/30 group-hover:text-foreground/50 transition-colors"}`}>
        {icon}
      </div>
      <h3 className="mt-4 font-display text-base tracking-tight leading-snug">{title}</h3>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </article>
  );
}

// ─── Looking Ahead ────────────────────────────────────────────────────────────

function LookingAheadSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-16 lg:grid-cols-2 items-center">
        <Reveal>
          <div>
            <div className="font-mono text-[11px] tracking-[0.3em] text-gold/80">LOOKING AHEAD</div>
            <h2 className="mt-5 font-display text-5xl md:text-6xl font-light tracking-[-0.03em] leading-[1.02] text-balance">
              What's next?
            </h2>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="space-y-6">
            <p className="text-base text-muted-foreground leading-relaxed">
              The next decade of AI research will not just be about making systems more
              powerful. It will be about making them more understandable, more honest, and
              more aligned with the values of the communities they serve.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              I am working toward tools that let researchers, educators, and the public look
              inside AI systems and understand what they are doing. Not just what the output
              is, but why the system produced it and whether it can be trusted.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              Public AI education is a core part of this work. The research should benefit
              the people most affected by AI, not just the people building it. That belief
              shapes every workshop, every paper, and every line of code I write.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              {["AI Deception", "Mechanistic Interpretability", "Representation Analysis", "AI Safeguards", "Public Education"].map(item => (
                <span key={item} className="glass rounded-full px-3.5 py-1.5 font-mono text-[10px] tracking-[0.18em] text-foreground/55">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────

function CtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] glass-strong p-12 md:p-20 text-center">
          <div className="absolute inset-0 -z-10">
            <WolfNetwork phase={4} />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background/80" />
          </div>
          <div className="font-mono text-[11px] tracking-[0.3em] text-gold/80 mb-5">GET INVOLVED</div>
          <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight leading-[1.06] text-balance max-w-2xl mx-auto">
            Let's build safer AI together.
          </h2>
          <p className="mt-6 max-w-lg mx-auto text-muted-foreground leading-relaxed">
            Whether you are a researcher, educator, community organizer, or curious learner,
            there is a way to engage with this work.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <MagneticButton href="/research" variant="primary">Research</MagneticButton>
            <MagneticButton href="/workshops" variant="ghost">Workshops</MagneticButton>
            <MagneticButton href="mailto:smmrinal2009@gmail.com" variant="ghost">Contact</MagneticButton>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
