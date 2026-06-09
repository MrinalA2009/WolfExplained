import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { WolfNetwork } from "../components/WolfNetwork";
import { MagneticButton } from "../components/MagneticButton";
import { Reveal } from "../components/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WOLF — Understanding Deception in Artificial Intelligence" },
      { name: "description", content: "A research platform studying deception, trust, and social reasoning in LLMs. arXiv 2512.09187." },
      { property: "og:title", content: "WOLF — Understanding Deception in AI" },
      { property: "og:description", content: "Research by Mrinal Agarwal · arXiv 2512.09187" },
    ],
  }),
  component: Home,
});

// Scroll story data — grounded in paper findings
const QUESTIONS = [
  "Can AI deceive?",
  "Can AI manipulate?",
  "Can AI recognize deception?",
  "Can AI learn who to trust?",
];

const STAGE_STAT = [
  "Werewolves produced deceptive statements in 31% of turns",
  "2 wolves influenced a network of 8 agents",
  "Peer detection reached 71–73% precision",
  "Suspicion toward wolves rose from 52% to 60%+ across rounds",
];

// Bottom-left network state label — gives scientific context to the visual
const NETWORK_LABEL = [
  "Network: stable · roles concealed",
  "Deception: active",
  "Influence: propagating",
  "Detection: beginning",
  "Resolution: trust mapped",
];

function Home() {
  return (
    <>
      <Hero />
      <ScrollStory />
      <PillarsSection />
      <CtaSection />
    </>
  );
}

function Hero() {
  return (
    <section className="relative h-[100svh] min-h-[680px] w-full overflow-hidden">
      <div className="absolute inset-0">
        {/* Phase 0: all nodes appear equal — wolves are hidden, mystery intact */}
        <WolfNetwork phase={0} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_30%,var(--background)_85%)]" />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <Reveal>
          <div className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-mono uppercase tracking-[0.22em] text-foreground/75">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-55" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
            </span>
            arXiv · 2512.09187
          </div>
        </Reveal>

        <Reveal delay={120}>
          <h1 className="mt-8 font-display text-[clamp(4.5rem,14vw,12rem)] font-light leading-[0.88] tracking-[-0.04em]">
            <span className="bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
              WOLF
            </span>
          </h1>
        </Reveal>

        <Reveal delay={240}>
          <p className="mt-7 max-w-lg text-pretty text-base sm:text-lg text-foreground/65 font-light leading-relaxed">
            Werewolf-based Observations for LLM Deception and Falsehoods.
            <span className="block mt-2 text-sm text-muted-foreground/80">
              Research by{" "}
              <span className="text-foreground/85">Mrinal Agarwal</span>
            </span>
          </p>
        </Reveal>

        <Reveal delay={380}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <MagneticButton href="/experience" variant="primary">
              Experience WOLF
              <span className="opacity-75">→</span>
            </MagneticButton>
            <MagneticButton href="/research" variant="ghost">
              Read the research
            </MagneticButton>
          </div>
        </Reveal>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/50">
          <span>Scroll to begin</span>
          <span className="h-7 w-px bg-gradient-to-b from-muted-foreground/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}

