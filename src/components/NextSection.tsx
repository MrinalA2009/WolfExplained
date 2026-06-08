import { Link, useRouterState } from "@tanstack/react-router";

// Linear journey guiding users through the canonical flow.
const FLOW = [
  { to: "/", label: "Home" },
  { to: "/research", label: "Research" },
  { to: "/experience", label: "Experience WOLF" },
  { to: "/workshops", label: "Workshops" },
  { to: "/about", label: "About" },
] as const;

export function NextSection() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const idx = FLOW.findIndex(f => f.to === pathname);
  if (idx === -1 || idx === FLOW.length - 1) return null;
  const next = FLOW[idx + 1];
  const prev = idx > 0 ? FLOW[idx - 1] : null;

  return (
    <section className="mx-auto max-w-7xl px-6 mt-32">
      <div className="hairline mb-10" />
      <div className="flex items-center justify-between gap-6 flex-wrap">
        {prev ? (
          <Link
            to={prev.to}
            className="group inline-flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 group-hover:border-white/30 transition">
              ←
            </span>
            <span>
              <span className="block font-mono text-[10px] tracking-[0.25em] text-muted-foreground/60">PREVIOUS</span>
              <span className="block">{prev.label}</span>
            </span>
          </Link>
        ) : <span />}

        <Link
          to={next.to}
          className="group inline-flex items-center gap-4 text-right"
        >
          <span>
            <span className="block font-mono text-[10px] tracking-[0.25em] text-gold/80">CONTINUE</span>
            <span className="block font-display text-xl tracking-tight group-hover:text-gold transition-colors">{next.label}</span>
          </span>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold text-background transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
