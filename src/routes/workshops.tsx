import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { WolfNetwork } from "../components/WolfNetwork";
import { Reveal } from "../components/Reveal";
import { MagneticButton } from "../components/MagneticButton";

export const Route = createFileRoute("/workshops")({
  head: () => ({
    meta: [
      { title: "AI Literacy & Safety Workshops — WOLF" },
      { name: "description", content: "Workshops on AI deception, hallucinations, and trust led by AI safety researcher Mrinal Agarwal. Designed for libraries, schools, and community organizations." },
      { property: "og:title", content: "AI Literacy & Safety Workshops — WOLF" },
      { property: "og:description", content: "Making AI safety research understandable, practical, and useful for everyday communities." },
    ],
  }),
  component: WorkshopsPage,
});

const LEARN_CARDS = [
  {
    icon: "○",
    title: "How AI generates responses",
    body: "What actually happens inside a language model when it reads your question and writes a reply.",
  },
  {
    icon: "◈",
    title: "Why confident AI can be wrong",
    body: "How models produce fluent, certain-sounding text even when their underlying reasoning has failed.",
  },
  {
    icon: "⬡",
    title: "Hallucinations and fabricated sources",
    body: "Where AI misinformation comes from, and why invented citations look identical to real ones.",
  },
  {
    icon: "◎",
    title: "Warning signs of unreliable output",
    body: "Specific patterns to watch for that signal an AI response may be inaccurate or misleading.",
  },
  {
    icon: "◇",
    title: "Practical verification strategies",
    body: "Concrete methods for checking AI-generated claims before acting on them in work or research.",
  },
  {
    icon: "△",
    title: "How researchers study AI deception",
    body: "A look inside current AI safety research and what it reveals about the future of trustworthy systems.",
  },
];

const AUDIENCES = [
  {
    label: "Students",
    focus: "Responsible AI use, academic research, and critical thinking about AI-generated content.",
  },
  {
    label: "Educators",
    focus: "AI in classrooms, academic integrity, and teaching students to evaluate what AI produces.",
  },
  {
    label: "Community Members",
    focus: "Everyday AI use, recognizing misinformation, scams, and building digital literacy.",
  },
  {
    label: "Libraries & Senior Centers",
    focus: "Accessible explanations, safe technology habits, and confidence with new tools.",
  },
];

const UPCOMING = [
  {
    title: "Can You Trust AI?",
    date: "Jul 14, 2025",
    time: "6:00 PM",
    location: "Online",
    desc: "An audience-participatory session exploring how language models produce misleading information and how to spot it in the wild.",
    status: "Open",
  },
  {
    title: "Understanding AI Hallucinations",
    date: "Aug 5, 2025",
    time: "5:30 PM",
    location: "Online",
    desc: "A close look at why AI systems confidently fabricate facts, citations, and events, and what that means for how we use them.",
    status: "Open",
  },
  {
    title: "Spotting Misleading AI",
    date: "Sep 9, 2025",
    time: "6:00 PM",
    location: "Online",
    desc: "Practical skills for identifying AI-generated misinformation, evaluating sources, and verifying claims before you rely on them.",
    status: "Coming Soon",
  },
  {
    title: "AI Safety for Everyday Users",
    date: "Oct 2025",
    time: "TBD",
    location: "In-Person or Online",
    desc: "A non-technical introduction to AI safety research and what it means for how we interact with AI systems in daily life.",
    status: "Coming Soon",
  },
];

const TAGS = [
  "AI Deception",
  "AI Safety",
  "Multi-Agent Systems",
  "Interpretability",
  "Education",
];

function WorkshopsPage() {
  const upcomingRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      <WorkshopHero
        onViewUpcoming={() => scrollTo(upcomingRef)}
        onContactHost={() => scrollTo(contactRef)}
      />
      <MissionSection />
      <LearnSection />
      <ResearchSection />
      <AudienceSection />
      <UpcomingSection ref={upcomingRef} />
      <InstructorSection />
      <ContactSection ref={contactRef} />
    </div>
  );
}