function ScrollStory() {
  const ref = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);    // discrete 0–4, drives text
  const [phase, setPhase] = useState(0);    // continuous 0–4, drives network visual

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const rect  = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const passed = Math.min(Math.max(-rect.top, 0), total);
      const t = total > 0 ? passed / total : 0;        // 0–1
      const continuous = t * 4;                        // 0–4
      setPhase(continuous);
      setStage(Math.min(4, Math.floor(continuous)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isReveal = stage >= 4;

  return (
    // 100vh per stage × 5 stages — users must scroll intentionally through each question
    <section ref={ref} className="relative" style={{ height: "500vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">

        {/* Network visual transforms with scroll */}
        <WolfNetwork phase={phase} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/55 via-transparent to-background/55 pointer-events-none" />

        {/* Network state — bottom-left scientific caption */}
        <div className="absolute bottom-10 left-7 z-10 font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground/30 select-none">
          {NETWORK_LABEL[stage]}
        </div>

        {/* Main text — key={stage} re-mounts and re-runs animate-story-in on stage change */}
        <div className="relative z-10 flex h-full items-center justify-center px-6">
          {!isReveal ? (
            <div key={stage} className="text-center animate-story-in max-w-3xl">
              <div className="font-mono text-[11px] tracking-[0.32em] text-gold/55 mb-5">
                {String(stage + 1).padStart(2, "0")} / 04
              </div>
              <h2 className="font-display text-[clamp(2.4rem,5.5vw,4.5rem)] font-light tracking-tight leading-[1.1]">
                {QUESTIONS[stage]}
              </h2>
              <p className="mt-7 text-[12.5px] font-mono tracking-[0.14em] text-muted-foreground/40">
                {STAGE_STAT[stage]}
              </p>
            </div>
          ) : (
            <div key="reveal" className="text-center animate-story-in">
              <div className="font-mono text-[11px] tracking-[0.3em] text-gold mb-5">
                THE ANSWER
              </div>
              <h2 className="font-display text-[clamp(2.6rem,7vw,5.5rem)] font-light tracking-tight leading-[1.04]">
                We tested it.
              </h2>
              <p className="mt-6 max-w-md mx-auto text-muted-foreground leading-relaxed">
                100 runs. 7,320 statements. 8 agents per game. Can LLMs deceive — and be caught?
              </p>
              <div className="mt-10">
                <MagneticButton href="/research" variant="primary">
                  See what we found
                </MagneticButton>
              </div>
            </div>
          )}
        </div>

        {/* Progress indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {QUESTIONS.map((_, i) => (
            <span
              key={i}
              className="rounded-full transition-all duration-500"
              style={{
                height: "2px",
                width: i === stage && !isReveal ? "28px" : "6px",
                background: i < stage || isReveal
                  ? "var(--gold)"
                  : i === stage
                  ? "var(--gold)"
                  : "rgba(248,250,252,0.14)",
                boxShadow: i === stage && !isReveal ? "0 0 8px var(--gold)" : "none",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PillarsSection() {
  const pillars = [
    {
      kicker: "01 · Methodology",
      title: "A game built for measurement",
      body: "WOLF turns Werewolf into a controlled laboratory — every message, vote, and silence becomes a measurable signal of strategic reasoning. Agents run on a LangGraph state machine with night–day cycles and structured debate turns.",
    },
    {
      kicker: "02 · Trust dynamics",
      title: "Networks that evolve in real time",
      body: "Suspicion toward Werewolves rises from ~52% to over 60% across rounds. We track how alliances form, betray, and reform — and measure when the network's belief state diverges from ground truth.",
    },
    {
      kicker: "03 · Discovery",
      title: "Findings that redefined the question",
      body: "Peer detection reached 71–73% precision with ~52% overall accuracy. Extended interaction improved recall against liars without compounding errors against truthful agents.",
    },
  ];

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-28">
      <Reveal>
        <div className="max-w-3xl">
          <div className="font-mono text-[11px] tracking-[0.3em] text-gold/75">THE FRAMEWORK</div>
          <h2 className="mt-5 font-display text-5xl md:text-6xl font-light tracking-tight leading-[1.06] text-balance">
            Studying intelligence
            <br />
            <span className="text-foreground/50">by studying its shadows.</span>
          </h2>
        </div>
      </Reveal>

      <div className="mt-18 grid gap-5 md:grid-cols-3">
        {pillars.map((p, i) => (
          <Reveal key={p.kicker} delay={i * 110}>
            <article className="glass group relative h-full overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:-translate-y-1.5 hover:glow-electric">
              <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-electric/8 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="font-mono text-[10px] tracking-[0.3em] text-gold/75">{p.kicker}</div>
              <h3 className="mt-5 font-display text-[1.35rem] tracking-tight leading-snug">{p.title}</h3>
              <p className="mt-4 text-sm text-muted-foreground leading-[1.7]">{p.body}</p>
              <div className="mt-7 flex items-center gap-2 text-xs text-foreground/55 group-hover:text-gold transition-colors">
                <a href="https://arxiv.org/abs/2512.09187" target="_blank" rel="noopener noreferrer">Paper description</a>
                <span>→</span>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] glass-strong p-12 md:p-20">
          {/* Phase 4: resolved network — the pattern has been found */}
          <div className="absolute inset-0 -z-10">
            <WolfNetwork phase={4} />
            <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/45 to-background/85" />
          </div>
          <div className="font-mono text-[11px] tracking-[0.3em] text-gold/75">EXPERIENCE</div>
          <h2 className="mt-4 max-w-2xl font-display text-4xl md:text-5xl font-light tracking-tight leading-[1.06] text-balance">
            Watch eight minds reason, lie,<br className="hidden md:block" /> and uncover the truth.
          </h2>
          <p className="mt-5 max-w-lg text-muted-foreground leading-relaxed">
            Step inside a live WOLF simulation. Pause at any moment. Inspect trust scores.
            Watch suspicion accumulate across rounds.
          </p>
          <div className="mt-9">
            <MagneticButton href="/experience" variant="primary">
              Launch the simulator
              <span className="opacity-75">→</span>
            </MagneticButton>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
