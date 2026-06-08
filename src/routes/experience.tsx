import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Reveal } from "../components/Reveal";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/experience")({
  head: () => ({
    meta: [
      { title: "Experience WOLF — Live Simulation" },
      { name: "description", content: "Step inside a live WOLF simulation. Inspect agents, trust networks, and reasoning in real time." },
      { property: "og:title", content: "Experience WOLF" },
      { property: "og:description", content: "Live multi-agent deception simulation." },
    ],
  }),
  component: Experience,
});

// ---------------- Simulation model ----------------

type Role = "villager" | "wolf" | "seer" | "doctor";
interface Agent {
  id: number;
  name: string;
  role: Role;
  alive: boolean;
  trust: Record<number, number>;
  suspicion: Record<number, number>;
}
interface Event { round: number; phase: "day" | "night"; text: string; actor?: number; target?: number; }

const NAMES = ["Aria", "Boden", "Cyra", "Doran", "Elin", "Faye", "Gage", "Hale"];

function makeInitial(): { agents: Agent[]; events: Event[] } {
  const roles: Role[] = ["wolf", "wolf", "seer", "doctor", "villager", "villager", "villager", "villager"];
  // shuffle deterministic
  const order = [3, 6, 1, 7, 0, 4, 2, 5];
  const agents: Agent[] = NAMES.map((name, i) => ({
    id: i, name, role: roles[order.indexOf(i)] ?? "villager", alive: true,
    trust: Object.fromEntries(NAMES.map((_, j) => [j, 0.5])),
    suspicion: Object.fromEntries(NAMES.map((_, j) => [j, 0.2])),
  }));
  return { agents, events: [{ round: 0, phase: "day", text: "Eight agents convene. The game begins." }] };
}

const SCRIPT: Event[] = [
  { round: 1, phase: "day", text: "Aria suggests Doran's silence is suspicious.", actor: 0, target: 3 },
  { round: 1, phase: "day", text: "Cyra defends Doran, citing his early support.", actor: 2, target: 3 },
  { round: 1, phase: "day", text: "Village votes — Hale is eliminated.", actor: 7 },
  { round: 1, phase: "night", text: "Wolves convene. Elin is taken in the night.", target: 4 },
  { round: 2, phase: "day", text: "Boden, the Seer, hints he knows a wolf.", actor: 1 },
  { round: 2, phase: "day", text: "Faye accuses Boden of bluffing.", actor: 5, target: 1 },
  { round: 2, phase: "day", text: "Vote splits — Faye is eliminated.", actor: 5 },
  { round: 2, phase: "night", text: "Doctor saves Boden. The wolves miss.", actor: 6 },
  { round: 3, phase: "day", text: "Boden publicly names Cyra as a wolf.", actor: 1, target: 2 },
  { round: 3, phase: "day", text: "Cyra is eliminated. She was a wolf.", target: 2 },
];

function applyEvent(agents: Agent[], ev: Event): Agent[] {
  const next = agents.map(a => ({ ...a, trust: { ...a.trust }, suspicion: { ...a.suspicion } }));
  if (/eliminated|taken/.test(ev.text) && ev.target != null) {
    const t = next.find(a => a.id === ev.target);
    if (t) t.alive = false;
  }
  if (ev.actor != null && ev.target != null && ev.actor !== ev.target) {
    const actor = next[ev.actor];
    if (/accuses|suspicious|names/i.test(ev.text)) {
      actor.suspicion[ev.target] = Math.min(1, (actor.suspicion[ev.target] ?? 0) + 0.25);
      // others mildly suspect too
      next.forEach(a => { if (a.id !== ev.actor) a.suspicion[ev.target!] = Math.min(1, (a.suspicion[ev.target!] ?? 0) + 0.08); });
    }
    if (/defends|support/i.test(ev.text)) {
      actor.trust[ev.target] = Math.min(1, (actor.trust[ev.target] ?? 0.5) + 0.2);
    }
  }
  return next;
}

