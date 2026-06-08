/**
 * useReplay — turns a pre-computed ReplayEvent[] into a live-feeling playback.
 *
 * Controls: play/pause/restart/prev/next/scrubTo(index)/setSpeed(0.5|1|2)
 *
 * Timer fires every (event.durationMs / speed) ms and advances to the next
 * event.  The hook exposes the current event + game state so React can render
 * directly from the snapshot without any extra calculation.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReplayEvent, GameSnapshot } from "./wolfTypes";

export type PlaybackStatus = "idle" | "playing" | "paused" | "ended";

export interface ReplayState {
  status:       PlaybackStatus;
  currentIndex: number;
  currentEvent: ReplayEvent | null;
  gameState:    GameSnapshot | null;
  totalEvents:  number;
  speed:        number;
  // speaking bubble (cleared automatically after debate events)
  speakingAgent: string | null;
  speakingMsg:   string | null;
}

export interface ReplayControls {
  state:    ReplayState;
  play:     () => void;
  pause:    () => void;
  restart:  () => void;
  prev:     () => void;
  next:     () => void;
  scrubTo:  (index: number) => void;
  setSpeed: (s: 0.5 | 1 | 2) => void;
}

const INIT_STATE: ReplayState = {
  status:        "idle",
  currentIndex:  -1,
  currentEvent:  null,
  gameState:     null,
  totalEvents:   0,
  speed:         1,
  speakingAgent: null,
  speakingMsg:   null,
};

// How long to keep the speaking bubble alive after a debate event
const BUBBLE_LINGER_MS = 2600;

export function useReplay(events: ReplayEvent[]): ReplayControls {
  const [state, setState] = useState<ReplayState>({
    ...INIT_STATE,
    totalEvents: events.length,
  });

  const timerRef      = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const bubbleRef     = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const speedRef      = useRef<number>(1);
  const statusRef     = useRef<PlaybackStatus>("idle");
  const indexRef      = useRef<number>(-1);
  const eventsRef     = useRef(events);

  // Keep refs in sync
  eventsRef.current = events;

  const clearTimers = () => {
    clearTimeout(timerRef.current);
    clearTimeout(bubbleRef.current);
  };

  // ── Core: advance to an index and snapshot it ────────────────────────────
  const goTo = useCallback((idx: number, newStatus?: PlaybackStatus) => {
    clearTimers();
    const ev = eventsRef.current[idx] ?? null;
    indexRef.current = idx;

    const isSpeaking = ev?.wolfEventType === "debate";
    const speaker    = isSpeaking ? (ev?.actor ?? null) : null;
    const msg        = isSpeaking ? (ev?.message ?? null) : null;

    setState(prev => ({
      ...prev,
      currentIndex:  idx,
      currentEvent:  ev,
      gameState:     ev?.gameState ?? prev.gameState,
      status:        newStatus ?? prev.status,
      speakingAgent: speaker,
      speakingMsg:   msg,
    }));

    // Clear speaking bubble after linger
    if (isSpeaking) {
      bubbleRef.current = setTimeout(() => {
        setState(p => ({ ...p, speakingAgent: null, speakingMsg: null }));
      }, BUBBLE_LINGER_MS / speedRef.current);
    }
  }, []);

  // ── Schedule next tick ───────────────────────────────────────────────────
  const scheduleNext = useCallback((fromIdx: number) => {
    const ev = eventsRef.current[fromIdx];
    if (!ev) return;

    const delay = ev.durationMs / speedRef.current;
    timerRef.current = setTimeout(() => {
      if (statusRef.current !== "playing") return;
      const nextIdx = fromIdx + 1;
      if (nextIdx >= eventsRef.current.length) {
        // Reached end
        statusRef.current = "ended";
        setState(p => ({ ...p, status: "ended" }));
        return;
      }
      goTo(nextIdx);
      scheduleNext(nextIdx);
    }, delay);
  }, [goTo]);

  // ── Controls ─────────────────────────────────────────────────────────────

  const play = useCallback(() => {
    if (statusRef.current === "ended") {
      // restart from beginning
      statusRef.current = "playing";
      indexRef.current = 0;
      goTo(0, "playing");
      scheduleNext(0);
      return;
    }
    const startIdx = indexRef.current < 0 ? 0 : indexRef.current;
    statusRef.current = "playing";
    setState(p => ({ ...p, status: "playing" }));
    goTo(startIdx, "playing");
    scheduleNext(startIdx);
  }, [goTo, scheduleNext]);

  const pause = useCallback(() => {
    clearTimers();
    statusRef.current = "paused";
    setState(p => ({ ...p, status: "paused" }));
  }, []);

  const restart = useCallback(() => {
    clearTimers();
    statusRef.current = "idle";
    indexRef.current  = -1;
    setState({
      ...INIT_STATE,
      totalEvents: eventsRef.current.length,
      speed:       speedRef.current,
    });
  }, []);

  const prev = useCallback(() => {
    clearTimers();
    statusRef.current = "paused";
    const idx = Math.max(0, indexRef.current - 1);
    goTo(idx, "paused");
  }, [goTo]);

  const next = useCallback(() => {
    clearTimers();
    const nextIdx = indexRef.current + 1;
    if (nextIdx >= eventsRef.current.length) {
      statusRef.current = "ended";
      setState(p => ({ ...p, status: "ended" }));
      return;
    }
    statusRef.current = "paused";
    goTo(nextIdx, "paused");
  }, [goTo]);

  const scrubTo = useCallback((index: number) => {
    clearTimers();
    const idx = Math.max(0, Math.min(eventsRef.current.length - 1, index));
    const wasPlaying = statusRef.current === "playing";
    statusRef.current = wasPlaying ? "playing" : "paused";
    indexRef.current  = idx;
    goTo(idx, statusRef.current);
    if (wasPlaying) scheduleNext(idx);
  }, [goTo, scheduleNext]);

  const setSpeed = useCallback((s: 0.5 | 1 | 2) => {
    speedRef.current = s;
    setState(p => ({ ...p, speed: s }));
    if (statusRef.current === "playing") {
      clearTimeout(timerRef.current);
      scheduleNext(indexRef.current);
    }
  }, [scheduleNext]);

  // Cleanup on unmount
  useEffect(() => () => clearTimers(), []);

  return { state, play, pause, restart, prev, next, scrubTo, setSpeed };
}
