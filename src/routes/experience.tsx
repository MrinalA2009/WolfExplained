import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useRef } from "react";
import { WOLF_DEMO_EVENTS } from "../data/wolfDemoGame";
import { parseWolfEvents } from "../lib/wolfParser";
import { useReplay } from "../lib/useReplay";
import { ROLE_COLORS, PLAYERS } from "../lib/wolfTypes";
import type { PlayerState, ReplayEvent, GameSnapshot } from "../lib/wolfTypes";

export const Route = createFileRoute("/experience")({
  head: () => ({
    meta: [
      { title: "Experience WOLF — Simulation Replay" },
      { name: "description", content: "Replay an actual WOLF multi-agent simulation. Watch agents debate, deceive, and vote in real time." },
    ],
  }),
  component: ExperiencePage,
});

// ─── SVG layout constants ─────────────────────────────────────────────────────
const CX = 280, CY = 255, R = 185, NODE_R = 26;
const PLAYER_ORDER = PLAYERS.map(p => p.name);

function playerPos(name: string): { x: number; y: number } {
  const idx = PLAYER_ORDER.indexOf(name);
  const i   = idx < 0 ? 0 : idx;
  const a   = (i / PLAYER_ORDER.length) * Math.PI * 2 - Math.PI / 2;
  return { x: CX + Math.cos(a) * R, y: CY + Math.sin(a) * R };
}

const PHASE_LABEL: Record<string, string> = {
  start:              "Game Starting",
  eliminate:          "Night · Wolves Strike",
  protect:            "Night · Doctor Acts",
  unmask:             "Night · Seer Investigates",
  resolve_night:      "Dawn · Night Resolves",
  check_winner_night: "Dawn · Checking Victory",
  debate:             "Day · Village Debate",
  vote:               "Day · Village Vote",
  exile:              "Day · Exile",
  check_winner_day:   "Day · Checking Victory",
  end:                "Game Over",
};

function suspicionColor(score: number): string {
  const h = Math.round((1 - score) * 220);
  return `hsl(${h}, 75%, 55%)`;
}

// ─── Initial game snapshot (shown before replay starts) ──────────────────────
const INITIAL_GS: GameSnapshot = {
  round:        0,
  phase:        "start",
  players:      PLAYERS.map(p => ({
    id: p.name.toLowerCase(), name: p.name, role: p.role,
    status: "alive", suspicionScore: 0.5, trustScore: 0.5, isSpeaking: false,
  })),
  alivePlayers: PLAYERS.map(p => p.name),
  votes: {}, debateLog: [], deceptionScores: {},
  winner: null, eliminated: null, protected: null,
  exiled: null, unmasked: null, announcement: null,
};

