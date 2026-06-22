import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useRef } from "react";
import { WOLF_DEMO_EVENTS } from "../data/wolfDemoGame";
import { parseWolfEvents } from "../lib/wolfParser";
import { useReplay } from "../lib/useReplay";
import { ROLE_COLORS, PLAYERS } from "../lib/wolfTypes";
import type { PlayerState, ReplayEvent, GameSnapshot, ObserverAnalysis } from "../lib/wolfTypes";

export const Route = createFileRoute("/experience")({
  head: () => ({
    meta: [
      { title: "Experience WOLF — Simulation Replay" },
      { name: "description", content: "Replay an actual WOLF multi-agent simulation. Watch agents debate, deceive, and vote in real time." },
    ],
  }),
  component: ExperiencePage,
});

// ─── Layout constants ─────────────────────────────────────────────────────────
const CX = 280, CY = 270, R = 192, NODE_R = 30;
const ARC_R  = NODE_R + 11;
const PLAYER_ORDER = PLAYERS.map(p => p.name);

function playerPos(name: string) {
  const i = Math.max(0, PLAYER_ORDER.indexOf(name));
  const a = (i / PLAYER_ORDER.length) * Math.PI * 2 - Math.PI / 2;
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

function suspicionColor(score: number) {
  const h = Math.round((1 - score) * 220);
  return `hsl(${h}, 68%, 58%)`;
}

const INITIAL_GS: GameSnapshot = {
  round: 0, phase: "start",
  players: PLAYERS.map(p => ({
    id: p.name.toLowerCase(), name: p.name, role: p.role,
    status: "alive", suspicionScore: 0.5, trustScore: 0.5, isSpeaking: false,
  })),
  alivePlayers: PLAYERS.map(p => p.name),
  votes: {}, debateLog: [], deceptionScores: {},
  winner: null, eliminated: null, protected: null,
  exiled: null, unmasked: null, announcement: null,
};

// ─── Agent Node (SVG) ─────────────────────────────────────────────────────────
interface ANProps {
  player: PlayerState;
  pos: { x: number; y: number };
  mode: "watch" | "research";
  selected: boolean;
  onClick: () => void;
}

function AgentNode({ player, pos, mode, selected, onClick }: ANProps) {
  const alive    = player.status === "alive";
  const speaking = player.isSpeaking;
  const roleColor = ROLE_COLORS[player.role];
  const accent   = mode === "research" ? roleColor : "rgba(148,163,184,0.6)";
  const arcCirc  = 2 * Math.PI * ARC_R;
  const arcDash  = player.suspicionScore * arcCirc;

  // Outward unit vector: from circle center → this node's position.
  // Labels are placed along this vector so they never overlap node graphics.
  const _dx = pos.x - CX, _dy = pos.y - CY;
  const _d  = Math.sqrt(_dx * _dx + _dy * _dy) || 1;
  const nx  = _dx / _d, ny = _dy / _d;
  // Text anchor: "middle" for top/bottom nodes, "end"/"start" for side nodes
  const txAnchor = Math.abs(nx) < 0.25 ? "middle" : nx < 0 ? "end" : "start";

  return (
    <g
      transform={`translate(${pos.x},${pos.y})`}
      onClick={alive ? onClick : undefined}
      style={{ cursor: alive ? "pointer" : "default", opacity: alive ? 1 : 0.2, transition: "opacity 0.5s" }}
    >
      {/* Speaking pulse ring — kept small so it never overlaps labels */}
      {speaking && alive && (
        <circle r={NODE_R + 3} fill="none" stroke="var(--gold)" strokeWidth={1} opacity={0}>
          <animate attributeName="r"       values={`${NODE_R+3};${NODE_R+13};${NODE_R+3}`} dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.5;0;0.5"                              dur="2s" repeatCount="indefinite"/>
        </circle>
      )}

      {/* Suspicion arc (research mode) */}
      {mode === "research" && alive && (
        <circle
          r={ARC_R} fill="none"
          stroke={suspicionColor(player.suspicionScore)}
          strokeWidth={2.5}
          strokeDasharray={`${arcDash} ${arcCirc - arcDash}`}
          strokeLinecap="round"
          transform="rotate(-90)"
          opacity={0.65}
        />
      )}

      {/* Selection ring */}
      {selected && (
        <circle r={NODE_R + 7} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1}/>
      )}

      {/* Node fill — glass look */}
      <circle
        r={NODE_R}
        fill={speaking && alive ? "var(--gold)" : "color-mix(in oklab, var(--surface-2) 88%, transparent)"}
        stroke={accent}
        strokeWidth={speaking ? 0 : 1.5}
        style={{ transition: "fill 0.35s, stroke-width 0.35s" }}
      />

      {/* Initial */}
      <text
        textAnchor="middle" dominantBaseline="central"
        fontSize="14" fontWeight="500"
        fill={speaking && alive ? "#05070B" : alive ? "rgba(226,232,240,0.92)" : "rgba(100,116,139,0.35)"}
        style={{ fontFamily: "var(--font-display)", transition: "fill 0.35s" }}
      >
        {player.name[0]}
      </text>

      {/* Name — placed outward from node along nx/ny so it never overlaps the arc or pulse */}
      <text
        textAnchor={txAnchor}
        dominantBaseline="central"
        x={nx * (NODE_R + 20)}
        y={ny * (NODE_R + 20)}
        fontSize="11"
        fontWeight={speaking ? "600" : "400"}
        fill={alive ? "rgba(226,232,240,0.9)" : "rgba(100,116,139,0.3)"}
      >
        {player.name}
      </text>

      {/* Role (research only) — one step further out than the name */}
      {mode === "research" && alive && (
        <text
          textAnchor={txAnchor}
          dominantBaseline="central"
          x={nx * (NODE_R + 35)}
          y={ny * (NODE_R + 35)}
          fontSize="9.5"
          fill={roleColor}
          opacity={0.8}
          letterSpacing="0.05em"
        >
          {player.role}
        </text>
      )}

      {/* Eliminated — subtle X */}
      {!alive && (
        <>
          <line x1={-7} y1={-7} x2={7} y2={7} stroke="#ef4444" strokeWidth={1.5} opacity={0.45}/>
          <line x1={7}  y1={-7} x2={-7} y2={7} stroke="#ef4444" strokeWidth={1.5} opacity={0.45}/>
        </>
      )}
    </g>
  );
}

