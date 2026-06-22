import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "../components/Reveal";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research — WOLF" },
      { name: "description", content: "An interactive walkthrough of the WOLF research paper: methodology, trust dynamics, and findings on AI deception." },
      { property: "og:title", content: "WOLF Research" },
      { property: "og:description", content: "Methodology, trust dynamics, and findings." },
    ],
  }),
  component: Research,
});

// Suspicion scores from paper (arXiv 2512.09187) — average suspicion each role received from peers
const ROLES = [
  { name: "Doctor", suspicion: 61 },
  { name: "Seer", suspicion: 55 },
  { name: "Werewolf", suspicion: 53 },
  { name: "Villager", suspicion: 48 },
];

function Research() {
  const max = Math.max(...ROLES.map(r => r.suspicion));

  return (
    <div>
      <PageHeader
        section="Research"

        title={<>What language models reveal <span className="text-foreground/55">when they're forced to lie.</span></>}
        description="WOLF is a multi-agent benchmark built around the social deduction game Werewolf. Across 100 runs we recorded 7,320 statements — every utterance, vote, and inferred relationship — building a quantitative window into deception, persuasion, and social reasoning in LLMs."
      />

      <section className="mx-auto max-w-7xl px-6">
        <Reveal delay={150}>
          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            <Big label="Runs conducted" value="100" />
            <Big label="Statements analyzed" value="7,320" accent="gold" />
            <Big label="Werewolf deceptive turns" value="31%" accent="electric" />
          </div>
        </Reveal>
      </section>

      {/* Methodology */}
      <section className="mx-auto max-w-7xl px-6 mt-32">
        <Reveal>
          <div className="font-mono text-[11px] tracking-[0.3em] text-gold/80">01 · METHODOLOGY</div>
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-light tracking-tight max-w-3xl text-balance">
            A game becomes a measurement instrument.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {[
            { n: "01", t: "Hidden roles", d: "Eight agents per game: 4 Villagers, 2 Werewolves, 1 Seer, 1 Doctor. Wolves know each other; no one else does." },
            { n: "02", t: "Structured dialogue", d: "Night–day cycles alternate with debate phases using a bidding system. Avg. 3.4 nights, 16.1 debate turns, 2.6 voting rounds per run." },
            { n: "03", t: "Deception taxonomy", d: "Every statement is labelled across four categories: omission, distortion, fabrication, and misdirection — enabling fine-grained analysis." },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <div className="glass relative h-full overflow-hidden rounded-3xl p-7 transition hover:-translate-y-1 hover:glow-electric">
                <div className="font-mono text-3xl text-gold/80">{s.n}</div>
                <h3 className="mt-4 font-display text-xl">{s.t}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Suspicion chart */}
      <section className="mx-auto max-w-7xl px-6 mt-32">
        <Reveal>
          <div className="font-mono text-[11px] tracking-[0.3em] text-gold/80">02 · RESULTS</div>
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-light tracking-tight max-w-3xl text-balance">
            Average suspicion score by role.
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            How often each role was suspected of being a Werewolf — averaged across all 100 runs.
            Detection reached 71–73% precision with ~52% overall accuracy.
          </p>
        </Reveal>

        <div className="glass-strong mt-8 rounded-3xl p-6 sm:p-10">
          <div className="space-y-5">
            {ROLES.map((r) => {
              const w = (r.suspicion / max) * 100;
              return (
                <div key={r.name} className="group">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono tracking-[0.2em] text-foreground/80">{r.name}</span>
                    <span className="font-display text-base text-foreground/90">{r.suspicion}<span className="text-muted-foreground text-sm">%</span></span>
                  </div>
                  <div className="mt-2 h-2.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${w}%`,
                        background: "linear-gradient(90deg, var(--electric), var(--gold))",
                        boxShadow: "0 0 18px color-mix(in oklab, var(--gold) 40%, transparent)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Findings */}
      <section className="mx-auto max-w-7xl px-6 mt-32">
        <Reveal>
          <div className="font-mono text-[11px] tracking-[0.3em] text-gold/80">03 · FINDINGS</div>
        </Reveal>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {[
            { t: "Deception is sparse but strategic.", d: "Werewolves deployed deceptive statements in only 31% of turns — suggesting selective use over saturation." },
            { t: "Peer detection is precise, not comprehensive.", d: "Agents achieved 71–73% precision in identifying Werewolves, but overall recall kept accuracy near 52%." },
            { t: "Suspicion accumulates across rounds.", d: "Average suspicion toward Werewolves rose from ~52% to over 60% as games progressed — recall improves without compounding false-positive errors." },
            { t: "Wolves dominate despite the odds.", d: "Werewolves won 70% of games with just 2 of 8 agents, underscoring how structural information asymmetry amplifies deceptive advantage." },
          ].map((f, i) => (
            <Reveal key={f.t} delay={i * 100}>
              <article className="glass rounded-3xl p-7 hover:-translate-y-1 hover:glow-electric transition">
                <h3 className="font-display text-xl leading-snug text-balance">{f.t}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.d}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

function Big({ label, value, accent }: { label: string; value: string; accent?: "gold" | "electric" }) {
  const color = accent === "gold" ? "var(--gold)" : accent === "electric" ? "var(--electric)" : undefined;
  return (
    <div className="glass rounded-3xl p-7">
      <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">{label.toUpperCase()}</div>
      <div className="mt-3 font-display text-5xl font-light tracking-tight" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