function WorkshopHero({
  onViewUpcoming,
  onContactHost,
}: {
  onViewUpcoming: () => void;
  onContactHost: () => void;
}) {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0">
        <WolfNetwork phase={1} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_20%,var(--background)_80%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 pt-28 pb-20 text-center">
        <Reveal>
          <div className="font-mono text-[11px] tracking-[0.3em] text-gold/80 inline-flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-gold shadow-[0_0_8px_var(--gold)]" />
            PUBLIC EDUCATION INITIATIVE
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="mt-6 font-display text-[clamp(2.8rem,7vw,6rem)] font-light tracking-[-0.03em] leading-[1.02] text-balance">
            AI Literacy{" "}
            <span className="text-foreground/45">&amp; Safety</span>
            <br />
            Workshops
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p className="mt-6 max-w-xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed text-pretty">
            Making AI safety research understandable, practical, and useful for everyday communities.
          </p>
        </Reveal>

        <Reveal delay={320}>
          <p className="mt-5 max-w-lg mx-auto text-sm text-muted-foreground/70 leading-relaxed text-pretty">
            Artificial intelligence is rapidly changing how people learn, work, and communicate.
            These workshops help participants understand how AI systems work, why they sometimes produce misleading information,
            and how to evaluate AI-generated content safely and critically.
          </p>
        </Reveal>

        <Reveal delay={440}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <MagneticButton variant="primary" onClick={onViewUpcoming}>
              View Upcoming Workshops
              <span className="opacity-75">↓</span>
            </MagneticButton>
            <MagneticButton variant="ghost" onClick={onContactHost}>
              Contact for Hosting
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function MissionSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] glass-strong p-12 md:p-20">
          <div className="absolute inset-0 -z-10">
            <WolfNetwork phase={2} />
            <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/50 to-background/85" />
          </div>

          <div className="max-w-3xl">
            <div className="font-mono text-[11px] tracking-[0.3em] text-gold/80">THE MISSION</div>
            <h2 className="mt-5 font-display text-4xl md:text-5xl font-light tracking-tight leading-[1.06] text-balance">
              Bringing AI Safety Research
              <br />
              <span className="text-foreground/50">to the Public</span>
            </h2>
            <p className="mt-7 text-base text-muted-foreground leading-relaxed max-w-2xl">
              These workshops translate research on AI deception, trust, reasoning, hallucinations, and
              reliability into accessible public education. Participants learn not only what AI can do,
              but where it fails, why those failures happen, and how to recognize unreliable or misleading
              outputs before relying on them.
            </p>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-2xl">
              Rather than discussing AI conceptually, every session is highly interactive. Participants
              observe real examples of AI reasoning, hallucinations, fabricated citations, and
              confidence mismatches. Through guided demonstrations and audience participation, they build
              practical skills they can use immediately.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function LearnSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <Reveal>
        <div className="font-mono text-[11px] tracking-[0.3em] text-gold/80">CURRICULUM</div>
        <h2 className="mt-5 font-display text-4xl md:text-5xl font-light tracking-tight leading-[1.06] max-w-3xl text-balance">
          What Participants Learn
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {LEARN_CARDS.map((card, i) => (
          <Reveal key={card.title} delay={i * 80}>
            <LearnCard {...card} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function LearnCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="glass group relative h-full overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:-translate-y-1.5 hover:glow-electric cursor-default"
    >
      <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-electric/6 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div
        className="font-mono text-xl transition-colors duration-300"
        style={{ color: hovered ? "var(--gold)" : "color-mix(in oklab, var(--foreground) 30%, transparent)" }}
      >
        {icon}
      </div>
      <h3 className="mt-5 font-display text-[1.15rem] tracking-tight leading-snug">{title}</h3>
      <p className="mt-3 text-sm text-muted-foreground leading-[1.7]">{body}</p>
    </article>
  );
}

function ResearchSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid gap-12 lg:grid-cols-2 items-center">
        <Reveal>
          <div>
            <div className="font-mono text-[11px] tracking-[0.3em] text-gold/80">RESEARCH CONNECTION</div>
            <h2 className="mt-5 font-display text-4xl md:text-5xl font-light tracking-tight leading-[1.06] text-balance">
              Based on Real AI Deception Research
            </h2>
            <p className="mt-7 text-base text-muted-foreground leading-relaxed">
              The workshops are connected to WOLF, a research project studying deception, trust,
              suspicion, and detection in multi-agent AI systems. In WOLF, AI agents interact in a
              Werewolf-style environment where some agents must hide their true role while others
              attempt to identify deception.
            </p>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Participants learn what findings like this reveal about AI reliability, trust, and the
              future of safer AI systems.
            </p>
            <div className="mt-8">
              <MagneticButton href="/research" variant="ghost">
                Explore the research
                <span className="opacity-70">→</span>
              </MagneticButton>
            </div>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div className="relative overflow-hidden rounded-3xl glass-strong p-12 text-center">
            <div className="absolute inset-0 -z-10">
              <WolfNetwork phase={3} />
              <div className="absolute inset-0 bg-background/70" />
            </div>
            <div className="font-mono text-[11px] tracking-[0.3em] text-gold/70 mb-6">WOLF EXPERIMENT FINDING</div>
            <div
              className="font-display font-light leading-none tracking-[-0.04em]"
              style={{ fontSize: "clamp(5rem,14vw,9rem)", color: "var(--gold)" }}
            >
              31%
            </div>
            <p className="mt-5 text-sm font-mono tracking-[0.14em] text-muted-foreground/70 uppercase">
              Deceptive statements in strategic interactions
            </p>
            <div className="mt-6 h-px hairline" />
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
              AI agents produced deceptive statements in nearly 1 out of every 3 opportunities
              during strategic interactions across 100 experimental runs.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function AudienceSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <Reveal>
        <div className="font-mono text-[11px] tracking-[0.3em] text-gold/80">WHO ATTENDS</div>
        <h2 className="mt-5 font-display text-4xl md:text-5xl font-light tracking-tight leading-[1.06] max-w-3xl text-balance">
          Designed for Different Audiences
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {AUDIENCES.map((a, i) => (
          <Reveal key={a.label} delay={i * 90}>
            <article className="glass group relative h-full overflow-hidden rounded-3xl p-7 transition-all duration-500 hover:-translate-y-1.5 hover:glow-electric cursor-default">
              <div className="absolute -bottom-12 -left-12 h-28 w-28 rounded-full bg-gold/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="font-mono text-[10px] tracking-[0.32em] text-gold/75 mb-5">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="font-display text-xl tracking-tight">{a.label}</h3>
              <p className="mt-4 text-sm text-muted-foreground leading-[1.7]">{a.focus}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const UpcomingSection = function UpcomingSection({
  ref,
}: {
  ref: React.RefObject<HTMLElement | null>;
}) {
  return (
    <section ref={ref} className="mx-auto max-w-7xl px-6 py-24 scroll-mt-24">
      <Reveal>
        <div className="font-mono text-[11px] tracking-[0.3em] text-gold/80">SCHEDULE</div>
        <h2 className="mt-5 font-display text-4xl md:text-5xl font-light tracking-tight leading-[1.06] max-w-3xl text-balance">
          Upcoming Workshops
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {UPCOMING.map((w, i) => (
          <Reveal key={w.title} delay={i * 90}>
            <EventCard w={w} />
          </Reveal>
        ))}
      </div>
    </section>
  );
};

function EventCard({ w }: { w: (typeof UPCOMING)[number] }) {
  const [open, setOpen] = useState(false);
  const statusColor =
    w.status === "Open"
      ? "text-gold border-gold/30 bg-gold/8"
      : "text-muted-foreground border-white/12 bg-white/4";

  return (
    <article
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="glass group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:-translate-y-1.5 hover:glow-electric cursor-default"
    >
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-electric/6 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-display text-2xl tracking-tight leading-snug">{w.title}</h3>
        </div>
        <span
          className={`shrink-0 font-mono text-[9px] tracking-[0.28em] uppercase border rounded-full px-2.5 py-1 ${statusColor}`}
        >
          {w.status}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1.5 font-mono text-[10.5px] tracking-[0.18em] text-muted-foreground/70">
        <span>{w.date}</span>
        <span className="h-3 w-px bg-white/15" />
        <span>{w.time}</span>
        <span className="h-3 w-px bg-white/15" />
        <span>{w.location}</span>
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-500 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="mt-5 text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <a
          href="mailto:smmrinal2009@gmail.com"
          className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.18em] text-gold/80 hover:text-gold transition-colors"
        >
          {w.status === "Open" ? "Register interest" : "Get notified"}
          <span>→</span>
        </a>
      </div>
    </article>
  );
}

function InstructorSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl glass p-10 md:p-14">
          <div className="grid gap-10 md:grid-cols-[auto_1fr] items-start">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl glass-strong">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 30% 25%, color-mix(in oklab, var(--gold) 30%, transparent), transparent 60%), radial-gradient(circle at 75% 80%, color-mix(in oklab, var(--electric) 30%, transparent), transparent 60%), linear-gradient(180deg, color-mix(in oklab, var(--surface) 80%, black), var(--surface-2))",
                }}
              />
              <div className="absolute inset-0 grid place-items-center">
                <span className="font-display text-4xl text-foreground/20 select-none">M</span>
              </div>
            </div>

            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">INSTRUCTOR</div>
              <h2 className="mt-2 font-display text-3xl md:text-4xl font-light tracking-tight">
                Led by Mrinal Agarwal
              </h2>
              <p className="mt-5 max-w-2xl text-sm text-muted-foreground leading-relaxed">
                Mrinal Agarwal is an AI safety and interpretability researcher studying how AI systems reason,
                communicate, and sometimes mislead users. His research on AI deception and reasoning was
                spotlighted at NeurIPS, one of the world's leading artificial intelligence conferences.
                He has presented research to 400+ researchers, educators, and industry professionals
                and has over four years of experience teaching students ages 12 to 18.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="glass rounded-full px-3.5 py-1.5 font-mono text-[10px] tracking-[0.2em] text-foreground/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const ContactSection = function ContactSection({
  ref,
}: {
  ref: React.RefObject<HTMLElement | null>;
}) {
  return (
    <section ref={ref} className="mx-auto max-w-7xl px-6 py-24 scroll-mt-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] glass-strong p-12 md:p-20">
          <div className="absolute inset-0 -z-10">
            <WolfNetwork phase={4} />
            <div className="absolute inset-0 bg-gradient-to-br from-background/85 via-background/55 to-background/85" />
          </div>

          <div className="max-w-2xl">
            <div className="font-mono text-[11px] tracking-[0.3em] text-gold/80">HOST A WORKSHOP</div>
            <h2 className="mt-5 font-display text-4xl md:text-5xl font-light tracking-tight leading-[1.06] text-balance">
              Interested in Hosting a Workshop?
            </h2>
            <p className="mt-7 text-base text-muted-foreground leading-relaxed">
              Workshops can be adapted for libraries, schools, community centers, senior centers,
              nonprofits, and public organizations. Sessions can be delivered online or in person
              and can be adjusted for technical or nontechnical audiences.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <MagneticButton href="mailto:smmrinal2009@gmail.com" variant="primary">
                Contact Mrinal
                <span className="opacity-75">→</span>
              </MagneticButton>
              <a
                href="mailto:smmrinal2009@gmail.com"
                className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
              >
                smmrinal2009@gmail.com
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
};