// ─── Vote arrows ──────────────────────────────────────────────────────────────
function VoteArrows({ votes, alive }: { votes: Record<string, string>; alive: string[] }) {
  const entries = Object.entries(votes).filter(([v, t]) => alive.includes(v) && alive.includes(t));
  if (entries.length === 0) return null;
  return (
    <g opacity={0.55}>
      <defs>
        <marker id="va" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
          <polygon points="0 0,7 2.5,0 5" fill="var(--gold)"/>
        </marker>
      </defs>
      {entries.map(([voter, target]) => {
        const f = playerPos(voter), t = playerPos(target);
        const dx = t.x - f.x, dy = t.y - f.y;
        const d  = Math.sqrt(dx*dx+dy*dy) || 1;
        return (
          <line key={`${voter}-${target}`}
            x1={f.x+(dx/d)*(NODE_R+1)} y1={f.y+(dy/d)*(NODE_R+1)}
            x2={t.x-(dx/d)*(NODE_R+9)} y2={t.y-(dy/d)*(NODE_R+9)}
            stroke="var(--gold)" strokeWidth={1.5} strokeDasharray="4 3"
            markerEnd="url(#va)"
          />
        );
      })}
    </g>
  );
}

// ─── Trust lines ──────────────────────────────────────────────────────────────
function TrustLines({ selected, gs }: { selected: string; gs: GameSnapshot }) {
  return (
    <g>
      {Object.entries(gs.deceptionScores[selected] ?? {}).map(([target, score]) => {
        if (!gs.alivePlayers.includes(target)) return null;
        const f = playerPos(selected), t = playerPos(target);
        return (
          <line key={target}
            x1={f.x} y1={f.y} x2={t.x} y2={t.y}
            stroke={suspicionColor(score as number)}
            strokeWidth={1.2} opacity={0.4} strokeDasharray="3 5"
          />
        );
      })}
    </g>
  );
}

