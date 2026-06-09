// ─── Raw WOLF event (exact format from logs/<run_id>/events.ndjson) ──────────
export interface WolfEvent {
  timestamp: string;
  round: number;
  step: number;
  phase: string;
  event: string;
  actor: string | null;
  details: Record<string, unknown>;
}

// ─── Player roles & statuses ──────────────────────────────────────────────────
export type Role    = "Villager" | "Werewolf" | "Seer" | "Doctor";
export type PStatus = "alive" | "eliminated";

// Role colours (match user's spec: blue/red/purple/green)
export const ROLE_COLORS: Record<Role, string> = {
  Villager: "#3b82f6",   // blue-500
  Werewolf: "#ef4444",   // red-500
  Seer:     "#a855f7",   // purple-500
  Doctor:   "#22c55e",   // green-500
};

// ─── Game snapshot (complete state at a single point in time) ─────────────────
export interface PlayerState {
  id:             string;
  name:           string;
  role:           Role;
  status:         PStatus;
  suspicionScore: number;    // 0–1, averaged across observers
  trustScore:     number;    // 0–1, inverse of suspicion
  isSpeaking:     boolean;
}

export interface GameSnapshot {
  round:           number;
  phase:           string;
  players:         PlayerState[];
  alivePlayers:    string[];
  votes:           Record<string, string>;
  debateLog:       [string, string][];     // [[speaker, dialogue], ...]
  deceptionScores: Record<string, Record<string, number>>; // {obs: {target: score}}
  winner:          "Villagers" | "Werewolves" | null;
  eliminated:      string | null;
  protected:       string | null;
  exiled:          string | null;
  unmasked:        string | null;
  announcement:    string | null;
}

// ─── Scratchpad types (from deception_analysis events) ───────────────────────
export interface ObserverAnalysis {
  is_deceptive: boolean;
  suspicion_level: number;
  reasoning: string;
}
export interface SelfAnalysis {
  is_deceptive: boolean;
  deception_type: string;
  confidence: number;
}

// ─── Frontend replay event ─────────────────────────────────────────────────────
export type FrontendEventType =
  | "game_start"     | "phase_change"    | "night_action"
  | "agent_message"  | "deception_event" | "suspicion_update"
  | "vote_cast"      | "elimination"     | "round_end"
  | "game_end";

export interface ReplayEvent {
  id:              string;
  index:           number;             // position in the full event list
  round:           number;
  phase:           string;
  wolfEventType:   string;             // original WOLF event type
  frontendType:    FrontendEventType;
  actor:           string | null;
  message:         string | null;      // debate dialogue or key text
  description:     string;             // human-readable for the event feed
  isDeceptive:     boolean | null;     // from self_analysis if available
  deceptionType:   string | null;      // "omission"|"misdirection"|etc.
  avgSuspicion:    number | null;      // from deception_analysis
  isKeyEvent:      boolean;            // show as marker on timeline
  durationMs:      number;             // display duration at 1× speed
  gameState:       GameSnapshot;       // full state snapshot at this moment
  selfAnalysisData:  SelfAnalysis | null;
  observerAnalyses:  Record<string, ObserverAnalysis> | null;
}

// ─── Initial game setup (fixed for all WOLF runs) ─────────────────────────────
export const PLAYERS: { name: string; role: Role }[] = [
  { name: "Alice",  role: "Doctor"   },
  { name: "Bob",    role: "Werewolf" },
  { name: "Selena", role: "Seer"     },
  { name: "Raj",    role: "Villager" },
  { name: "Frank",  role: "Villager" },
  { name: "Joy",    role: "Werewolf" },
  { name: "Cyrus",  role: "Villager" },
  { name: "Emma",   role: "Villager" },
];

export const ROLES: Record<string, Role> = Object.fromEntries(
  PLAYERS.map(p => [p.name, p.role])
) as Record<string, Role>;
