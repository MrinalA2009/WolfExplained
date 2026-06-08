import { useCallback, useEffect, useRef, useState } from "react";

export const SIM_API = "http://localhost:8765";

// ─── Types ─────────────────────────────────────────────────────────────────
export type Role   = "Villager" | "Werewolf" | "Seer" | "Doctor";
export type PStatus = "alive" | "eliminated";
export type Phase  =
  | "starting" | "eliminate" | "protect" | "unmask" | "resolve_night"
  | "check_winner_night" | "debate" | "vote" | "exile" | "check_winner_day"
  | "summarize" | "end" | "unknown";

export interface PlayerSnap {
  id:             string;
  name:           string;
  role:           Role;
  status:         PStatus;
  suspicionScore: number;   // 0–1
  trustScore:     number;   // 0–1
  isSpeaking:     boolean;
}

export interface GameSnap {
  roundNumber:  number;
  phase:        Phase;
  players:      PlayerSnap[];
  alivePlayers: string[];
  votes:        Record<string, string>;
  debateLog:    [string, string][];
  winner:       "Villagers" | "Werewolves" | null;
  eliminated:   string | null;
  protected:    string | null;
  exiled:       string | null;
}

export interface SimEvent {
  _id:      string;     // frontend-assigned
  timestamp: string;
  round:    number;
  step?:    number;
  phase:    string;
  event:    string;
  actor:    string | null;
  details:  Record<string, unknown>;
  gameState?: GameSnap;
}

export type SimStatus =
  | "idle"
  | "connecting"
  | "running"
  | "paused"
  | "ended"
  | "error";

export interface SimState {
  status:        SimStatus;
  serverOnline:  boolean;
  gameId:        string | null;
  gameState:     GameSnap | null;
  events:        SimEvent[];
  latestEvent:   SimEvent | null;
  speakingAgent: string | null;
  speakingMsg:   string | null;
  error:         string | null;
  speed:         number;
}

export interface SimControls {
  sim:        SimState;
  startGame:  (opts: { apiKey?: string; model?: string; speed?: number }) => Promise<void>;
  pauseGame:  () => Promise<void>;
  resumeGame: () => Promise<void>;
  restartGame:() => void;
  setSpeed:   (s: number) => Promise<void>;
}

const INIT: SimState = {
  status:        "idle",
  serverOnline:  false,
  gameId:        null,
  gameState:     null,
  events:        [],
  latestEvent:   null,
  speakingAgent: null,
  speakingMsg:   null,
  error:         null,
  speed:         1.0,
};

