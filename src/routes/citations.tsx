import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "../components/Reveal";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/citations")({
  head: () => ({
    meta: [
      { title: "Citations — WOLF" },
      { name: "description", content: "Papers citing WOLF (arXiv 2512.09187) — research building on WOLF's framework for studying deception, trust, and social reasoning in LLMs." },
      { property: "og:title", content: "WOLF Citations" },
      { property: "og:description", content: "6 papers citing WOLF — arXiv 2512.09187." },
    ],
  }),
  component: Citations,
});

const PAPERS = [
  {
    n: "01",
    title: "Multicultural Spyfall: Assessing LLMs through Dynamic Multilingual Social Deduction Game",
    authors: "Haryo Akbarianto Wibowo, Alaa Elsetohy, Qinrong Cui, Alham Fikri Aji",
    venue: "arXiv · January 2026",
    href: "https://arxiv.org/abs/2601.09017",
  },
  {
    n: "02",
    title: "Can LLMs deliberate? Benchmarking Collective Reasoning for Democratic AI Applications",
    authors: "M. Flechtner",
    venue: "Trustworthy AI for Good Workshop @ ICML · 2025",
    href: "https://openreview.net/forum?id=nw6d3107YU",
  },
  {
    n: "03",
    title: "From Hallucination to Scheming: A Unified Taxonomy and Benchmark Analysis for LLM Deception",
    authors: "Jerick Shi, Terry Jingcheng Zhang, Zhijing Jin, Vincent Conitzer",
    venue: "arXiv · April 2026",
    href: "https://arxiv.org/abs/2604.04788",
  },
  {
    n: "04",
    title: "One Model, All Roles: Multi-Turn, Multi-Agent Self-Play Reinforcement Learning for Conversational Social Intelligence",
    authors: "Bowen Jiang, Taiwei Shi, Ryo Kamoi, Yuan Yuan, C. J. Taylor, Longqi Yang, Pei Zhou, Sihao Chen",
    venue: "arXiv · February 2026",
    href: "https://arxiv.org/abs/2602.03109",
  },
  {
    n: "05",
    title: "Towards Generalist Game Players: An Investigation of Foundation Models in the Game Multiverse",
    authors: "Kuan Zhang, Dong Liu, Qiyue Zhao, Tianyu Xin, Yuejiao Su, Haisheng Wang, et al.",
    venue: "arXiv · May 2026",
    href: "https://arxiv.org/abs/2605.09965",
  },
  {
    n: "06",
    title: "Cheap Talk, Empty Promise: Frontier LLMs easily break public promises for self-interest",
    authors: "Jerick Shi, Terry Jingcheng Zhang, Zhijing Jin, Vincent Conitzer",
    venue: "arXiv · April 2026",
    href: "https://arxiv.org/abs/2604.04782",
  },
];

function Citations() {
  return (
    <div>
      <PageHeader
        section="Citations"

        title={<>Research building on <span className="text-foreground/55">WOLF's framework.</span></>}
        description="These papers cite WOLF (arXiv 2512.09187), extending its framework for studying deception, trust, and social reasoning in large language models across new settings and methodologies."
      />

      <section className="mx-auto max-w-7xl px-6 mt-8 pb-32">
        <Reveal delay={100}>
          <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 font-mono text-[11px] tracking-[0.2em] text-muted-foreground/70">
            <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_6px_var(--gold)]" />
            Citing WOLF · arXiv 2512.09187
          </div>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2">
          {PAPERS.map((p, i) => (
            <Reveal key={p.n} delay={i * 80}>
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass group relative flex h-full flex-col overflow-hidden rounded-3xl p-7 transition-all duration-500 hover:-translate-y-1.5 hover:glow-electric"
              >
                <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-electric/8 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-3xl text-gold/70">{p.n}</span>
                  <span className="mt-1 text-muted-foreground/40 transition-colors group-hover:text-gold">
                    ↗
                  </span>
                </div>

                <h3 className="mt-4 font-display text-[1.1rem] leading-snug tracking-tight text-balance flex-1">
                  {p.title}
                </h3>

                <div className="mt-5 space-y-1">
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {p.authors}
                  </p>
                  <p className="font-mono text-[10px] tracking-[0.18em] text-gold/60 uppercase">
                    {p.venue}
                  </p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={600}>
          <div className="mt-16 glass-strong rounded-3xl p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-1">
              <div className="font-mono text-[10px] tracking-[0.3em] text-gold/75 mb-2">ORIGINAL PAPER</div>
              <p className="font-display text-lg tracking-tight">
                WOLF: Werewolf-based Observations for LLM Deception and Falsehoods
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Mrinal Agarwal · arXiv 2512.09187</p>
            </div>
            <a
              href="https://arxiv.org/abs/2512.09187"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-background hover:brightness-110 transition"
            >
              Paper description
              <span className="opacity-75">↗</span>
            </a>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
