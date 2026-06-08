import { useEffect, useRef } from "react";

// Fixed 8-agent social deduction network.
// phase 0 → calm/hidden · 1 → deception · 2 → manipulation · 3 → detection · 4 → trust resolved

type RGB = readonly [number, number, number];

const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.max(0, Math.min(1, t));
const lerpRGB = (a: RGB, b: RGB, t: number): RGB => {
  const ct = Math.max(0, Math.min(1, t));
  return [a[0] + (b[0] - a[0]) * ct, a[1] + (b[1] - a[1]) * ct, a[2] + (b[2] - a[2]) * ct] as const;
};
const rgba = ([r, g, b]: RGB, a: number) =>
  `rgba(${r | 0},${g | 0},${b | 0},${Math.max(0, Math.min(1, a)).toFixed(3)})`;

const W: RGB    = [248, 250, 252];
const GOLD: RGB = [246, 185,  59];
const ELEC: RGB = [ 77, 163, 255];
const RED: RGB  = [220,  72,  72];
const GRN: RGB  = [ 72, 199, 142];

// 8 agents: wolves near each other, seer offset, villagers forming a lower arc
const AGENTS = [
  { role: "wolf",    px: 0.40, py: 0.39 },
  { role: "wolf",    px: 0.58, py: 0.32 },
  { role: "seer",    px: 0.78, py: 0.26 },
  { role: "doctor",  px: 0.82, py: 0.56 },
  { role: "villager",px: 0.63, py: 0.78 },
  { role: "villager",px: 0.41, py: 0.83 },
  { role: "villager",px: 0.18, py: 0.69 },
  { role: "villager",px: 0.13, py: 0.43 },
] as const;

// Sparse communication edges — ~12 edges creates a legible social graph
const EDGES: readonly [number, number][] = [
  [0, 1], // wolf ↔ wolf (they know each other)
  [0, 7], // wolf 0 ↔ villager 4
  [0, 6], // wolf 0 ↔ villager 3
  [1, 2], // wolf 1 ↔ seer (tension)
  [1, 3], // wolf 1 ↔ doctor
  [2, 0], // seer → wolf 0 (investigation)
  [2, 3], // seer ↔ doctor
  [3, 4], // doctor ↔ villager 1
  [4, 5], // villager chain
  [5, 6],
  [6, 7],
  [7, 0], // villager 4 ↔ wolf 0
];

function nodeVis(role: string, p: number) {
  if (role === "wolf") {
    const color =
      p < 1 ? lerpRGB(W, GOLD, p)
            : p < 3 ? lerpRGB(GOLD, RED, (p - 1) / 2)
            : RED;
    return {
      color,
      radius: p < 1 ? lerp(4.5, 5.5, p) : p < 3 ? 5.5 : lerp(5.5, 5.0, Math.min(1, p - 3)),
      glowR:  p < 1 ? lerp(13, 22, p)   : p < 3 ? lerp(22, 25, (p-1)/2) : lerp(25, 18, Math.min(1, p-3)),
      glowA:  p < 1 ? lerp(0.16, 0.50, p): p < 3 ? lerp(0.50, 0.56, (p-1)/2) : lerp(0.56, 0.40, Math.min(1, p-3)),
    };
  }
  if (role === "seer") {
    const color = p < 2 ? W : lerpRGB(W, ELEC, Math.min(1, p - 2));
    return {
      color,
      radius: p < 2 ? lerp(4.5, 5.0, p / 2) : p < 3 ? lerp(5.0, 6.5, p - 2) : lerp(6.5, 6.0, Math.min(1, p - 3)),
      glowR:  p < 2 ? lerp(12, 16, p / 2)   : p < 3 ? lerp(16, 34, p - 2)    : 28,
      glowA:  p < 2 ? lerp(0.16, 0.32, p/2) : p < 3 ? lerp(0.32, 0.74, p-2)  : 0.64,
    };
  }
  if (role === "doctor") {
    const t = Math.max(0, Math.min(1, p - 3));
    return {
      color:  lerpRGB(W, GRN, t),
      radius: lerp(4.0, 5.0, t),
      glowR:  lerp(11, 20, t),
      glowA:  lerp(0.14, 0.48, t),
    };
  }
  // villager — stays white, glow brightens slightly as network activates
  return { color: W, radius: 4.0, glowR: lerp(10, 13, p / 4), glowA: lerp(0.11, 0.19, p / 4) };
}

