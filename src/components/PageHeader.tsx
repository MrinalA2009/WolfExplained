import { Link } from "@tanstack/react-router";
import { type ReactNode } from "react";

interface Props {
  kicker?: string;
  title: ReactNode;
  description?: ReactNode;
  section: string;
}

export function PageHeader({ kicker, title, description, section }: Props) {
  return (
    <header className="mx-auto max-w-7xl px-6 pt-28 sm:pt-32">
      <nav className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-muted-foreground/70">
        <Link to="/" className="hover:text-foreground transition-colors">WOLF</Link>
        <span className="opacity-40">/</span>
        <span className="text-foreground/80">{section.toUpperCase()}</span>
      </nav>
      {kicker && (
        <div className="mt-6 flex items-center gap-3 font-mono text-[11px] tracking-[0.3em] text-gold/80">
          <span className="h-1 w-1 rounded-full bg-gold shadow-[0_0_8px_var(--gold)]" />
          {kicker}
        </div>
      )}
      <h1 className="mt-5 font-display text-[clamp(2.5rem,5.5vw,4.75rem)] font-light tracking-[-0.02em] leading-[1.05] max-w-4xl text-balance">
        {title}
      </h1>
      {description && (
        <p className="mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </header>
  );
}