// ─── Game board ───────────────────────────────────────────────────────────────
function GameBoard({
  gs, mode, selected, speakingAgent, onSelectAgent,
}: {
  gs: GameSnapshot; mode: "watch" | "research";
  selected: string | null; speakingAgent: string | null;
  onSelectAgent: (name: string) => void;
}) {
  const showVotes = gs.phase === "vote" && Object.keys(gs.votes).length > 0;

  return (
    <svg viewBox="0 0 560 540" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      {/* Orbit ring */}
      <circle cx={CX} cy={CY} r={R + NODE_R + 14}
        fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={1} strokeDasharray="1.5 5"/>
      <circle cx={CX} cy={CY} r={5} fill="rgba(255,255,255,0.07)"/>

      {mode === "research" && selected && <TrustLines selected={selected} gs={gs}/>}
      {showVotes && <VoteArrows votes={gs.votes} alive={gs.alivePlayers}/>}

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

      {/* Center labels */}
      <text x={CX} y={CY - 15} textAnchor="middle" fontSize="9.5"
        fill="rgba(148,163,184,0.65)" letterSpacing="0.1em">
        {PHASE_LABEL[gs.phase]?.toUpperCase() ?? gs.phase.toUpperCase()}
      </text>
      <text x={CX} y={CY + 9} textAnchor="middle" fontSize="17" fontWeight="300"
        fill={gs.round === 0 ? "rgba(148,163,184,0.6)" : "rgba(226,232,240,0.95)"}
        style={{ fontFamily: "var(--font-display)" }}>
        {gs.winner
          ? gs.winner === "Werewolves" ? "Wolves Win" : "Villagers Win"
          : gs.round === 0 ? "Ready" : `Round ${gs.round}`}
      </text>
      <text x={CX} y={CY + 28} textAnchor="middle" fontSize="9.5"
        fill="rgba(100,116,139,0.55)" letterSpacing="0.04em">
        {gs.alivePlayers.length} alive
      </text>
    </svg>
  );
}

// ─── Right panel ──────────────────────────────────────────────────────────────
function RightPanel({
  selected, gs, mode, speakingAgent, speakingMsg,
  events, currentIndex, onClose,
}: {
  selected: string | null; gs: GameSnapshot; mode: "watch" | "research";
  speakingAgent: string | null; speakingMsg: string | null;
  events: ReplayEvent[]; currentIndex: number; onClose: () => void;
}) {
  if (selected) {
    return <AgentProfile player={gs.players.find(p => p.name === selected)!} gs={gs} mode={mode} onClose={onClose}/>;
  }
  return <EventFeed speakingAgent={speakingAgent} speakingMsg={speakingMsg} events={events} currentIndex={currentIndex}/>;
}