function Experience() {
  const [tick, setTick] = useState(0);              // 0..SCRIPT.length
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);

  const { agents, events } = useMemo(() => {
    const init = makeInitial();
    let agents = init.agents;
    const events = [...init.events];
    for (let i = 0; i < tick; i++) {
      agents = applyEvent(agents, SCRIPT[i]);
      events.push(SCRIPT[i]);
    }
    return { agents, events };
  }, [tick]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setTick(t => {
        if (t >= SCRIPT.length) { setPlaying(false); return t; }
        return t + 1;
      });
    }, 2400 / speed);
    return () => clearInterval(id);
  }, [playing, speed]);

  const round = tick === 0 ? 0 : SCRIPT[Math.max(0, tick - 1)].round;
  const phase = tick === 0 ? "day" : SCRIPT[Math.max(0, tick - 1)].phase;

  return (
    <div className="relative">
      <PageHeader
        section="Experience"
        kicker="LIVE SIMULATION"
        title={<>Watch eight minds reason, <span className="text-foreground/55">lie, and uncover the truth.</span></>}
        description="A scripted recreation of a real eight-agent game. Click any agent to inspect their state. Scrub the timeline to move through rounds."
      />

      <section className="mx-auto max-w-7xl px-6 mt-10">
        <Reveal>
          <div className="glass rounded-2xl px-5 py-3 inline-flex items-center gap-6 text-sm">
            <Stat label="Round" value={`0${round}`} />
            <Divider />
            <Stat label="Phase" value={phase.toUpperCase()} accent={phase === "night" ? "electric" : "gold"} />
            <Divider />
            <Stat label="Alive" value={`${agents.filter(a => a.alive).length}/8`} />
          </div>
        </Reveal>
      </section>

      {/* Stage */}
      <section className="mx-auto max-w-7xl px-6 mt-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Stage agents={agents} selected={selected} onSelect={setSelected} phase={phase as "day" | "night"} />
          <SidePanel agent={selected != null ? agents[selected] : null} agents={agents} events={events} />
        </div>

        {/* Controls + timeline */}
        <div className="glass-strong mt-6 rounded-2xl p-4 sm:p-5 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <CtrlButton onClick={() => { setTick(0); setSelected(null); setPlaying(false); }} label="Restart" icon="↺" />
            <CtrlButton onClick={() => setPlaying(p => !p)} label={playing ? "Pause" : "Play"} icon={playing ? "❚❚" : "▶"} primary />
            <CtrlButton onClick={() => setTick(t => Math.max(0, t - 1))} label="Back" icon="◂" />
            <CtrlButton onClick={() => setTick(t => Math.min(SCRIPT.length, t + 1))} label="Next" icon="▸" />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.2em]">Speed</span>
            {[0.5, 1, 2].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`rounded-full px-2.5 py-1 font-mono text-[11px] transition ${
                  speed === s ? "bg-gold text-background" : "glass hover:text-foreground"
                }`}
              >
                {s}×
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-[260px]">
            <input
              type="range"
              min={0}
              max={SCRIPT.length}
              value={tick}
              onChange={(e) => setTick(parseInt(e.target.value))}
              className="w-full accent-[var(--gold)]"
            />
            <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground/70 tracking-[0.2em]">
              <span>T0</span><span>R1</span><span>R2</span><span>R3</span><span>END</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 mt-10 grid gap-4 md:grid-cols-3">
        <Legend swatch="white" label="Villager" desc="Common townsfolk seeking the wolves." />
        <Legend swatch="gold" label="Special role" desc="Seer & Doctor — informational advantages." />
        <Legend swatch="electric" label="Wolf" desc="Hidden, coordinating, eliminating by night." />
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: "gold" | "electric" }) {
  return (
    <div>
      <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground">{label}</div>
      <div
        className="mt-0.5 font-display text-base"
        style={{ color: accent === "electric" ? "var(--electric)" : accent === "gold" ? "var(--gold)" : undefined }}
      >
        {value}
      </div>
    </div>
  );
}
function Divider() { return <span className="h-8 w-px bg-white/10" />; }

