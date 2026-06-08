/**
 * Converts raw WOLF simulation events (WolfEvent[]) into ReplayEvent[] —
 * each with a fully computed GameSnapshot reflecting state at that moment.
 *
 * Key behaviours:
 *  - Tracks alive players, votes, exile, elimination, winner
 *  - Updates suspicion via 70% new + 30% historical formula (per paper)
 *  - deception_analysis → updates suspicion scores for the speaker
 *  - debate     → sets current speaker / message
 *  - vote       → records vote choice
 *  - exile      → removes player from alive list
 *  - resolve_night → removes eliminated player
 *  - check_winner_* → sets winner
 */

import type { WolfEvent, ReplayEvent, GameSnapshot, PlayerState, Role, FrontendEventType } from "./wolfTypes";
import { PLAYERS, ROLE_COLORS } from "./wolfTypes";

// ─── helpers ─────────────────────────────────────────────────────────────────

function avgSuspicion(
  scores: Record<string, Record<string, number>>,
  target: string
): number {
  const vals = Object.values(scores)
    .map(row => row[target])
    .filter((v): v is number => v !== undefined);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0.5;
}

function clamp(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function frontendType(wolfEvent: string, phase: string): FrontendEventType {
  switch (wolfEvent) {
    case "game_start":       return "game_start";
    case "game_end":         return "game_end";
    case "debate":           return "agent_message";
    case "deception_analysis": return "deception_event";
    case "vote":             return "vote_cast";
    case "exile":
    case "resolve_night":    return "elimination";
    case "check_winner_night":
    case "check_winner_day": return phase === "end" ? "game_end" : "round_end";
    case "eliminate":
    case "protect":
    case "unmask":           return "night_action";
    default:                 return "phase_change";
  }
}

function isKeyEvent(wolfEvent: string): boolean {
  return [
    "game_start", "game_end",
    "resolve_night", "exile",
    "check_winner_night", "check_winner_day",
    "unmask",
  ].includes(wolfEvent);
}

function durationMs(wolfEvent: string, phase: string): number {
  switch (wolfEvent) {
    case "debate":            return 2800;
    case "deception_analysis": return 600;
    case "vote":              return 700;
    case "exile":             return 3200;
    case "resolve_night":     return 3200;
    case "check_winner_night":
    case "check_winner_day":  return 2000;
    case "game_start":        return 1800;
    case "game_end":          return 2500;
    default:                  return 1200;
  }
}

function buildDescription(ev: WolfEvent): string {
  const d = ev.details;
  switch (ev.event) {
    case "game_start":
      return "Game begins — 8 players, 2 Werewolves hidden among villagers.";
    case "eliminate":
      return `Night: Wolves choose ${d.target as string} as their target.`;
    case "protect":
      return `Night: Alice protects ${d.target as string}.`;
    case "unmask":
      return `Night: Selena investigates ${d.target as string} → ${d.revealed_role as string}.`;
    case "resolve_night":
      return (d.announcement as string) ?? "Night resolves.";
    case "check_winner_night":
    case "check_winner_day":
      return (d.winner as string)
        ? `${d.winner as string} win the game!`
        : `Game continues — Wolves: ${(d.wolves_alive as string[]).length}, Non-wolves: ${(d.non_wolves_alive as string[]).length}`;
    case "debate":
      return `${ev.actor ?? "?"}: "${(d.dialogue as string)?.slice(0, 80)}…"`;
    case "deception_analysis":
      return `Deception analysis — ${ev.actor ?? "?"}: ${
        (d.self_analysis as Record<string,unknown>)?.is_deceptive ? "⚠ Deceptive" : "✓ Truthful"
      } (avg suspicion ${((d.average_suspicion as number) * 100).toFixed(0)}%)`;
    case "vote":
      return `${ev.actor ?? "?"} votes to exile ${d.vote as string}.`;
    case "exile":
      return (d.announcement as string) ?? `${d.exiled as string} is exiled.`;
    case "game_end":
      return `${d.winner as string} win! ${(d.summary as string)?.slice(0, 80) ?? ""}`;
    default:
      return `${ev.event} — ${JSON.stringify(d).slice(0, 60)}`;
  }
}

// ─── Main parser ─────────────────────────────────────────────────────────────

export function parseWolfEvents(rawEvents: WolfEvent[]): ReplayEvent[] {
  // Mutable state tracking
  const alivePlayers = PLAYERS.map(p => p.name);
  const votes: Record<string, string> = {};
  const debateLog: [string, string][] = [];
  let winner: "Villagers" | "Werewolves" | null = null;
  let eliminated: string | null = null;
  let protected_: string | null = null;
  let exiled: string | null = null;
  let unmasked: string | null = null;
  let announcement: string | null = null;
  let currentSpeaker: string | null = null;
  let currentMsg: string | null = null;

  // Per-observer suspicion: scores[observer][target] = score
  // Initialise all alive pairs to 0.5
  const scores: Record<string, Record<string, number>> = {};
  for (const obs of PLAYERS) {
    scores[obs.name] = {};
    for (const tgt of PLAYERS) {
      if (obs.name !== tgt.name) scores[obs.name][tgt.name] = 0.5;
    }
  }

  const result: ReplayEvent[] = [];

  for (let i = 0; i < rawEvents.length; i++) {
    const ev = rawEvents[i];

    // ── Mutate state based on event ────────────────────────────────────────

    // Clear transient state on certain events
    if (!["debate", "deception_analysis"].includes(ev.event)) {
      currentSpeaker = null;
      currentMsg     = null;
    }

    const d = ev.details;

    switch (ev.event) {
      case "game_start":
        // Reset to fresh state (parser called once but just in case)
        break;

      case "deception_analysis": {
        // Update suspicion scores (70% new / 30% historical)
        const speaker = ev.actor ?? "";
        const avgSus  = (d.average_suspicion as number) ?? 0.5;
        const otherAnalyses = (d.other_analyses as Record<string, { suspicion_level: number }>) ?? {};
        for (const [obs, analysis] of Object.entries(otherAnalyses)) {
          if (scores[obs]?.[speaker] !== undefined) {
            const hist = scores[obs][speaker];
            scores[obs][speaker] = clamp(0.7 * (analysis.suspicion_level ?? avgSus) + 0.3 * hist);
          }
        }
        break;
      }

      case "debate":
        currentSpeaker = ev.actor;
        currentMsg     = (d.dialogue as string) ?? null;
        if (ev.actor && currentMsg) {
          debateLog.push([ev.actor, currentMsg]);
        }
        break;

      case "vote":
        if (ev.actor) votes[ev.actor] = (d.vote as string);
        break;

      case "exile": {
        const e = d.exiled as string;
        exiled = e;
        announcement = (d.announcement as string) ?? null;
        const idx = alivePlayers.indexOf(e);
        if (idx !== -1) alivePlayers.splice(idx, 1);
        // Clear votes for next round
        for (const k of Object.keys(votes)) delete votes[k];
        // Clear debate log for next round
        debateLog.length = 0;
        break;
      }

      case "protect":
        protected_ = (d.target as string) ?? null;
        break;

      case "unmask":
        unmasked = (d.target as string) ?? null;
        break;

      case "resolve_night": {
        const e = d.eliminated as string | undefined;
        eliminated = e ?? null;
        announcement = (d.announcement as string) ?? null;
        if (e) {
          const idx = alivePlayers.indexOf(e);
          if (idx !== -1) alivePlayers.splice(idx, 1);
        }
        break;
      }

      case "check_winner_night":
      case "check_winner_day":
        winner = (d.winner as "Villagers" | "Werewolves" | null) ?? null;
        // Reset transient night state after check
        if (ev.event === "check_winner_day") {
          eliminated = null;
          protected_ = null;
          exiled     = null;
          unmasked   = null;
          announcement = null;
        }
        break;

      case "game_end":
        winner = (d.winner as "Villagers" | "Werewolves" | null) ?? winner;
        announcement = (d.summary as string) ?? null;
        break;
    }

    // ── Build player states for snapshot ──────────────────────────────────
    const players: PlayerState[] = PLAYERS.map(p => {
      const isAlive = alivePlayers.includes(p.name);
      const suspAvg = avgSuspicion(scores, p.name);
      return {
        id:             p.name.toLowerCase(),
        name:           p.name,
        role:           p.role,
        status:         isAlive ? "alive" : "eliminated",
        suspicionScore: clamp(suspAvg),
        trustScore:     clamp(1 - suspAvg),
        isSpeaking:     p.name === currentSpeaker,
      };
    });

    // Deep-clone deception scores snapshot
    const deceptionScores: Record<string, Record<string, number>> = {};
    for (const [obs, row] of Object.entries(scores)) {
      deceptionScores[obs] = { ...row };
    }

    const snapshot: GameSnapshot = {
      round:        ev.round,
      phase:        ev.phase,
      players,
      alivePlayers: [...alivePlayers],
      votes:        { ...votes },
      debateLog:    [...debateLog],
      deceptionScores,
      winner,
      eliminated,
      protected:    protected_,
      exiled,
      unmasked,
      announcement,
    };

    // ── Self analysis from deception_analysis event ────────────────────────
    const selfAnalysis = d.self_analysis as { is_deceptive?: boolean; deception_type?: string } | undefined;
    const isDeceptive  = selfAnalysis?.is_deceptive ?? null;
    const deceptionType = selfAnalysis?.deception_type ?? null;
    const avgSus       = (d.average_suspicion as number | undefined) ?? null;

    result.push({
      id:            `${ev.round}-${ev.step}-${ev.event}`,
      index:         i,
      round:         ev.round,
      phase:         ev.phase,
      wolfEventType: ev.event,
      frontendType:  frontendType(ev.event, ev.phase),
      actor:         ev.actor,
      message:       currentMsg,
      description:   buildDescription(ev),
      isDeceptive,
      deceptionType: isDeceptive ? (deceptionType ?? null) : null,
      avgSuspicion:  avgSus,
      isKeyEvent:    isKeyEvent(ev.event),
      durationMs:    durationMs(ev.event, ev.phase),
      gameState:     snapshot,
    });
  }

  return result;
}

export { ROLE_COLORS };