function AgentProfile({
  player, gs, mode, onClose,
}: {
  player: PlayerState; gs: GameSnapshot; mode: "watch" | "research"; onClose: () => void;
}) {
  const alive     = player.status === "alive";
  const roleColor = ROLE_COLORS[player.role];
  const accent    = mode === "research" ? roleColor : "rgba(148,163,184,0.6)";
  const lastDebate = [...gs.debateLog].reverse().find(([s]) => s === player.name);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          {/* Mini avatar */}
          <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
            style={{ background: `color-mix(in oklab, ${accent} 18%, transparent)`, border: `1.5px solid ${accent}`, color: accent }}>
            {player.name[0]}
          </div>
          <div>
            <div className="font-display text-base tracking-tight">{player.name}</div>
            {mode === "research" && (
              <div className="text-[10px] font-mono mt-0.5" style={{ color: roleColor }}>{player.role}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!alive && (
            <span className="font-mono text-[9px] tracking-[0.22em] text-red-400/80 border border-red-500/20 rounded-full px-2 py-0.5">
              ELIMINATED
            </span>
          )}
          <button onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-full text-foreground/30 hover:text-foreground/70 hover:bg-white/5 transition-colors text-base">
            ×
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {mode === "research" && alive && (
          <>
            {/* Suspicion score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[9px] tracking-[0.25em] text-muted-foreground/50 uppercase">Suspicion</span>
                <span className="font-mono text-[11px] tabular-nums" style={{ color: suspicionColor(player.suspicionScore) }}>
                  {(player.suspicionScore * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-[3px] rounded-full bg-white/6 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${player.suspicionScore * 100}%`, background: suspicionColor(player.suspicionScore) }}/>
              </div>
            </div>

            {/* Who this agent suspects */}
            {Object.keys(gs.deceptionScores[player.name] ?? {}).length > 0 && (
              <div>
                <div className="font-mono text-[9px] tracking-[0.25em] text-muted-foreground/50 uppercase mb-2.5">
                  Suspicion of others
                </div>
                <div className="space-y-2">
                  {Object.entries(gs.deceptionScores[player.name] ?? {})
                    .filter(([t]) => gs.alivePlayers.includes(t))
                    .sort(([,a],[,b]) => (b as number) - (a as number))
                    .map(([target, score]) => (
                      <div key={target} className="flex items-center gap-2.5">
                        <span className="font-mono text-[10px] text-foreground/50 w-14 shrink-0">{target}</span>
                        <div className="flex-1 h-[2px] rounded-full bg-white/6 overflow-hidden">
                          <div className="h-full rounded-full"
                            style={{ width: `${(score as number)*100}%`, background: suspicionColor(score as number) }}/>
                        </div>
                        <span className="font-mono text-[10px] text-foreground/40 w-7 text-right tabular-nums">
                          {((score as number)*100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Vote */}
        {gs.votes[player.name] && (
          <div>
            <div className="font-mono text-[9px] tracking-[0.25em] text-muted-foreground/50 uppercase mb-1.5">Vote</div>
            <p className="text-sm" style={{ color: "var(--gold)" }}>Voted to exile <strong>{gs.votes[player.name]}</strong></p>
          </div>
        )}

        {/* Last statement */}
        {lastDebate && (
          <div>
            <div className="font-mono text-[9px] tracking-[0.25em] text-muted-foreground/50 uppercase mb-2">Last Statement</div>
            <div className="glass rounded-xl p-3.5">
              <p className="text-xs text-foreground/70 italic leading-relaxed">"{lastDebate[1]}"</p>
            </div>
          </div>
        )}

        {mode === "watch" && !lastDebate && (
          <p className="text-xs text-muted-foreground/40 italic">No statements yet.</p>
        )}
      </div>
    </div>
  );
}

function EventFeed({
  speakingAgent, speakingMsg, events, currentIndex,
}: {
  speakingAgent: string | null; speakingMsg: string | null;
  events: ReplayEvent[]; currentIndex: number;
}) {
  const recent = events.slice(0, Math.max(0, currentIndex + 1)).reverse().slice(0, 14);

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 pb-4 border-b border-white/5">
        <div className="font-mono text-[9px] tracking-[0.28em] text-muted-foreground/40 uppercase">Live Feed</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {/* Current speaker card */}
        {speakingAgent && (
          <div className="glass rounded-2xl p-4 mb-3 border border-gold/15">
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60"/>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold"/>
              </span>
              <span className="font-mono text-[9px] tracking-[0.28em] text-gold/75 uppercase">Speaking</span>
            </div>
            <div className="font-display text-lg tracking-tight">{speakingAgent}</div>
            {speakingMsg && (
              <p className="mt-2 text-xs text-muted-foreground/80 leading-relaxed italic">
                "{speakingMsg.length > 120 ? speakingMsg.slice(0, 118) + "…" : speakingMsg}"
              </p>
            )}
          </div>
        )}

        {recent.length === 0 && !speakingAgent && (
          <div className="pt-8 text-center">
            <p className="text-muted-foreground/30 text-xs font-mono tracking-wider">Press play to begin</p>
          </div>
        )}

        {recent.map((ev, i) => {
          const typeColor =
            ev.wolfEventType === "debate" ? "text-sky-400/80" :
            ev.wolfEventType === "deception_analysis" ? (ev.isDeceptive ? "text-red-400/80" : "text-emerald-400/80") :
            ev.wolfEventType === "exile" || ev.wolfEventType === "resolve_night" ? "text-amber-400/80" :
            ev.wolfEventType === "game_end" ? "text-gold/80" :
            "text-foreground/50";

          return (
            <div key={ev.id}
              className={`rounded-xl px-3 py-2 transition-colors ${i === 0 ? "bg-white/4 border border-white/6" : "bg-transparent"}`}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="font-mono text-[8px] text-muted-foreground/35">R{ev.round}</span>
                <span className="h-2 w-px bg-white/10"/>
                <span className="font-mono text-[8px] text-muted-foreground/35 uppercase">{ev.phase}</span>
              </div>
              <p className={`text-[11px] leading-snug ${typeColor}`}>{ev.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Analysis bar ─────────────────────────────────────────────────────────────
function AnalysisBar({ events, currentIndex }: { events: ReplayEvent[]; currentIndex: number }) {
  const [tab, setTab] = useState<"statement" | "scratchpad">("statement");
  const [open, setOpen] = useState(false);

  const cur  = currentIndex >= 0 ? events[currentIndex] : null;
  const prev = currentIndex > 0  ? events[currentIndex - 1] : null;
  const analysisEv =
    cur?.wolfEventType === "deception_analysis" ? cur :
    cur?.wolfEventType === "debate" && prev?.wolfEventType === "deception_analysis" && prev.actor === cur.actor ? prev :
    null;

  const statementText = cur?.message ?? analysisEv?.message ?? null;
  const actor = cur?.actor ?? null;
  if (!actor || !statementText) return null;

  const selfA    = analysisEv?.selfAnalysisData ?? null;
  const observers: Record<string, ObserverAnalysis> = analysisEv?.observerAnalyses ?? {};
  const hasAnalysis = Object.keys(observers).length > 0;

  return (
    <div className="border-t border-white/5 bg-[color-mix(in_oklab,var(--surface)_60%,transparent)]">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] tracking-[0.28em] text-muted-foreground/45 uppercase">
            {actor} · {cur?.phase}
          </span>
          {selfA && (
            <span className={`font-mono text-[9px] tracking-[0.18em] px-2 py-0.5 rounded-full border ${
              selfA.is_deceptive
                ? "text-red-400/80 border-red-500/20 bg-red-950/20"
                : "text-emerald-400/80 border-emerald-500/20 bg-emerald-950/20"
            }`}>
              {selfA.is_deceptive ? `deceptive · ${selfA.deception_type}` : "truthful"}
            </span>
          )}
        </div>
        <span className="text-muted-foreground/30 text-xs font-mono">{open ? "▼" : "▲"} Statement</span>
      </button>

      {open && (
        <div>
          <div className="flex items-center border-t border-white/5 px-5 pt-2 gap-0">
            {(["statement", "scratchpad"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-[10px] font-mono tracking-wider rounded-t border-b-2 -mb-px transition-colors ${
                  tab === t ? "text-foreground border-electric" : "text-muted-foreground/40 border-transparent hover:text-muted-foreground/70"
                }`}>
                {t === "statement" ? "Full Statement" : "Observer Scratchpad"}
                {t === "scratchpad" && !hasAnalysis && (
                  <span className="ml-1.5 text-[9px] text-muted-foreground/25">(n/a)</span>
                )}
              </button>
            ))}
          </div>
          <div className="overflow-y-auto border-t border-white/5" style={{ maxHeight: "200px" }}>
            {tab === "statement" && (
              <div className="px-5 py-4">
                <p className="text-sm text-foreground/75 leading-relaxed italic">"{statementText}"</p>
              </div>
            )}
            {tab === "scratchpad" && (
              <div className="px-5 py-4">
                {!hasAnalysis
                  ? <p className="text-xs text-muted-foreground/35 italic">No observer analysis available.</p>
                  : (
                    <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
                      {Object.entries(observers)
                        .sort(([,a],[,b]) => b.suspicion_level - a.suspicion_level)
                        .map(([obs, analysis]) => (
                          <div key={obs} className={`rounded-xl border px-3 py-2.5 ${
                            analysis.is_deceptive
                              ? "bg-red-950/25 border-red-900/30"
                              : "bg-white/3 border-white/6"
                          }`}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-medium text-foreground/80">{obs}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] tabular-nums"
                                  style={{ color: suspicionColor(analysis.suspicion_level) }}>
                                  {(analysis.suspicion_level*100).toFixed(0)}% sus
                                </span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                                  analysis.is_deceptive ? "bg-red-900/40 text-red-400/80" : "bg-white/5 text-foreground/35"
                                }`}>
                                  {analysis.is_deceptive ? "deceptive" : "truthful"}
                                </span>
                              </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground/60 leading-snug">{analysis.reasoning}</p>
                          </div>
                        ))}
                    </div>
                  )
                }
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Controls ─────────────────────────────────────────────────────────────────
interface CtrlProps {
  status: string; speed: number;
  onPlay: () => void; onPause: () => void; onRestart: () => void;
  onPrev: () => void; onNext: () => void; onSpeed: (s: 0.5|1|2) => void;
}
function ControlBar({ status, speed, onPlay, onPause, onRestart, onPrev, onNext, onSpeed }: CtrlProps) {
  const playing = status === "playing";

  const iconBtn = (onClick: () => void, label: string, title: string) => (
    <button onClick={onClick} title={title}
      className="h-8 w-8 flex items-center justify-center rounded-full glass text-foreground/50 hover:text-foreground hover:glow-electric transition-all duration-200 text-xs btn-magnetic">
      {label}
    </button>
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {iconBtn(onRestart, "⏮", "Restart")}
      {iconBtn(onPrev,    "◀", "Previous")}
      <button
        onClick={playing ? onPause : onPlay}
        className="h-10 w-10 flex items-center justify-center rounded-full text-background font-medium text-sm btn-magnetic shadow-lg transition-all duration-300"
        style={{ background: playing ? "var(--gold)" : "var(--electric)", boxShadow: playing ? "0 0 24px -6px var(--gold)" : "0 0 24px -6px var(--electric)" }}
      >
        {playing ? "⏸" : "▶"}
      </button>
      {iconBtn(onNext, "▶", "Next")}

      <div className="flex items-center gap-1 ml-2">
        {([0.5, 1, 2] as const).map(s => (
          <button key={s} onClick={() => onSpeed(s)}
            className={`px-2.5 py-1 text-[10px] font-mono rounded-full transition-all duration-200 ${
              speed === s ? "glass text-foreground" : "text-muted-foreground/50 hover:text-foreground/80"
            }`}>
            {s === 0.5 ? "½×" : `${s}×`}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
function TimelineBar({ events, currentIndex, onScrub }: { events: ReplayEvent[]; currentIndex: number; onScrub: (i: number) => void }) {
  const total    = events.length;
  const pct      = total > 1 ? (Math.max(0, currentIndex) / (total - 1)) * 100 : 0;
  const trackRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ text: string; pct: number } | null>(null);

  const pctFromEvent = (i: number) => total > 1 ? (i / (total - 1)) * 100 : 0;

  const handleClick = (e: React.MouseEvent) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onScrub(Math.round(frac * (total - 1)));
  };

  return (
    <div className="relative px-1 select-none" onMouseLeave={() => setTooltip(null)}>
      {tooltip && (
        <div className="absolute bottom-full mb-2 -translate-x-1/2 glass rounded-lg px-2.5 py-1.5 text-[10px] text-foreground/70 pointer-events-none whitespace-nowrap z-10 font-mono"
          style={{ left: `${tooltip.pct}%` }}>
          {tooltip.text}
        </div>
      )}
      <div className="relative h-8 flex items-center cursor-pointer" ref={trackRef} onClick={handleClick}>
        {/* Track */}
        <div className="absolute inset-x-0 h-[3px] rounded-full bg-white/7"/>
        {/* Fill */}
        <div className="absolute left-0 h-[3px] rounded-full transition-[width] duration-75"
          style={{ width: `${pct}%`, background: "var(--gold)" }}/>
        {/* Key event markers */}
        {events.map((ev, i) => ev.isKeyEvent && (
          <div key={ev.id}
            className="absolute w-[3px] h-[3px] rounded-full -translate-x-1/2 cursor-pointer z-10 hover:scale-150 transition-transform"
            style={{
              left: `${pctFromEvent(i)}%`,
              background:
                ev.wolfEventType === "game_end" ? "#ef4444" :
                ev.wolfEventType === "exile" ? "var(--gold)" :
                "rgba(255,255,255,0.25)",
            }}
            onClick={e => { e.stopPropagation(); onScrub(i); }}
            onMouseEnter={() => setTooltip({ text: ev.description.slice(0, 45), pct: pctFromEvent(i) })}
          />
        ))}
        {/* Scrubber handle */}
        {currentIndex >= 0 && (
          <div className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.25)] z-20 pointer-events-none"
            style={{ left: `${pct}%`, top: "50%", transform: "translate(-50%, -50%)" }}/>
        )}
      </div>
    </div>
  );
}

// ─── Experience page ──────────────────────────────────────────────────────────
function ExperiencePage() {
  const events = useMemo(() => parseWolfEvents(WOLF_DEMO_EVENTS), []);
  const { state, play, pause, restart, prev, next, scrubTo, setSpeed } = useReplay(events);
  const [mode, setMode]     = useState<"watch" | "research">("research");
  const [selected, setSelected] = useState<string | null>(null);

  const gs     = state.gameState ?? INITIAL_GS;
  const isIdle = state.status === "idle";

  const handleSelectAgent = (name: string) => {
    setSelected(current => current === name ? null : name);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" style={{ paddingTop: "68px" }}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 h-13 border-b border-white/5 shrink-0" style={{ height: "52px" }}>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-muted-foreground/50 hover:text-foreground text-xs font-mono tracking-wider transition-colors">
            ← WOLF
          </Link>
          <span className="h-3.5 w-px bg-white/10"/>
          <span className="font-display text-sm tracking-wide text-foreground/80">Simulation Replay</span>
          {!isIdle && state.currentEvent && (
            <>
              <span className="h-3.5 w-px bg-white/10"/>
              <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground/50 uppercase">
                R{state.currentEvent.round} · {PHASE_LABEL[state.currentEvent.phase] ?? state.currentEvent.phase}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 glass rounded-full p-0.5">
          {(["watch", "research"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-3.5 py-1.5 text-[11px] font-mono tracking-wider rounded-full transition-all duration-300 ${
                mode === m ? "bg-foreground text-background" : "text-muted-foreground/60 hover:text-foreground"
              }`}>
              {m === "watch" ? "Watch" : "Research"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Game board */}
        <div className="relative flex-1 flex items-center justify-center p-6 min-w-0">
          <div style={{ width: "100%", maxWidth: "560px", aspectRatio: "560 / 540" }}>
            <GameBoard
              gs={gs} mode={mode}
              selected={selected}
              speakingAgent={state.speakingAgent}
              onSelectAgent={handleSelectAgent}
            />
          </div>

          {/* Idle overlay */}
          {isIdle && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="glass-strong rounded-[2rem] px-10 py-12 text-center max-w-sm mx-auto">
                <div className="font-mono text-[9px] tracking-[0.3em] text-gold/70 mb-5">WOLF SIMULATION</div>
                <h2 className="font-display text-3xl font-light tracking-tight mb-3">8 Agents · 2 Wolves</h2>
                <p className="text-sm text-muted-foreground/65 leading-relaxed mb-8">
                  Watch AI agents debate, deceive, and vote in real time.
                  Toggle Research mode to reveal hidden roles and deception scores.
                </p>
                <button onClick={play}
                  className="inline-flex items-center gap-2.5 rounded-full bg-gold text-background px-7 py-3 text-sm font-medium btn-magnetic hover:shadow-[0_20px_60px_-15px_var(--gold)] transition-shadow">
                  ▶ Begin Replay
                </button>
                <div className="mt-5 flex items-center justify-center gap-5 font-mono text-[9px] tracking-[0.22em] text-muted-foreground/35 uppercase">
                  <span>Click agents to inspect</span>
                  <span className="h-2.5 w-px bg-white/10"/>
                  <span>Scrub timeline freely</span>
                </div>
              </div>
            </div>
          )}

          {/* Winner overlay */}
          {gs.winner && state.status !== "playing" && !isIdle && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="glass-strong rounded-3xl px-12 py-10 text-center">
                <div className="font-display text-4xl font-light mb-2">
                  {gs.winner === "Werewolves" ? "Wolves Win" : "Villagers Win"}
                </div>
                <p className="text-sm text-muted-foreground/60">
                  {gs.winner === "Werewolves" ? "Wolves outnumbered the village" : "All werewolves exiled"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="w-72 flex-shrink-0 border-l border-white/5 bg-[color-mix(in_oklab,var(--surface)_40%,transparent)] overflow-hidden flex flex-col">
          <RightPanel
            selected={selected}
            gs={gs}
            mode={mode}
            speakingAgent={state.speakingAgent}
            speakingMsg={state.speakingMsg}
            events={events}
            currentIndex={state.currentIndex}
            onClose={() => setSelected(null)}
          />
        </div>
      </div>

      {/* ── Analysis bar (collapsible) ── */}
      <AnalysisBar events={events} currentIndex={state.currentIndex}/>

      {/* ── Controls + timeline ── */}
      <div className="shrink-0 border-t border-white/5 bg-[color-mix(in_oklab,var(--surface)_30%,transparent)] px-5 pt-3 pb-4 space-y-2">
        <div className="flex items-center justify-between gap-4">
          <ControlBar
            status={state.status} speed={state.speed}
            onPlay={play} onPause={pause} onRestart={restart}
            onPrev={prev} onNext={next} onSpeed={setSpeed}
          />
          <span className="font-mono text-[10px] text-muted-foreground/30 tabular-nums">
            {state.currentIndex < 0 ? 0 : state.currentIndex + 1} / {events.length}
          </span>
        </div>
        <TimelineBar events={events} currentIndex={state.currentIndex} onScrub={scrubTo}/>
      </div>
    </div>
  );
}