export function useSimulation(): SimControls {
  const [sim, setSim] = useState<SimState>(INIT);
  const esRef    = useRef<EventSource | null>(null);
  const idRef    = useRef<string | null>(null);
  const evIdRef  = useRef(0);
  const clearSpkRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Health-check on mount
  useEffect(() => {
    let live = true;
    const check = async () => {
      try {
        const r = await fetch(`${SIM_API}/api/health`, { signal: AbortSignal.timeout(2500) });
        if (live) setSim(s => ({ ...s, serverOnline: r.ok }));
      } catch {
        if (live) setSim(s => ({ ...s, serverOnline: false }));
      }
    };
    check();
    const t = setInterval(check, 8_000);
    return () => { live = false; clearInterval(t); };
  }, []);

  // Connect SSE for a given gameId
  const connect = useCallback((gameId: string) => {
    if (esRef.current) esRef.current.close();

    const es = new EventSource(`${SIM_API}/api/events/${gameId}`);
    esRef.current = es;

    es.onopen = () => setSim(s => ({ ...s, serverOnline: true }));

    es.onmessage = (e: MessageEvent) => {
      let data: Record<string, unknown>;
      try { data = JSON.parse(e.data as string); }
      catch { return; }

      const ev = data.event as string;
      if (ev === "ping") return;

      const simEv: SimEvent = {
        _id:       String(++evIdRef.current),
        timestamp: (data.timestamp as string) ?? new Date().toISOString(),
        round:     (data.round as number)     ?? 0,
        step:      data.step as number,
        phase:     (data.phase as string)     ?? "unknown",
        event:     ev,
        actor:     (data.actor as string | null) ?? null,
        details:   (data.details as Record<string, unknown>) ?? {},
        gameState: data.gameState as GameSnap | undefined,
      };

      setSim(s => {
        const events = [...s.events, simEv];

        let status: SimStatus = s.status;
        let speakingAgent = s.speakingAgent;
        let speakingMsg   = s.speakingMsg;
        let gameState     = simEv.gameState ?? s.gameState;
        let error         = s.error;

        if (ev === "game_start") {
          status = "running";
        } else if (ev === "debate") {
          speakingAgent = simEv.actor;
          speakingMsg   = (simEv.details.statement as string) ?? null;
          // schedule clear
          clearTimeout(clearSpkRef.current);
          clearSpkRef.current = setTimeout(() =>
            setSim(p => ({ ...p, speakingAgent: null, speakingMsg: null })), 3500);
        } else if (ev === "game_end" || ev === "stream_end") {
          status = "ended";
          speakingAgent = null; speakingMsg = null;
        } else if (ev === "game_stopped") {
          status = "idle";
          speakingAgent = null; speakingMsg = null;
        } else if (ev === "error") {
          status = "error";
          error  = (data.message as string) ?? "Unknown simulation error";
          speakingAgent = null; speakingMsg = null;
        } else {
          // Any non-debate event clears the speaking bubble
          speakingAgent = null; speakingMsg = null;
          clearTimeout(clearSpkRef.current);
        }

        return { ...s, status, events, latestEvent: simEv, gameState, speakingAgent, speakingMsg, error };
      });
    };

    es.onerror = () => {
      setSim(s => {
        if (s.status === "running" || s.status === "connecting") {
          return { ...s, serverOnline: false };
        }
        return s;
      });
    };
  }, []);

  const startGame = useCallback(async (
    opts: { apiKey?: string; model?: string; speed?: number } = {}
  ) => {
    // Stop any in-progress game
    if (idRef.current) {
      await fetch(`${SIM_API}/api/stop/${idRef.current}`, { method: "POST" }).catch(() => {});
    }
    if (esRef.current) { esRef.current.close(); esRef.current = null; }

    const speed = opts.speed ?? sim.speed;
    setSim({ ...INIT, serverOnline: sim.serverOnline, status: "connecting", speed });

    try {
      const res = await fetch(`${SIM_API}/api/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: opts.model ?? "gpt-4o", apiKey: opts.apiKey, speed }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const { gameId } = await res.json() as { gameId: string };
      idRef.current = gameId;
      setSim(s => ({ ...s, gameId, status: "connecting" }));
      connect(gameId);
    } catch (err) {
      setSim(s => ({ ...s, status: "error", error: String(err) }));
    }
  }, [sim.serverOnline, sim.speed, connect]);

  const pauseGame = useCallback(async () => {
    if (!idRef.current) return;
    await fetch(`${SIM_API}/api/pause/${idRef.current}`, { method: "POST" }).catch(() => {});
    setSim(s => ({ ...s, status: "paused" }));
  }, []);

  const resumeGame = useCallback(async () => {
    if (!idRef.current) return;
    await fetch(`${SIM_API}/api/resume/${idRef.current}`, { method: "POST" }).catch(() => {});
    setSim(s => ({ ...s, status: "running" }));
  }, []);

  const restartGame = useCallback(() => {
    setSim(s => ({ ...INIT, serverOnline: s.serverOnline, speed: s.speed }));
    if (idRef.current) {
      fetch(`${SIM_API}/api/stop/${idRef.current}`, { method: "POST" }).catch(() => {});
      idRef.current = null;
    }
    if (esRef.current) { esRef.current.close(); esRef.current = null; }
  }, []);

  const setSpeed = useCallback(async (speed: number) => {
    setSim(s => ({ ...s, speed }));
    if (idRef.current) {
      await fetch(`${SIM_API}/api/speed/${idRef.current}?speed=${speed}`, { method: "POST" }).catch(() => {});
    }
  }, []);

  useEffect(() => () => { esRef.current?.close(); clearTimeout(clearSpkRef.current); }, []);

  return { sim, startGame, pauseGame, resumeGame, restartGame, setSpeed };
}