function edgeVis(fromRole: string, toRole: string, p: number) {
  const isWW  = fromRole === "wolf"  && toRole === "wolf";
  const hasW  = fromRole === "wolf"  || toRole === "wolf";
  const hasS  = fromRole === "seer"  || toRole === "seer";
  const isSW  = hasS && hasW;

  if (isWW) {
    if (p < 3) return { alpha: lerp(0.03, 0.07, p / 3), color: W, width: 0.6 };
    const t = Math.min(1, p - 3);
    return { alpha: lerp(0.07, 0.34, t), color: lerpRGB(W, RED, t), width: lerp(0.6, 2.0, t) };
  }
  if (isSW) {
    if (p < 2) return { alpha: 0.05, color: W, width: 0.6 };
    const t = Math.min(1, p - 2);
    return { alpha: lerp(0.05, 0.54, t), color: lerpRGB(W, ELEC, t), width: lerp(0.6, 2.2, t) };
  }
  if (hasW) {
    if (p < 1) return { alpha: 0.05, color: W, width: 0.7 };
    if (p < 2) {
      const t = p - 1;
      return { alpha: lerp(0.05, 0.22, t), color: lerpRGB(W, GOLD, t), width: lerp(0.7, 1.5, t) };
    }
    if (p < 3) {
      const t = p - 2;
      return { alpha: lerp(0.22, 0.09, t), color: lerpRGB(GOLD, RED, t), width: lerp(1.5, 0.8, t) };
    }
    return { alpha: 0.07, color: RED, width: 0.6 };
  }
  // seer or doctor edges brighten after detection begins
  if ((hasS) && p > 2) {
    const t = Math.min(1, (p - 2) / 2);
    return { alpha: lerp(0.06, 0.15, t), color: lerpRGB(W, ELEC, t * 0.35), width: lerp(0.7, 1.1, t) };
  }
  return { alpha: lerp(0.045, 0.09, p / 4), color: W, width: 0.7 };
}

interface Props {
  phase?: number;   // 0–4 continuous
  className?: string;
}

export function WolfNetwork({ phase = 0, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef  = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;
    let w = 0, h = 0, dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    let raf = 0;
    const draw = (ts: number) => {
      ctx.clearRect(0, 0, w, h);
      const p  = Math.max(0, Math.min(4, phaseRef.current));
      const sf = Math.max(0.50, Math.min(1.55, Math.min(w, h) / 680));

      // Edges
      for (const [ai, bi] of EDGES) {
        const a = AGENTS[ai], b = AGENTS[bi];
        const ev = edgeVis(a.role, b.role, p);
        if (ev.alpha < 0.006) continue;
        ctx.strokeStyle = rgba(ev.color, ev.alpha);
        ctx.lineWidth   = ev.width * sf;
        ctx.lineCap     = "round";
        ctx.beginPath();
        ctx.moveTo(a.px * w, a.py * h);
        ctx.lineTo(b.px * w, b.py * h);
        ctx.stroke();
      }

      // Nodes
      for (let i = 0; i < AGENTS.length; i++) {
        const ag = AGENTS[i];
        const nv = nodeVis(ag.role, p);
        const nx = ag.px * w;
        const ny = ag.py * h;

        // Slow individual pulse per node
        const spd = ag.role === "wolf" && p > 0.4 ? 0.75 + p * 0.28 : 0.45;
        const amp = ag.role === "wolf" && p > 0.4 ? 0.13 : 0.055;
        const pulse = 1 + Math.sin(ts * 0.001 * spd + i * 1.37) * amp;

        // Halo glow
        const gr = nv.glowR * sf * pulse;
        if (nv.glowA > 0.01) {
          const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, gr);
          g.addColorStop(0,   rgba(nv.color, nv.glowA * pulse));
          g.addColorStop(0.45, rgba(nv.color, nv.glowA * 0.38));
          g.addColorStop(1,   rgba(nv.color, 0));
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(nx, ny, gr, 0, Math.PI * 2);
          ctx.fill();
        }

        // Core dot
        ctx.fillStyle = rgba(nv.color, 0.92);
        ctx.beginPath();
        ctx.arc(nx, ny, nv.radius * sf * pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "absolute inset-0 h-full w-full"}
      aria-hidden
    />
  );
}
