import { useEffect, useRef } from "react";

type Node = { x: number; y: number; vx: number; vy: number; r: number; role: 0 | 1 | 2 };

interface Props {
  density?: number;
  interactive?: boolean;
  className?: string;
}

export function AgentNetwork({ density = 1, interactive = true, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    let nodes: Node[] = [];

    const palette = {
      gold: "246, 185, 59",
      electric: "77, 163, 255",
      white: "248, 250, 252",
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const area = w * h;
      const count = Math.floor((area / 14000) * density);
      nodes = Array.from({ length: count }).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 1 + Math.random() * 1.6,
        role: (Math.random() < 0.08 ? 1 : Math.random() < 0.12 ? 2 : 0) as Node["role"],
      }));
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
      mouse.current.active = true;
    };
    const onLeave = () => { mouse.current.active = false; mouse.current.x = -9999; mouse.current.y = -9999; };

    resize();
    window.addEventListener("resize", resize);
    if (interactive) {
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseout", onLeave);
    }

    let raf = 0;
    const step = () => {
      ctx.clearRect(0, 0, w, h);

      // soft vignette dots
      for (const n of nodes) {
        // cursor attraction
        if (mouse.current.active) {
          const dx = mouse.current.x - n.x;
          const dy = mouse.current.y - n.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 200 * 200) {
            const f = (1 - d2 / (200 * 200)) * 0.04;
            n.vx += dx * f * 0.01;
            n.vy += dy * f * 0.01;
          }
        }
        n.x += n.vx; n.y += n.vy;
        n.vx *= 0.985; n.vy *= 0.985;
        // gentle drift
        n.vx += (Math.random() - 0.5) * 0.01;
        n.vy += (Math.random() - 0.5) * 0.01;
        if (n.x < -20) n.x = w + 20; if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20; if (n.y > h + 20) n.y = -20;
      }

      // links
      const max = 130;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < max) {
            const t = 1 - d / max;
            const color =
              a.role === 1 || b.role === 1 ? palette.gold :
              a.role === 2 || b.role === 2 ? palette.electric : palette.white;
            ctx.strokeStyle = `rgba(${color}, ${t * 0.16})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // nodes
      for (const n of nodes) {
        const color = n.role === 1 ? palette.gold : n.role === 2 ? palette.electric : palette.white;
        // halo
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 12);
        g.addColorStop(0, `rgba(${color}, ${n.role ? 0.55 : 0.35})`);
        g.addColorStop(1, `rgba(${color}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(n.x, n.y, 12, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = `rgba(${color}, ${n.role ? 1 : 0.85})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }

      raf = requestAnimationFrame(step);
    };
    step();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, [density, interactive]);

  return <canvas ref={ref} className={className ?? "absolute inset-0 h-full w-full"} aria-hidden />;
}
