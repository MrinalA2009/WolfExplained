import { type ReactNode } from "react";

export function MagneticButton({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  target,
  rel,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  className?: string;
  target?: string;
  rel?: string;
}) {
  const base =
    "btn-magnetic relative inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-medium tracking-wide overflow-hidden group";
  const styles =
    variant === "primary"
      ? "bg-gold text-background hover:shadow-[0_20px_60px_-15px_var(--gold)]"
      : "glass text-foreground hover:glow-electric";

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    e.currentTarget.style.transform = `translate(${x * 0.06}px, ${y * 0.08 - 2}px)`;
  };
  const onLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = "";
  };

  const content = (
    <>
      <span className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            variant === "primary"
              ? "radial-gradient(120px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,.35), transparent 60%)"
              : "radial-gradient(180px circle at var(--mx,50%) var(--my,50%), rgba(77,163,255,.25), transparent 60%)",
        }}
      />
      <span className="relative">{children}</span>
    </>
  );

  const handlers = {
    onMouseMove: (e: React.MouseEvent<HTMLElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
      e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      onMove(e);
    },
    onMouseLeave: onLeave,
    onClick,
  };

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={`${base} ${styles} ${className}`} {...handlers}>
        {content}
      </a>
    );
  }
  return (
    <button className={`${base} ${styles} ${className}`} {...handlers}>
      {content}
    </button>
  );
}