function CtrlButton({ onClick, label, icon, primary }: { onClick: () => void; label: string; icon: string; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`btn-magnetic h-10 min-w-10 rounded-full px-3 text-sm flex items-center gap-2 ${
        primary ? "bg-gold text-background" : "glass hover:glow-electric"
      }`}
    >
      <span className="font-mono">{icon}</span>
      <span className="hidden sm:inline text-xs tracking-wide">{label}</span>
    </button>
  );
}

function Legend({ swatch, label, desc }: { swatch: "gold" | "electric" | "white"; label: string; desc: string }) {
  const color = swatch === "gold" ? "var(--gold)" : swatch === "electric" ? "var(--electric)" : "white";
  return (
    <div className="glass rounded-2xl p-5 flex items-start gap-3">
      <span
        className="mt-1 h-3 w-3 rounded-full"
        style={{ background: color, boxShadow: `0 0 12px ${color}` }}
      />
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground mt-1">{desc}</div>
      </div>
    </div>
  );
}

// ---------------- Stage (SVG agent network) ----------------

function Stage({
  agents, selected, onSelect, phase,
}: { agents: Agent[]; selected: number | null; onSelect: (i: number | null) => void; phase: "day" | "night" }) {
  const size = 560;
  const cx = size / 2, cy = size / 2, R = 220;

  const positions = agents.map((_, i) => {
    const a = (i / agents.length) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R };
  });

  return (
    <div
      className="glass-strong relative overflow-hidden rounded-3xl aspect-square w-full max-w-[680px] mx-auto"
      style={{
        background:
          phase === "night"
            ? "radial-gradient(circle at 50% 30%, color-mix(in oklab, var(--electric) 8%, transparent), transparent 60%), color-mix(in oklab, var(--background) 70%, black)"
            : "radial-gradient(circle at 50% 30%, color-mix(in oklab, var(--gold) 6%, transparent), transparent 60%), color-mix(in oklab, var(--surface) 80%, transparent)",
      }}
    >
      {/* concentric rings */}
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 h-full w-full">
        {[0.45, 0.75, 1].map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={R * s} fill="none" stroke="white" strokeOpacity={0.05} />
        ))}

        {/* trust / suspicion edges from selected (or default global) */}
        {selected != null &&
          agents.map((a, j) => {
            if (j === selected || !a.alive) return null;
            const me = agents[selected];
            const trust = me.trust[j] ?? 0.5;
            const susp = me.suspicion[j] ?? 0;
            const positive = trust - susp;
            const color = positive >= 0 ? "246,185,59" : "77,163,255";
            const alpha = Math.min(0.7, Math.abs(positive) * 0.9 + 0.15);
            return (
              <line
                key={j}
                x1={positions[selected].x} y1={positions[selected].y}
                x2={positions[j].x} y2={positions[j].y}
                stroke={`rgba(${color}, ${alpha})`}
                strokeWidth={1 + Math.abs(positive) * 2}
                strokeDasharray={positive < 0 ? "4 4" : undefined}
              />
            );
          })}

        {/* ambient lines */}
        {selected == null && agents.flatMap((a, i) =>
          agents.slice(i + 1).map((b, k) => {
            const j = i + 1 + k;
            if (!a.alive || !b.alive) return null;
            return (
              <line key={`${i}-${j}`} x1={positions[i].x} y1={positions[i].y} x2={positions[j].x} y2={positions[j].y}
                stroke="white" strokeOpacity={0.04} />
            );
          })
        )}
      </svg>

      {/* center */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">{phase === "night" ? "NIGHT" : "DAY"}</div>
        <div className="mt-1 font-display text-3xl">{agents.filter(a => a.alive).length} <span className="text-foreground/40">alive</span></div>
      </div>

      {/* agent nodes */}
      {agents.map((a, i) => {
        const { x, y } = positions[i];
        const isSel = selected === i;
        const ringColor =
          a.role === "wolf" ? "var(--electric)" :
          a.role === "villager" ? "rgba(255,255,255,0.7)" : "var(--gold)";
        return (
          <button
            key={a.id}
            onClick={() => onSelect(isSel ? null : i)}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${(x / size) * 100}%`, top: `${(y / size) * 100}%`, opacity: a.alive ? 1 : 0.35 }}
          >
            <div className="relative flex flex-col items-center">
              <span
                className="absolute inset-0 rounded-full blur-md transition-all duration-500 group-hover:scale-150"
                style={{ background: ringColor, opacity: isSel ? 0.5 : 0.18, width: 56, height: 56, top: -6, left: -6 }}
              />
              <span
                className="relative h-11 w-11 rounded-full flex items-center justify-center font-display text-sm transition-all duration-300 group-hover:scale-110"
                style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                  border: `1px solid ${isSel ? ringColor : "rgba(255,255,255,0.12)"}`,
                  boxShadow: isSel ? `0 0 24px ${ringColor}` : undefined,
                  color: a.alive ? "var(--foreground)" : "var(--muted-foreground)",
                  textDecoration: a.alive ? "none" : "line-through",
                }}
              >
                {a.name[0]}
              </span>
              <span className="mt-2 font-mono text-[10px] tracking-[0.2em] text-foreground/80">{a.name.toUpperCase()}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ---------------- Side panel ----------------

function SidePanel({ agent, agents, events }: { agent: Agent | null; agents: Agent[]; events: Event[] }) {
  if (!agent) {
    return (
      <aside className="glass-strong rounded-3xl p-6 h-fit lg:sticky lg:top-28">
        <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">ACTIVITY</div>
        <h3 className="mt-2 font-display text-xl">Event log</h3>
        <p className="mt-2 text-xs text-muted-foreground">Click any agent to inspect their state.</p>
        <ul className="mt-5 space-y-3 max-h-[520px] overflow-auto pr-1">
          {events.slice().reverse().map((e, i) => (
            <li key={i} className="text-sm leading-snug">
              <div className="font-mono text-[10px] tracking-[0.2em] text-gold/70">
                R{e.round} · {e.phase.toUpperCase()}
              </div>
              <div className="mt-0.5 text-foreground/85">{e.text}</div>
            </li>
          ))}
        </ul>
      </aside>
    );
  }

  const ringColor =
    agent.role === "wolf" ? "var(--electric)" :
    agent.role === "villager" ? "rgba(255,255,255,0.7)" : "var(--gold)";

  return (
    <aside className="glass-strong rounded-3xl p-6 h-fit lg:sticky lg:top-28 animate-fade-up">
      <div className="flex items-start gap-4">
        <span
          className="h-14 w-14 rounded-full grid place-items-center font-display text-lg"
          style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${ringColor}`, boxShadow: `0 0 24px ${ringColor}` }}
        >
          {agent.name[0]}
        </span>
        <div>
          <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">AGENT</div>
          <h3 className="font-display text-2xl">{agent.name}</h3>
          <div className="mt-1 inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em]"
            style={{ background: "color-mix(in oklab, white 5%, transparent)", color: ringColor }}>
            {agent.role} {!agent.alive && "· eliminated"}
          </div>
        </div>
      </div>

      <Bar label="Trust radiated" value={avg(Object.values(agent.trust))} color="gold" />
      <Bar label="Suspicion radiated" value={avg(Object.values(agent.suspicion))} color="electric" />

      <div className="mt-6">
        <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground mb-3">RELATIONSHIPS</div>
        <ul className="space-y-2">
          {agents.filter(a => a.id !== agent.id).map(a => {
            const t = agent.trust[a.id] ?? 0.5;
            const s = agent.suspicion[a.id] ?? 0;
            return (
              <li key={a.id} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-foreground/80">{a.name}</span>
                <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden flex">
                  <span style={{ width: `${t * 100}%`, background: "var(--gold)" }} />
                </div>
                <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden flex">
                  <span style={{ width: `${s * 100}%`, background: "var(--electric)" }} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

function Bar({ label, value, color }: { label: string; value: number; color: "gold" | "electric" }) {
  const c = color === "gold" ? "var(--gold)" : "var(--electric)";
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
        <span>{label}</span><span>{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value * 100}%`, background: c, boxShadow: `0 0 12px ${c}` }} />
      </div>
    </div>
  );
}
function avg(xs: number[]) { return xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length); }
