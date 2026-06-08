import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "../components/Reveal";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Mrinal Agarwal · WOLF" },
      { name: "description", content: "About Mrinal Agarwal, the researcher behind WOLF — studying deception, trust, and reasoning in AI." },
      { property: "og:title", content: "About — WOLF" },
      { property: "og:description", content: "Research, speaking, and teaching." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div>
      <PageHeader
        section="About"
        kicker="PRINCIPAL RESEARCHER"
        title={<>I study how minds reason <span className="text-foreground/55">when the truth is hidden.</span></>}
      />
      <section className="mx-auto max-w-7xl px-6 mt-16 grid gap-16 lg:grid-cols-[420px_1fr] items-start">
        <Reveal>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl glass-strong">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 30% 25%, color-mix(in oklab, var(--gold) 28%, transparent), transparent 60%), radial-gradient(circle at 75% 80%, color-mix(in oklab, var(--electric) 28%, transparent), transparent 60%), linear-gradient(180deg, color-mix(in oklab, var(--surface) 80%, black), var(--surface-2))",
              }}
            />
            <div className="absolute inset-0 grid place-items-center">
              <div className="font-display text-[180px] leading-none text-foreground/10 select-none">M</div>
            </div>
            <div className="absolute bottom-5 left-5 right-5 glass rounded-2xl px-4 py-3 flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">PRINCIPAL RESEARCHER</div>
                <div className="font-display text-lg">Mrinal Agarwal</div>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-gold shadow-[0_0_12px_var(--gold)]" />
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal delay={120}>
            <p className="mt-8 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              I'm Mrinal — a researcher working at the intersection of language models, game
              theory, and social cognition. WOLF is my attempt to make those questions
              measurable: a controlled environment where reasoning becomes observable
              behavior.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-10 sm:grid-cols-2">
            <Block kicker="Research focus" items={["Multi-agent deception", "Theory of mind in LLMs", "Trust calibration", "Adversarial dialogue evaluation"]} />
            <Block kicker="Publication" items={["arXiv · 2512.09187", "WOLF: Werewolf-based Observations for LLM Deception and Falsehoods", "100 runs · 7,320 statements analyzed"]} />
            <Block kicker="Workshops" items={["AI Safety & Deception · Dec 2024", "LLM Evaluation Methods · Jan 2025", "Social Reasoning in Agents · Mar 2025"]} />
            <Block kicker="Research interests" items={["Multi-agent deception frameworks", "Theory of mind in LLMs", "Trust calibration", "Social reasoning under uncertainty"]} />
          </div>

          <Reveal delay={300}>
            <div className="mt-16 flex flex-wrap gap-3">
              <Pill label="Email" value="mrinal@wolf.ai" />
              <Pill label="Scholar" value="↗ profile" />
              <Pill label="GitHub" value="↗ wolf-framework" />
              <Pill label="Twitter" value="@mrinal" />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function Block({ kicker, items }: { kicker: string; items: string[] }) {
  return (
    <Reveal>
      <div>
        <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">{kicker.toUpperCase()}</div>
        <ul className="mt-4 space-y-2.5 text-sm text-foreground/85">
          {items.map((it) => (
            <li key={it} className="flex items-start gap-3">
              <span className="mt-2 h-1 w-1 rounded-full bg-gold shrink-0" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <a href="#" className="glass btn-magnetic group rounded-full px-4 py-2.5 inline-flex items-center gap-3 text-sm hover:glow-electric">
      <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground group-hover:text-foreground">{label.toUpperCase()}</span>
      <span className="text-foreground/90">{value}</span>
    </a>
  );
}