// ─────────────────────────────────────────────────────────────────────────────
//  AgentNode
// ─────────────────────────────────────────────────────────────────────────────
interface ANProps {
  player: PlayerState; pos: { x: number; y: number };
  mode: "watch" | "research"; selected: boolean; onClick: () => void;
}
function AgentNode({ player, pos, mode, selected, onClick }: ANProps) {
  const alive     = player.status === "alive";
  const roleColor = ROLE_COLORS[player.role];
  const nodeColor = mode === "research" ? roleColor : "#64748b";
  const opacity   = alive ? 1 : 0.22;
  const arcR      = NODE_R + 7;
  const circum    = 2 * Math.PI * arcR;
  const dash      = player.suspicionScore * circum;

  return (
    <g
      transform={`translate(${pos.x},${pos.y})`}
      onClick={alive ? onClick : undefined}
      style={{ cursor: alive ? "pointer" : "default", opacity, transition: "opacity 0.6s" }}
    >
      {/* Research: suspicion arc */}
      {mode === "research" && alive && (
        <circle cx={0} cy={0} r={arcR}
          fill="none"
          stroke={suspicionColor(player.suspicionScore)}
          strokeWidth={3}
          strokeDasharray={`${dash} ${circum - dash}`}
          strokeLinecap="round"
          transform="rotate(-90)"
          opacity={0.85}
        />
      )}

      {/* Selection ring */}
      {selected && (
        <circle cx={0} cy={0} r={NODE_R + 11}
          fill="none" stroke="white" strokeWidth={1.5} opacity={0.5}
        />
      )}

      {/* Speaking pulse */}
      {player.isSpeaking && (
        <circle cx={0} cy={0} r={NODE_R + 3}
          fill="none" stroke={nodeColor} strokeWidth={2} opacity={0}
        >
          <animate attributeName="r"       values={`${NODE_R+3};${NODE_R+12};${NODE_R+3}`} dur="1.4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.6;0;0.6"                             dur="1.4s" repeatCount="indefinite"/>
        </circle>
      )}

      {/* Node circle */}
      <circle cx={0} cy={0} r={NODE_R}
        fill={player.isSpeaking ? nodeColor : "rgba(15,23,42,0.85)"}
        stroke={nodeColor}
        strokeWidth={player.isSpeaking ? 0 : 2}
        style={{ transition: "fill 0.3s, stroke 0.3s" }}
      />

      {/* Initial letter */}
      <text textAnchor="middle" dominantBaseline="central"
        fontSize="13" fontWeight="700"
        fill={player.isSpeaking ? "#0f172a" : nodeColor}
      >
        {player.name[0]}
      </text>

      {/* Name label */}
      <text textAnchor="middle" y={NODE_R + 15} fontSize="10.5"
        fill={alive ? "rgba(226,232,240,0.9)" : "#334155"}
        fontWeight={player.isSpeaking ? "700" : "400"}
      >
        {player.name}
      </text>

      {/* Role label (research only) */}
      {mode === "research" && alive && (
        <text textAnchor="middle" y={NODE_R + 27} fontSize="8.5"
          fill={roleColor} opacity={0.75}
        >
          {player.role}
        </text>
      )}

      {/* Eliminated cross */}
      {!alive && (
        <text textAnchor="middle" dominantBaseline="central"
          fontSize="22" fill="#ef4444" opacity={0.7}
        >
          ✕
        </text>
      )}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Speaking bubble (SVG foreign-object)
// ─────────────────────────────────────────────────────────────────────────────
function SpeakingBubble({ agent, msg }: { agent: string; msg: string }) {
  const pos = playerPos(agent);
  // Place bubble toward the center of the circle
  const dx = CX - pos.x, dy = CY - pos.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const bx = pos.x + (dx / dist) * (NODE_R + 78);
  const by = pos.y + (dy / dist) * (NODE_R + 52);
  const tailDx = pos.x - bx, tailDy = pos.y - by;
  const tailLen = Math.sqrt(tailDx * tailDx + tailDy * tailDy) || 1;
  const tailX = bx + (tailDx / tailLen) * 34;
  const tailY = by + (tailDy / tailLen) * 34;
  const w = 168, h = 64;

  return (
    <g style={{ pointerEvents: "none" }}>
      <rect x={bx - w / 2} y={by - h / 2} width={w} height={h} rx={9}
        fill="#0f172a" stroke="#334155" strokeWidth={1}
      />
      <line x1={bx} y1={by + h / 2 - 2} x2={tailX} y2={tailY}
        stroke="#334155" strokeWidth={1}
      />
      <circle cx={tailX} cy={tailY} r={3} fill="#334155"/>
      <foreignObject x={bx - w / 2 + 8} y={by - h / 2 + 7} width={w - 16} height={h - 14}>
        <div style={{ fontSize: "9.5px", color: "#cbd5e1", lineHeight: "1.45", overflow: "hidden", height: "100%" }}>
          {msg.length > 100 ? msg.slice(0, 98) + "…" : msg}
        </div>
      </foreignObject>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Vote arrows
// ─────────────────────────────────────────────────────────────────────────────
function VoteArrows({ votes, alive }: { votes: Record<string, string>; alive: string[] }) {
  const entries = Object.entries(votes).filter(
    ([v, t]) => alive.includes(v) && alive.includes(t)
  );
  return (
    <g opacity={0.65}>
      <defs>
        <marker id="arr" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
          <polygon points="0 0,7 2.5,0 5" fill="#f59e0b"/>
        </marker>
      </defs>
      {entries.map(([voter, target]) => {
        const from = playerPos(voter), to = playerPos(target);
        const dx = to.x - from.x, dy = to.y - from.y;
        const d  = Math.sqrt(dx * dx + dy * dy) || 1;
        const sx = from.x + (dx / d) * (NODE_R + 1);
        const sy = from.y + (dy / d) * (NODE_R + 1);
        const ex = to.x   - (dx / d) * (NODE_R + 8);
        const ey = to.y   - (dy / d) * (NODE_R + 8);
        return (
          <line key={`${voter}-${target}`}
            x1={sx} y1={sy} x2={ex} y2={ey}
            stroke="#f59e0b" strokeWidth={1.5}
            markerEnd="url(#arr)" strokeDasharray="4 3"
          />
        );
      })}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Trust lines (shown for selected agent in Research Mode)
// ─────────────────────────────────────────────────────────────────────────────
function TrustLines({ selected, gs }: { selected: string; gs: GameSnapshot }) {
  const scores = gs.deceptionScores[selected] ?? {};
  return (
    <g>
      {Object.entries(scores).map(([target, score]) => {
        if (!gs.alivePlayers.includes(target)) return null;
        const from = playerPos(selected), to = playerPos(target);
        const c = suspicionColor(score as number);
        return (
          <line key={target}
            x1={from.x} y1={from.y} x2={to.x} y2={to.y}
            stroke={c} strokeWidth={1.5} opacity={0.5} strokeDasharray="3 4"
          />
        );
      })}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Inspector panel
// ─────────────────────────────────────────────────────────────────────────────
function InspectorPanel({
  selected, gs, mode, onClose, events, currentIndex,
}: {
  selected: string | null;
  gs: GameSnapshot;
  mode: "watch" | "research";
  onClose: () => void;
  events: ReplayEvent[];
  currentIndex: number;
}) {
  if (!selected) {
    // Event feed
    const recent = events.slice(0, Math.max(0, currentIndex + 1)).reverse().slice(0, 18);
    return (
      <div className="flex flex-col h-full">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-medium">Event Log</p>
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {recent.length === 0 && (
            <p className="text-slate-600 text-xs italic">Replay hasn't started yet.</p>
          )}
          {recent.map((ev, i) => (
            <div key={ev.id}
              className={`rounded px-2.5 py-1.5 text-xs leading-snug ${
                i === 0 ? "bg-slate-800/80 border border-slate-700" : "bg-slate-900/50"
              }`}
            >
              <span className="text-slate-400 mr-1.5">[R{ev.round}]</span>
              <span className={
                ev.wolfEventType === "debate"
                  ? "text-sky-300"
                  : ev.wolfEventType === "deception_analysis"
                  ? (ev.isDeceptive ? "text-red-400" : "text-green-400")
                  : ev.wolfEventType === "exile" || ev.wolfEventType === "resolve_night"
                  ? "text-amber-400"
                  : "text-slate-300"
              }>
                {ev.description.length > 72 ? ev.description.slice(0, 70) + "…" : ev.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const player = gs.players.find(p => p.name === selected);
  if (!player) return null;
  const roleColor = ROLE_COLORS[player.role];
  const alive = player.status === "alive";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: mode === "research" ? roleColor : "#64748b" }}/>
            <span className="text-white font-bold text-lg">{player.name}</span>
            {!alive && <span className="text-xs bg-red-900/60 text-red-400 rounded px-1.5 py-0.5">Eliminated</span>}
          </div>
          {mode === "research" && (
            <p className="text-xs mt-0.5" style={{ color: roleColor }}>{player.role}</p>
          )}
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-lg leading-none">×</button>
      </div>

      {mode === "research" && alive && (
        <>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Suspicion Score</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${player.suspicionScore * 100}%`,
                    background: suspicionColor(player.suspicionScore),
                  }}
                />
              </div>
              <span className="text-xs text-slate-300 w-9 text-right">
                {(player.suspicionScore * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {Object.keys(gs.deceptionScores[player.name] ?? {}).length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">
                {player.name}'s suspicion of others
              </p>
              <div className="space-y-1">
                {Object.entries(gs.deceptionScores[player.name] ?? {})
                  .filter(([t]) => gs.alivePlayers.includes(t))
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([target, score]) => (
                    <div key={target} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-14">{target}</span>
                      <div className="flex-1 h-1 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(score as number) * 100}%`,
                            background: suspicionColor(score as number),
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-7 text-right">
                        {((score as number) * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {gs.votes[player.name] && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Vote</p>
              <p className="text-sm text-amber-300">Voted to exile <strong>{gs.votes[player.name]}</strong></p>
            </div>
          )}
        </>
      )}

      {mode === "watch" && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Status</p>
          <p className="text-sm text-slate-300">{alive ? "Active" : "Eliminated"}</p>
          {gs.votes[player.name] && (
            <p className="text-sm text-amber-300 mt-1">Voted to exile <strong>{gs.votes[player.name]}</strong></p>
          )}
        </div>
      )}

      {/* Last statement */}
      {(() => {
        const lastDebate = [...gs.debateLog].reverse().find(([s]) => s === player.name);
        if (!lastDebate) return null;
        return (
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Last Statement</p>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "{lastDebate[1].length > 140 ? lastDebate[1].slice(0, 138) + "…" : lastDebate[1]}"
            </p>
          </div>
        );
      })()}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Control bar
// ─────────────────────────────────────────────────────────────────────────────
interface ControlBarProps {
  status: string; speed: number;
  onPlay: () => void; onPause: () => void; onRestart: () => void;
  onPrev: () => void; onNext: () => void;
  onSpeed: (s: 0.5 | 1 | 2) => void;
}
function ControlBar({ status, speed, onPlay, onPause, onRestart, onPrev, onNext, onSpeed }: ControlBarProps) {
  const isPlaying = status === "playing";
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button onClick={onRestart} title="Restart"
        className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-sm"
      >⏮</button>
      <button onClick={onPrev} title="Previous"
        className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-sm"
      >◀</button>
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="w-9 h-9 flex items-center justify-center rounded-full text-slate-900 font-bold text-base transition-all"
        style={{ background: isPlaying ? "#f59e0b" : "#3b82f6" }}
      >
        {isPlaying ? "⏸" : "▶"}
      </button>
      <button onClick={onNext} title="Next"
        className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-sm"
      >▶</button>

      <div className="flex items-center gap-1 ml-2">
        {([0.5, 1, 2] as const).map(s => (
          <button key={s} onClick={() => onSpeed(s)}
            className={`px-2 py-0.5 text-xs rounded transition-colors ${
              speed === s
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-700"
            }`}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Timeline bar
// ─────────────────────────────────────────────────────────────────────────────
function TimelineBar({
  events, currentIndex, onScrub,
}: {
  events: ReplayEvent[]; currentIndex: number; onScrub: (i: number) => void;
}) {
  const total = events.length;
  const pct   = total > 1 ? (Math.max(0, currentIndex) / (total - 1)) * 100 : 0;
  const trackRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onScrub(Math.round(frac * (total - 1)));
  };

  return (
    <div className="relative h-8 flex items-center select-none" ref={trackRef} onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      {/* Track */}
      <div className="absolute inset-x-0 h-1 rounded-full bg-slate-800"/>
      {/* Fill */}
      <div className="absolute left-0 h-1 rounded-full bg-blue-600 transition-all"
        style={{ width: `${pct}%` }}
      />
      {/* Key event markers */}
      {events.map((ev, i) => ev.isKeyEvent && (
        <div key={ev.id}
          className="absolute w-1.5 h-1.5 rounded-full -translate-x-1/2 translate-y-0 cursor-pointer"
          style={{
            left: `${(i / (total - 1)) * 100}%`,
            background: ev.wolfEventType === "exile" || ev.wolfEventType === "resolve_night"
              ? "#f59e0b"
              : ev.wolfEventType === "game_end"
              ? "#ef4444"
              : "#64748b",
          }}
          onClick={e => { e.stopPropagation(); onScrub(i); }}
          title={ev.description.slice(0, 50)}
        />
      ))}
      {/* Handle */}
      {currentIndex >= 0 && (
        <div className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-lg -translate-x-1/2 z-10 pointer-events-none"
          style={{ left: `${pct}%`, top: "50%", transform: "translate(-50%,-50%)" }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Game board (SVG canvas)
// ─────────────────────────────────────────────────────────────────────────────
function GameBoard({
  gs, mode, selected, speakingAgent, speakingMsg, onSelectAgent,
}: {
  gs: GameSnapshot; mode: "watch" | "research";
  selected: string | null; speakingAgent: string | null; speakingMsg: string | null;
  onSelectAgent: (name: string) => void;
}) {
  const showVotes = gs.phase === "vote" && Object.keys(gs.votes).length > 0;

  return (
    <svg
      viewBox="0 0 560 530"
      style={{ width: "100%", height: "100%", overflow: "visible" }}
    >
      {/* Subtle grid circle */}
      <circle cx={CX} cy={CY} r={R + NODE_R + 12}
        fill="none" stroke="rgba(51,65,85,0.35)" strokeWidth={1} strokeDasharray="2 4"
      />
      <circle cx={CX} cy={CY} r={6} fill="rgba(51,65,85,0.6)"/>

      {/* Trust lines for selected agent (research mode) */}
      {mode === "research" && selected && (
        <TrustLines selected={selected} gs={gs}/>
      )}

      {/* Vote arrows */}
      {showVotes && <VoteArrows votes={gs.votes} alive={gs.alivePlayers}/>}

      {/* Agent nodes */}
      {gs.players.map(player => (
        <AgentNode
          key={player.name}
          player={{ ...player, isSpeaking: player.name === speakingAgent }}
          pos={playerPos(player.name)}
          mode={mode}
          selected={selected === player.name}
          onClick={() => onSelectAgent(player.name)}
        />
      ))}

      {/* Phase label in center */}
      <text x={CX} y={CY - 16} textAnchor="middle" fontSize="11"
        fill="rgba(148,163,184,0.7)" letterSpacing="0.05em"
      >
        {PHASE_LABEL[gs.phase] ?? gs.phase}
      </text>
      <text x={CX} y={CY + 6} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={gs.round === 0 ? "rgba(100,116,139,0.8)" : "rgba(226,232,240,0.9)"}
      >
        {gs.winner ? (gs.winner === "Werewolves" ? "🐺 Wolves Win" : "✅ Villagers Win") :
          gs.round === 0 ? "Ready" : `Round ${gs.round}`}
      </text>
      <text x={CX} y={CY + 22} textAnchor="middle" fontSize="10"
        fill="rgba(100,116,139,0.7)"
      >
        {gs.alivePlayers.length} alive
      </text>

      {/* Speaking bubble */}
      {speakingAgent && speakingMsg && (
        <SpeakingBubble agent={speakingAgent} msg={speakingMsg}/>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Experience Page
// ─────────────────────────────────────────────────────────────────────────────
function ExperiencePage() {
  const events = useMemo(() => parseWolfEvents(WOLF_DEMO_EVENTS), []);
  const { state, play, pause, restart, prev, next, scrubTo, setSpeed } = useReplay(events);
  const [mode, setMode]     = useState<"watch" | "research">("watch");
  const [selected, setSelected] = useState<string | null>(null);

  const gs = state.gameState ?? INITIAL_GS;
  const isIdle = state.status === "idle";

  const handleSelectAgent = (name: string) => {
    setSelected(prev => prev === name ? null : name);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pt-[68px]">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <a href="/" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">← Back</a>
          <span className="text-slate-700">|</span>
          <span className="text-sm font-semibold text-slate-100 tracking-wide">WOLF Replay</span>
          {!isIdle && (
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              Demo Run · 2 Rounds
            </span>
          )}
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-0.5 border border-slate-800">
          {(["watch", "research"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                mode === m
                  ? "bg-slate-700 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {m === "watch" ? "Watch" : "Research"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden" style={{ minHeight: 0 }}>

        {/* Game board */}
        <div className="relative flex-1 flex items-center justify-center p-4 min-w-0">
          <div style={{ width: "100%", maxWidth: "560px", aspectRatio: "560/530" }}>
            <GameBoard
              gs={gs} mode={mode}
              selected={selected}
              speakingAgent={state.speakingAgent}
              speakingMsg={state.speakingMsg}
              onSelectAgent={handleSelectAgent}
            />
          </div>

          {/* Idle overlay: Start button */}
          {isIdle && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/75 backdrop-blur-sm">
              <div className="text-center space-y-4">
                <p className="text-slate-400 text-sm">8 AI agents · 2 Werewolves · Real deception analysis</p>
                <button onClick={play}
                  className="px-8 py-3 rounded-xl text-white font-bold text-lg shadow-lg transition-all hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
                >
                  ▶ Start Replay
                </button>
                <p className="text-slate-600 text-xs">Click any agent to inspect · Toggle Research mode for deception scores</p>
              </div>
            </div>
          )}

          {/* Winner overlay */}
          {gs.winner && state.status !== "playing" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center px-10 py-8 rounded-2xl border border-slate-700/50 bg-slate-950/80 backdrop-blur-sm">
                <div className="text-4xl mb-2">{gs.winner === "Werewolves" ? "🐺" : "🏡"}</div>
                <div className="text-2xl font-bold text-white">{gs.winner} Win</div>
                <div className="text-slate-400 text-sm mt-1">
                  {gs.winner === "Werewolves"
                    ? "Wolves outnumbered the villagers"
                    : "All werewolves have been exiled"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Inspector / event feed panel */}
        <div className="w-72 flex-shrink-0 border-l border-slate-800/60 bg-slate-950/50 overflow-y-auto p-4">
          <InspectorPanel
            selected={selected}
            gs={gs}
            mode={mode}
            onClose={() => setSelected(null)}
            events={events}
            currentIndex={state.currentIndex}
          />
        </div>
      </div>

      {/* ── Event description strip ── */}
      {state.currentEvent && (
        <div className="px-5 py-2 bg-slate-900/60 border-t border-slate-800/40 text-xs text-slate-400 leading-snug min-h-[32px]">
          <span className="text-slate-600 mr-2">
            R{state.currentEvent.round} · {state.currentEvent.phase} ·
          </span>
          <span className={
            state.currentEvent.wolfEventType === "deception_analysis" && state.currentEvent.isDeceptive
              ? "text-red-400"
              : state.currentEvent.wolfEventType === "exile" || state.currentEvent.wolfEventType === "resolve_night"
              ? "text-amber-300"
              : state.currentEvent.wolfEventType === "game_end"
              ? "text-green-400"
              : "text-slate-300"
          }>
            {state.currentEvent.description}
          </span>
        </div>
      )}

      {/* ── Controls + Timeline ── */}
      <div className="px-5 py-3 border-t border-slate-800/60 bg-slate-950 space-y-2">
        <div className="flex items-center justify-between gap-4">
          <ControlBar
            status={state.status} speed={state.speed}
            onPlay={play} onPause={pause} onRestart={restart}
            onPrev={prev} onNext={next} onSpeed={setSpeed}
          />
          <span className="text-xs text-slate-600 tabular-nums">
            {state.currentIndex < 0 ? 0 : state.currentIndex + 1} / {events.length}
          </span>
        </div>
        <TimelineBar
          events={events}
          currentIndex={state.currentIndex}
          onScrub={scrubTo}
        />
      </div>

    </div>
  );
}
