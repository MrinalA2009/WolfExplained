import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const items = [
  { to: "/", label: "Home" },
  { to: "/research", label: "Research" },
  { to: "/experience", label: "Experience" },
  { to: "/workshops", label: "Workshops" },
  { to: "/about", label: "About" },
] as const;

export function Nav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <header className="fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-50 w-[min(980px,calc(100vw-1.25rem))]">
      <nav
        className={`glass rounded-full flex items-center justify-between pl-3 pr-2 transition-all duration-500 ${
          scrolled ? "py-1.5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)]" : "py-2"
        }`}
      >
        <Link to="/" className="flex items-center gap-2.5 pl-1.5 pr-3 group">
          <span className="relative inline-flex h-6 w-6 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-gold/30 blur-md group-hover:bg-gold/50 transition" />
            <span className="relative h-2 w-2 rounded-full bg-gold shadow-[0_0_10px_var(--gold)]" />
          </span>
          <span className="font-display font-semibold tracking-[0.2em] text-[12px]">WOLF</span>
        </Link>

        <ul className="hidden md:flex items-center gap-0.5 relative">
          {items.map((it) => {
            const active = pathname === it.to;
            return (
              <li key={it.to}>
                <Link
                  to={it.to}
                  className={`relative inline-flex items-center px-3.5 py-1.5 rounded-full text-[12.5px] tracking-wide transition-colors duration-300 ${
                    active ? "text-background" : "text-foreground/65 hover:text-foreground"
                  }`}
                >
                  {active && (
                    <span
                      className="absolute inset-0 -z-10 rounded-full bg-foreground"
                      style={{ boxShadow: "0 6px 24px -6px rgba(248,250,252,0.4)" }}
                    />
                  )}
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1">
          <Link
            to="/experience"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gold text-background px-3.5 py-1.5 text-[12px] font-medium tracking-wide hover:brightness-110 transition"
          >
            Launch
            <span className="opacity-70">↗</span>
          </Link>
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden h-9 w-9 inline-flex flex-col items-center justify-center gap-1.5 rounded-full hover:bg-white/5"
            aria-label="Toggle menu"
          >
            <span className={`h-px w-4 bg-foreground transition-transform ${mobileOpen ? "translate-y-[3px] rotate-45" : ""}`} />
            <span className={`h-px w-4 bg-foreground transition-transform ${mobileOpen ? "-translate-y-[3px] -rotate-45" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`md:hidden mt-2 glass rounded-3xl overflow-hidden transition-all duration-400 ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <ul className="py-2">
          {items.map((it) => {
            const active = pathname === it.to;
            return (
              <li key={it.to}>
                <Link
                  to={it.to}
                  className={`flex items-center justify-between px-5 py-3 text-sm ${
                    active ? "text-gold" : "text-foreground/80"
                  }`}
                >
                  <span>{it.label}</span>
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_var(--gold)]" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
