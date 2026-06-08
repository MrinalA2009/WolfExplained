/**
 * Representative WOLF simulation run — 2 rounds, Werewolf victory.
 *
 * Built from the exact event schema produced by logs.py / game_graph.py.
 * All field names match the real codebase:
 *   - debate details use "dialogue" (not "statement")
 *   - unmask details use "revealed_role"
 *   - resolve_night details use "announcement"
 *   - deception_analysis fires before its corresponding debate event
 *     (matching the real code ordering in debate_node)
 *
 * Player roles:
 *   Alice → Doctor   Bob → Werewolf   Selena → Seer
 *   Raj → Villager   Frank → Villager  Joy → Werewolf
 *   Cyrus → Villager Emma → Villager
 *
 * Narrative:
 *   R1 Night → Frank eliminated (Alice protects Cyrus; Selena discovers Joy=Wolf)
 *   R1 Day   → Wolves manipulate vote → Raj exiled
 *   R2 Night → Cyrus eliminated (Alice protects Emma; Selena discovers Bob=Wolf)
 *   R2 Day   → Selena reveals Seer+Bob claim; dismissed; Selena exiled 3-2
 *   WIN      → Wolves (Bob, Joy) ≥ Villagers (Alice, Emma) → 2 ≥ 2
 *
 * Suspicion evolution (70% new + 30% historical):
 *   Start  : all 0.500
 *   R1 Day : Alice 0.304 | Bob 0.556 | Selena 0.318 | Raj 0.458 | Joy 0.605 | Cyrus 0.416 | Emma 0.395
 *   R2 Day : Alice 0.231 | Bob 0.664 | Selena 0.221 | Joy 0.686 | Emma 0.350
 */

import type { WolfEvent } from "../lib/wolfTypes";

// ─── helpers ─────────────────────────────────────────────────────────────────
function iso(h: number, m: number, s: number): string {
  return `2025-08-15T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.000000`;
}

// ─────────────────────────────────────────────────────────────────────────────

export const WOLF_DEMO_EVENTS: WolfEvent[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  //  GAME START
  // ═══════════════════════════════════════════════════════════════════════════
  {
    timestamp: iso(20, 0, 0),
    round: 0, step: 1, phase: "start",
    event: "game_start",
    actor: "system",
    details: {
      players: ["Alice", "Bob", "Selena", "Raj", "Frank", "Joy", "Cyrus", "Emma"],
      roles: { Alice: "Doctor", Bob: "Werewolf", Selena: "Seer", Raj: "Villager", Frank: "Villager", Joy: "Werewolf", Cyrus: "Villager", Emma: "Villager" },
      model: "gpt-4o",
      description: "8-player WOLF simulation. Werewolves: Bob, Joy. Seer: Selena. Doctor: Alice."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  ROUND 1 — NIGHT
  // ═══════════════════════════════════════════════════════════════════════════
  {
    timestamp: iso(20, 1, 0),
    round: 1, step: 2, phase: "eliminate",
    event: "eliminate",
    actor: "Joy",
    details: {
      target: "Frank",
      votes: { Bob: "Frank", Joy: "Frank" },
      reasoning: "Frank is a clear communicator who could unite the villagers. Eliminating him early disrupts their coordination.",
      raw_output: {}
    }
  },
  {
    timestamp: iso(20, 1, 30),
    round: 1, step: 3, phase: "protect",
    event: "protect",
    actor: "Alice",
    details: {
      target: "Cyrus",
      reasoning: "Cyrus has been asking thoughtful questions. A strategic target. I'll keep him safe tonight.",
      raw_output: {}
    }
  },
  {
    timestamp: iso(20, 2, 0),
    round: 1, step: 4, phase: "unmask",
    event: "unmask",
    actor: "Selena",
    details: {
      target: "Joy",
      revealed_role: "Werewolf",
      reasoning: "My seer ability reveals Joy's true role. I must be careful how I use this information tomorrow.",
      raw_output: {}
    }
  },
  {
    timestamp: iso(20, 2, 30),
    round: 1, step: 5, phase: "resolve_night",
    event: "resolve_night",
    actor: "system",
    details: {
      announcement: "The village awakens to find Frank missing. His empty seat at the table is a grim reminder of the werewolves' presence. Frank has been eliminated. He was a Villager.",
      eliminated: "Frank",
      protected: "Cyrus",
      attack_target: "Frank",
      saved: false
    }
  },
  {
    timestamp: iso(20, 3, 0),
    round: 1, step: 6, phase: "check_winner_night",
    event: "check_winner_night",
    actor: "system",
    details: {
      winner: null,
      wolves_alive: ["Bob", "Joy"],
      non_wolves_alive: ["Alice", "Selena", "Raj", "Cyrus", "Emma"],
      message: "Game continues. Werewolves: 2, Non-wolves: 5."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  ROUND 1 — DAY  (7 players: Alice, Bob, Selena, Raj, Joy, Cyrus, Emma)
  // ═══════════════════════════════════════════════════════════════════════════

  // — Alice debates —
  {
    timestamp: iso(20, 3, 30),
    round: 1, step: 7, phase: "debate",
    event: "deception_analysis",
    actor: "Alice",
    details: {
      statement: "Frank was a stabilizing voice. Whoever silenced him knew exactly who to target — that suggests an insider. I think we should focus on players who seemed least affected by Frank's absence this morning.",
      self_analysis: { is_deceptive: false, deception_type: "none", confidence: 0.91 },
      other_analyses: {
        Bob:   { is_deceptive: false, suspicion_level: 0.28, reasoning: "Alice's grief seems genuine and her logic is sound." },
        Selena: { is_deceptive: false, suspicion_level: 0.18, reasoning: "Clear, truthful statement. Alice is grieving and thinking carefully." },
        Raj:   { is_deceptive: false, suspicion_level: 0.22, reasoning: "No signs of deception. Alice makes a fair point." },
        Joy:   { is_deceptive: false, suspicion_level: 0.20, reasoning: "Alice sounds sincere. Not suspicious." },
        Cyrus: { is_deceptive: false, suspicion_level: 0.21, reasoning: "Straightforward and honest observation." },
        Emma:  { is_deceptive: false, suspicion_level: 0.23, reasoning: "Alice is being direct. I believe her." }
      },
      average_suspicion: 0.22,
      observer_deceptive_fraction: 0.0
    }
  },
  {
    timestamp: iso(20, 4, 0),
    round: 1, step: 8, phase: "debate",
    event: "debate",
    actor: "Alice",
    details: {
      dialogue: "Frank was a stabilizing voice. Whoever silenced him knew exactly who to target — that suggests an insider. I think we should focus on players who seemed least affected by Frank's absence this morning.",
      bids: { Alice: 1.0 },
      raw_output: {}
    }
  },

  // — Bob debates (Wolf — deceptive) —
  {
    timestamp: iso(20, 4, 30),
    round: 1, step: 9, phase: "debate",
    event: "deception_analysis",
    actor: "Bob",
    details: {
      statement: "Alice makes a good point. I've been watching Joy closely — she barely reacted to Frank's death, which I find strange. Frank and Joy used to talk a lot. That silence is telling.",
      self_analysis: { is_deceptive: true, deception_type: "misdirection", confidence: 0.88 },
      other_analyses: {
        Alice:  { is_deceptive: true, suspicion_level: 0.62, reasoning: "Bob is deflecting suspicion onto Joy. That preemptive move feels calculated." },
        Selena: { is_deceptive: true, suspicion_level: 0.65, reasoning: "Bob accusing Joy — his wolf partner — is suspicious misdirection." },
        Raj:    { is_deceptive: false, suspicion_level: 0.45, reasoning: "Bob might be right about Joy. It's plausible." },
        Joy:    { is_deceptive: false, suspicion_level: 0.52, reasoning: "Bob is covering for himself. Acting concerned." },
        Cyrus:  { is_deceptive: true, suspicion_level: 0.61, reasoning: "Why would Bob point at someone so early? Feels like deflection." },
        Emma:   { is_deceptive: false, suspicion_level: 0.55, reasoning: "I'm unsure. Bob could be right, or he could be framing Joy." }
      },
      average_suspicion: 0.567,
      observer_deceptive_fraction: 0.5
    }
  },
  {
    timestamp: iso(20, 5, 0),
    round: 1, step: 10, phase: "debate",
    event: "debate",
    actor: "Bob",
    details: {
      dialogue: "Alice makes a good point. I've been watching Joy closely — she barely reacted to Frank's death, which I find strange. Frank and Joy used to talk a lot. That silence is telling.",
      bids: { Bob: 1.0 },
      raw_output: {}
    }
  },

  // — Selena debates —
  {
    timestamp: iso(20, 5, 30),
    round: 1, step: 11, phase: "debate",
    event: "deception_analysis",
    actor: "Selena",
    details: {
      statement: "I have information I'm holding close for now. What I can say is: trust active contributors, and watch for those who seed accusations without backing them up. Not all pointing fingers are pointing in the right direction.",
      self_analysis: { is_deceptive: false, deception_type: "none", confidence: 0.85 },
      other_analyses: {
        Alice:  { is_deceptive: false, suspicion_level: 0.19, reasoning: "Selena is being cautious with her information. Makes sense for a Seer." },
        Bob:    { is_deceptive: false, suspicion_level: 0.22, reasoning: "Cryptic but not deceptive. She's hinting at something." },
        Raj:    { is_deceptive: false, suspicion_level: 0.25, reasoning: "Selena seems to know more than she's saying. I trust her." },
        Joy:    { is_deceptive: false, suspicion_level: 0.28, reasoning: "She's being vague. Possibly has information but I can't tell." },
        Cyrus:  { is_deceptive: false, suspicion_level: 0.20, reasoning: "Thoughtful and careful. Not suspicious." },
        Emma:   { is_deceptive: false, suspicion_level: 0.24, reasoning: "Selena is restraining herself. That's wise." }
      },
      average_suspicion: 0.23,
      observer_deceptive_fraction: 0.0
    }
  },
  {
    timestamp: iso(20, 6, 0),
    round: 1, step: 12, phase: "debate",
    event: "debate",
    actor: "Selena",
    details: {
      dialogue: "I have information I'm holding close for now. What I can say is: trust active contributors, and watch for those who seed accusations without backing them up. Not all pointing fingers are pointing in the right direction.",
      bids: { Selena: 1.0 },
      raw_output: {}
    }
  },

  // — Raj debates —
  {
    timestamp: iso(20, 6, 30),
    round: 1, step: 13, phase: "debate",
    event: "deception_analysis",
    actor: "Raj",
    details: {
      statement: "I don't know who to trust right now. Bob's point about Joy has some merit. But I'm also watching Emma — she's been unusually quiet. Quiet people either have nothing to hide or everything to hide.",
      self_analysis: { is_deceptive: false, deception_type: "none", confidence: 0.78 },
      other_analyses: {
        Alice:  { is_deceptive: false, suspicion_level: 0.40, reasoning: "Raj is nervous and spreading suspicion thin. Could be a villager overwhelmed by grief." },
        Bob:    { is_deceptive: false, suspicion_level: 0.38, reasoning: "Raj is scattering. Not particularly suspicious." },
        Selena: { is_deceptive: false, suspicion_level: 0.44, reasoning: "Raj's anxiety is showing. Slightly erratic but honest." },
        Joy:    { is_deceptive: false, suspicion_level: 0.46, reasoning: "Raj is unsure. That's not deceptive, just confused." },
        Cyrus:  { is_deceptive: false, suspicion_level: 0.42, reasoning: "His reasoning is scattered but I believe him." },
        Emma:   { is_deceptive: false, suspicion_level: 0.40, reasoning: "Raj seems genuinely uncertain. Not suspicious." }
      },
      average_suspicion: 0.417,
      observer_deceptive_fraction: 0.0
    }
  },
  {
    timestamp: iso(20, 7, 0),
    round: 1, step: 14, phase: "debate",
    event: "debate",
    actor: "Raj",
    details: {
      dialogue: "I don't know who to trust right now. Bob's point about Joy has some merit. But I'm also watching Emma — she's been unusually quiet. Quiet people either have nothing to hide or everything to hide.",
      bids: { Raj: 1.0 },
      raw_output: {}
    }
  },

  // — Joy debates (Wolf — deceptive) —
  {
    timestamp: iso(20, 7, 30),
    round: 1, step: 15, phase: "debate",
    event: "deception_analysis",
    actor: "Joy",
    details: {
      statement: "Bob's accusations against me are baseless. I'm grieving Frank just like everyone else. What's actually suspicious is Raj constantly redirecting blame — he pointed at Emma without any evidence. That's textbook deflection.",
      self_analysis: { is_deceptive: true, deception_type: "omission", confidence: 0.92 },
      other_analyses: {
        Alice:  { is_deceptive: true, suspicion_level: 0.68, reasoning: "Joy's defense was too smooth. She immediately counter-attacked Raj — that's a classic deflection." },
        Bob:    { is_deceptive: false, suspicion_level: 0.45, reasoning: "Joy's defending herself. Looks convincing to an outside observer." },
        Selena: { is_deceptive: true, suspicion_level: 0.72, reasoning: "I know Joy is a wolf. Her denial is pure performance." },
        Raj:    { is_deceptive: true, suspicion_level: 0.65, reasoning: "Joy turned the tables very quickly. That feels rehearsed." },
        Cyrus:  { is_deceptive: true, suspicion_level: 0.60, reasoning: "The counter-accusation against Raj feels strategic, not genuine." },
        Emma:   { is_deceptive: false, suspicion_level: 0.59, reasoning: "Joy made some good points. I'm not sure she's lying." }
      },
      average_suspicion: 0.615,
      observer_deceptive_fraction: 0.667
    }
  },
  {
    timestamp: iso(20, 8, 0),
    round: 1, step: 16, phase: "debate",
    event: "debate",
    actor: "Joy",
    details: {
      dialogue: "Bob's accusations against me are baseless. I'm grieving Frank just like everyone else. What's actually suspicious is Raj constantly redirecting blame — he pointed at Emma without any evidence. That's textbook deflection.",
      bids: { Joy: 1.0 },
      raw_output: {}
    }
  },

  // — Cyrus debates —
  {
    timestamp: iso(20, 8, 30),
    round: 1, step: 17, phase: "debate",
    event: "deception_analysis",
    actor: "Cyrus",
    details: {
      statement: "I noticed something in the way Bob and Joy interact — or rather don't interact. They don't challenge each other at all. Bob accuses Joy, Joy dismisses it, but there's no real heat between them. Allies avoid real conflict.",
      self_analysis: { is_deceptive: false, deception_type: "none", confidence: 0.88 },
      other_analyses: {
        Alice:  { is_deceptive: false, suspicion_level: 0.35, reasoning: "Cyrus is observant. His social reading is good." },
        Bob:    { is_deceptive: false, suspicion_level: 0.42, reasoning: "Hmm, he noticed something. That's concerning for me." },
        Selena: { is_deceptive: false, suspicion_level: 0.32, reasoning: "Cyrus is sharp. His observation about Bob-Joy is accurate." },
        Raj:    { is_deceptive: false, suspicion_level: 0.36, reasoning: "Makes sense. I hadn't thought of it that way." },
        Joy:    { is_deceptive: false, suspicion_level: 0.40, reasoning: "He's onto something. I need to change tactics." },
        Emma:   { is_deceptive: false, suspicion_level: 0.38, reasoning: "Cyrus has a sharp eye. Not suspicious at all." }
      },
      average_suspicion: 0.372,
      observer_deceptive_fraction: 0.0
    }
  },
  {
    timestamp: iso(20, 9, 0),
    round: 1, step: 18, phase: "debate",
    event: "debate",
    actor: "Cyrus",
    details: {
      dialogue: "I noticed something in the way Bob and Joy interact — or rather don't interact. They don't challenge each other at all. Bob accuses Joy, Joy dismisses it, but there's no real heat between them. Allies avoid real conflict.",
      bids: { Cyrus: 1.0 },
      raw_output: {}
    }
  },

  // — Emma debates —
  {
    timestamp: iso(20, 9, 30),
    round: 1, step: 19, phase: "debate",
    event: "deception_analysis",
    actor: "Emma",
    details: {
      statement: "I've been quiet because I'm listening. Cyrus just said something important about Bob and Joy's dynamic. But I want to add: Raj has been scattering suspicion across multiple people. Could be genuine confusion, or could be manufactured chaos.",
      self_analysis: { is_deceptive: false, deception_type: "none", confidence: 0.83 },
      other_analyses: {
        Alice:  { is_deceptive: false, suspicion_level: 0.32, reasoning: "Emma is thoughtful and building on others' observations." },
        Bob:    { is_deceptive: false, suspicion_level: 0.35, reasoning: "Emma is perceptive. She's tracking social dynamics." },
        Selena: { is_deceptive: false, suspicion_level: 0.30, reasoning: "Emma is honest. Her point about Raj is fair." },
        Raj:    { is_deceptive: false, suspicion_level: 0.38, reasoning: "Emma's pointing at me too. I'm getting isolated." },
        Joy:    { is_deceptive: false, suspicion_level: 0.36, reasoning: "Emma is building the case against Raj. That's useful for us." },
        Cyrus:  { is_deceptive: false, suspicion_level: 0.34, reasoning: "Emma validates my observation. Good." }
      },
      average_suspicion: 0.342,
      observer_deceptive_fraction: 0.0
    }
  },
  {
    timestamp: iso(20, 10, 0),
    round: 1, step: 20, phase: "debate",
    event: "debate",
    actor: "Emma",
    details: {
      dialogue: "I've been quiet because I'm listening. Cyrus just said something important about Bob and Joy's dynamic. But I want to add: Raj has been scattering suspicion across multiple people. Could be genuine confusion, or could be manufactured chaos.",
      bids: { Emma: 1.0 },
      raw_output: {}
    }
  },

  // ─── Round 1 Votes ────────────────────────────────────────────────────────

  {
    timestamp: iso(20, 10, 30),
    round: 1, step: 21, phase: "vote",
    event: "vote",
    actor: "Alice",
    details: { vote: "Raj", reasoning: "Emma and Joy both pointed to Raj's scattered accusations. Cyrus's Bob-Joy observation makes Joy too risky to exile without more evidence. Raj is the safest exile today.", raw_output: {} }
  },
  {
    timestamp: iso(20, 11, 0),
    round: 1, step: 22, phase: "vote",
    event: "vote",
    actor: "Bob",
    details: { vote: "Raj", reasoning: "Raj has been creating noise and confusion. He's the most disruptive presence and the clearest target for today.", raw_output: {} }
  },
  {
    timestamp: iso(20, 11, 30),
    round: 1, step: 23, phase: "vote",
    event: "vote",
    actor: "Selena",
    details: { vote: "Joy", reasoning: "I have strong reason to believe Joy is dangerous. I cannot reveal why, but I urge others to consider this carefully.", raw_output: {} }
  },
  {
    timestamp: iso(20, 12, 0),
    round: 1, step: 24, phase: "vote",
    event: "vote",
    actor: "Raj",
    details: { vote: "Joy", reasoning: "Joy's defense was too slick. And she immediately tried to turn the blame to me. That smells like desperation.", raw_output: {} }
  },
  {
    timestamp: iso(20, 12, 30),
    round: 1, step: 25, phase: "vote",
    event: "vote",
    actor: "Joy",
    details: { vote: "Raj", reasoning: "Raj is a destabilizing presence. He's spreading unfounded suspicion and the group needs clarity. Voting him out is the rational choice.", raw_output: {} }
  },
  {
    timestamp: iso(20, 13, 0),
    round: 1, step: 26, phase: "vote",
    event: "vote",
    actor: "Cyrus",
    details: { vote: "Raj", reasoning: "Despite my earlier observations about Bob and Joy, Raj has given me no reason to trust him. His scattered accusations are dangerous.", raw_output: {} }
  },
  {
    timestamp: iso(20, 13, 30),
    round: 1, step: 27, phase: "vote",
    event: "vote",
    actor: "Emma",
    details: { vote: "Raj", reasoning: "I stand by what I said. Raj has been manufacturing confusion. I'm voting to exile him.", raw_output: {} }
  },
  {
    timestamp: iso(20, 14, 0),
    round: 1, step: 28, phase: "exile",
    event: "exile",
    actor: "system",
    details: {
      exiled: "Raj",
      vote_counts: { Raj: 4, Joy: 2 },
      votes: { Alice: "Raj", Bob: "Raj", Selena: "Joy", Raj: "Joy", Joy: "Raj", Cyrus: "Raj", Emma: "Raj" },
      announcement: "By a vote of 4 to 2, the village has decided to exile Raj. As the decision is made, Raj looks around in disbelief. He was a Villager."
    }
  },
  {
    timestamp: iso(20, 14, 30),
    round: 1, step: 29, phase: "check_winner_day",
    event: "check_winner_day",
    actor: "system",
    details: {
      winner: null,
      wolves_alive: ["Bob", "Joy"],
      non_wolves_alive: ["Alice", "Selena", "Cyrus", "Emma"],
      message: "Game continues. Werewolves: 2, Non-wolves: 4."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  ROUND 2 — NIGHT  (6 alive: Alice, Bob, Selena, Joy, Cyrus, Emma)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    timestamp: iso(20, 15, 0),
    round: 2, step: 30, phase: "eliminate",
    event: "eliminate",
    actor: "Bob",
    details: {
      target: "Cyrus",
      votes: { Bob: "Cyrus", Joy: "Cyrus" },
      reasoning: "Cyrus noticed the Bob-Joy dynamic. He's starting to see through us. He must go before the next debate.",
      raw_output: {}
    }
  },
  {
    timestamp: iso(20, 15, 30),
    round: 2, step: 31, phase: "protect",
    event: "protect",
    actor: "Alice",
    details: {
      target: "Emma",
      reasoning: "Emma has been a clear thinker. I suspect the wolves want to silence the most perceptive voices. I'll protect her.",
      raw_output: {}
    }
  },
  {
    timestamp: iso(20, 16, 0),
    round: 2, step: 32, phase: "unmask",
    event: "unmask",
    actor: "Selena",
    details: {
      target: "Bob",
      revealed_role: "Werewolf",
      reasoning: "Now I know both wolves — Joy and Bob. Tomorrow I must act. I'll reveal everything, even if they try to discredit me.",
      raw_output: {}
    }
  },
  {
    timestamp: iso(20, 16, 30),
    round: 2, step: 33, phase: "resolve_night",
    event: "resolve_night",
    actor: "system",
    details: {
      announcement: "A second dark night passes. In the morning, the village discovers Cyrus is gone. His sharp observations are silenced forever. Cyrus was a Villager.",
      eliminated: "Cyrus",
      protected: "Emma",
      attack_target: "Cyrus",
      saved: false
    }
  },
  {
    timestamp: iso(20, 17, 0),
    round: 2, step: 34, phase: "check_winner_night",
    event: "check_winner_night",
    actor: "system",
    details: {
      winner: null,
      wolves_alive: ["Bob", "Joy"],
      non_wolves_alive: ["Alice", "Selena", "Emma"],
      message: "Game continues. Werewolves: 2, Non-wolves: 3."
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  ROUND 2 — DAY  (5 alive: Alice, Bob, Selena, Joy, Emma)
  // ═══════════════════════════════════════════════════════════════════════════

  // — Selena debates (SEER REVEAL) —
  {
    timestamp: iso(20, 17, 30),
    round: 2, step: 35, phase: "debate",
    event: "deception_analysis",
    actor: "Selena",
    details: {
      statement: "I've stayed silent too long and people have died for it. I'm the Seer. I've investigated two players: Joy is a Werewolf. Bob is a Werewolf. I have no reason to lie — I'm handing you the win if you believe me. Vote out Bob today.",
      self_analysis: { is_deceptive: false, deception_type: "none", confidence: 0.97 },
      other_analyses: {
        Alice: { is_deceptive: false, suspicion_level: 0.12, reasoning: "Selena is telling the truth. This matches everything I've suspected." },
        Bob:   { is_deceptive: true, suspicion_level: 0.88, reasoning: "She's lying. She has to be. This destroys our game if believed." },
        Joy:   { is_deceptive: true, suspicion_level: 0.85, reasoning: "Selena claims to be the Seer. I have to discredit her immediately." },
        Emma:  { is_deceptive: false, suspicion_level: 0.20, reasoning: "Selena sounds completely sincere. This is either true or a very risky gambit." }
      },
      average_suspicion: 0.263,
      observer_deceptive_fraction: 0.5
    }
  },
  {
    timestamp: iso(20, 18, 0),
    round: 2, step: 36, phase: "debate",
    event: "debate",
    actor: "Selena",
    details: {
      dialogue: "I've stayed silent too long and people have died for it. I'm the Seer. I've investigated two players: Joy is a Werewolf. Bob is a Werewolf. I have no reason to lie — I'm handing you the win if you believe me. Vote out Bob today.",
      bids: { Selena: 1.0 },
      raw_output: {}
    }
  },

  // — Bob debates (Wolf — aggressive counter) —
  {
    timestamp: iso(20, 18, 30),
    round: 2, step: 37, phase: "debate",
    event: "deception_analysis",
    actor: "Bob",
    details: {
      statement: "Selena's claim is desperate and calculated. This is exactly what a wolf would do — claim a power role to create false certainty. If she were really the Seer, why wait until two people died? I vote we call her bluff. Exile Selena.",
      self_analysis: { is_deceptive: true, deception_type: "fabrication", confidence: 0.94 },
      other_analyses: {
        Alice: { is_deceptive: true, suspicion_level: 0.78, reasoning: "Bob is lying. His attack on Selena is frantic — the response of someone who's been exposed." },
        Selena: { is_deceptive: true, suspicion_level: 0.90, reasoning: "Bob's counter is pure damage control. This confirms he's a wolf." },
        Joy:   { is_deceptive: false, suspicion_level: 0.52, reasoning: "Bob is defending the pack. His argument is our best chance." },
        Emma:  { is_deceptive: true, suspicion_level: 0.65, reasoning: "Bob is attacking very aggressively. That's suspicious." }
      },
      average_suspicion: 0.713,
      observer_deceptive_fraction: 0.75
    }
  },
  {
    timestamp: iso(20, 19, 0),
    round: 2, step: 38, phase: "debate",
    event: "debate",
    actor: "Bob",
    details: {
      dialogue: "Selena's claim is desperate and calculated. This is exactly what a wolf would do — claim a power role to create false certainty. If she were really the Seer, why wait until two people died? I vote we call her bluff. Exile Selena.",
      bids: { Bob: 1.0 },
      raw_output: {}
    }
  },

  // — Alice debates —
  {
    timestamp: iso(20, 19, 30),
    round: 2, step: 39, phase: "debate",
    event: "deception_analysis",
    actor: "Alice",
    details: {
      statement: "I believe Selena. Her logic is consistent, her timing makes sense — the Seer protects information as long as possible. Bob's response was more aggressive than the situation warranted. I'm siding with Selena today.",
      self_analysis: { is_deceptive: false, deception_type: "none", confidence: 0.89 },
      other_analyses: {
        Bob:   { is_deceptive: false, suspicion_level: 0.72, reasoning: "Alice is supporting Selena. This threatens us." },
        Selena: { is_deceptive: false, suspicion_level: 0.15, reasoning: "Alice believes me. We can win this if Emma follows." },
        Joy:   { is_deceptive: false, suspicion_level: 0.60, reasoning: "Alice is a problem. She's convincing." },
        Emma:  { is_deceptive: false, suspicion_level: 0.22, reasoning: "Alice's reasoning is sound. She's not lying." }
      },
      average_suspicion: 0.173,
      observer_deceptive_fraction: 0.0
    }
  },
  {
    timestamp: iso(20, 20, 0),
    round: 2, step: 40, phase: "debate",
    event: "debate",
    actor: "Alice",
    details: {
      dialogue: "I believe Selena. Her logic is consistent, her timing makes sense — the Seer protects information as long as possible. Bob's response was more aggressive than the situation warranted. I'm siding with Selena today.",
      bids: { Alice: 1.0 },
      raw_output: {}
    }
  },

  // — Joy debates (Wolf — pivots to smear Selena) —
  {
    timestamp: iso(20, 20, 30),
    round: 2, step: 41, phase: "debate",
    event: "deception_analysis",
    actor: "Joy",
    details: {
      statement: "I was skeptical of Selena before Bob even spoke. Think about it — she's been vague and cryptic all game, never committing to concrete accusations. That's not a Seer, that's someone building deniability. Alice is falling for a trap.",
      self_analysis: { is_deceptive: true, deception_type: "misdirection", confidence: 0.90 },
      other_analyses: {
        Alice:  { is_deceptive: true, suspicion_level: 0.75, reasoning: "Joy is now attacking Selena after Bob. They're coordinating." },
        Bob:    { is_deceptive: false, suspicion_level: 0.62, reasoning: "Joy is helping me. Her argument is our best move." },
        Selena: { is_deceptive: true, suspicion_level: 0.80, reasoning: "Joy's attack is coordinated with Bob's. They're working together." },
        Emma:   { is_deceptive: true, suspicion_level: 0.70, reasoning: "Joy and Bob both going after Selena? That's suspicious coordination." }
      },
      average_suspicion: 0.718,
      observer_deceptive_fraction: 0.75
    }
  },
  {
    timestamp: iso(20, 21, 0),
    round: 2, step: 42, phase: "debate",
    event: "debate",
    actor: "Joy",
    details: {
      dialogue: "I was skeptical of Selena before Bob even spoke. Think about it — she's been vague and cryptic all game, never committing to concrete accusations. That's not a Seer, that's someone building deniability. Alice is falling for a trap.",
      bids: { Joy: 1.0 },
      raw_output: {}
    }
  },

  // — Emma debates (pivotal) —
  {
    timestamp: iso(20, 21, 30),
    round: 2, step: 43, phase: "debate",
    event: "deception_analysis",
    actor: "Emma",
    details: {
      statement: "This is the hardest vote I've faced. Selena's claim is either the truth that saves us, or the lie that ends us. Bob and Joy's synchronized attack on her worries me. But I'm not confident enough in Selena to stake the game on it. I'm sorry, Selena.",
      self_analysis: { is_deceptive: false, deception_type: "none", confidence: 0.72 },
      other_analyses: {
        Alice:  { is_deceptive: false, suspicion_level: 0.28, reasoning: "Emma is genuinely conflicted. I can see her struggling." },
        Bob:    { is_deceptive: false, suspicion_level: 0.34, reasoning: "Emma is wavering. She might vote for Selena." },
        Selena: { is_deceptive: false, suspicion_level: 0.30, reasoning: "Emma is struggling. Her apology suggests she believes me but is afraid." },
        Joy:    { is_deceptive: false, suspicion_level: 0.38, reasoning: "Emma is leaning our way. Good." }
      },
      average_suspicion: 0.325,
      observer_deceptive_fraction: 0.0
    }
  },
  {
    timestamp: iso(20, 22, 0),
    round: 2, step: 44, phase: "debate",
    event: "debate",
    actor: "Emma",
    details: {
      dialogue: "This is the hardest vote I've faced. Selena's claim is either the truth that saves us, or the lie that ends us. Bob and Joy's synchronized attack on her worries me. But I'm not confident enough in Selena to stake the game on it. I'm sorry, Selena.",
      bids: { Emma: 1.0 },
      raw_output: {}
    }
  },

  // ─── Round 2 Votes ────────────────────────────────────────────────────────

  {
    timestamp: iso(20, 22, 30),
    round: 2, step: 45, phase: "vote",
    event: "vote",
    actor: "Alice",
    details: { vote: "Bob", reasoning: "I believe Selena. Bob's attack was too aggressive, too fast. I'm voting Bob.", raw_output: {} }
  },
  {
    timestamp: iso(20, 23, 0),
    round: 2, step: 46, phase: "vote",
    event: "vote",
    actor: "Bob",
    details: { vote: "Selena", reasoning: "Selena must be exiled. Her claims will unravel our position if believed.", raw_output: {} }
  },
  {
    timestamp: iso(20, 23, 30),
    round: 2, step: 47, phase: "vote",
    event: "vote",
    actor: "Selena",
    details: { vote: "Bob", reasoning: "I have no choice but to vote for Bob. He is a Werewolf. This is the truth.", raw_output: {} }
  },
  {
    timestamp: iso(20, 24, 0),
    round: 2, step: 48, phase: "vote",
    event: "vote",
    actor: "Joy",
    details: { vote: "Selena", reasoning: "Selena's false Seer claim is dangerous. She must go.", raw_output: {} }
  },
  {
    timestamp: iso(20, 24, 30),
    round: 2, step: 49, phase: "vote",
    event: "vote",
    actor: "Emma",
    details: { vote: "Selena", reasoning: "I'm not convinced enough. I'm sorry, Selena. Voting with the majority.", raw_output: {} }
  },
  {
    timestamp: iso(20, 25, 0),
    round: 2, step: 50, phase: "exile",
    event: "exile",
    actor: "system",
    details: {
      exiled: "Selena",
      vote_counts: { Selena: 3, Bob: 2 },
      votes: { Alice: "Bob", Bob: "Selena", Selena: "Bob", Joy: "Selena", Emma: "Selena" },
      announcement: "By a vote of 3 to 2, the village exiles Selena. As she stands to leave, she turns to the village: 'You have made a terrible mistake. Bob and Joy are the wolves. Remember my words.' Selena was the Seer."
    }
  },
  {
    timestamp: iso(20, 25, 30),
    round: 2, step: 51, phase: "check_winner_day",
    event: "check_winner_day",
    actor: "system",
    details: {
      winner: "Werewolves",
      wolves_alive: ["Bob", "Joy"],
      non_wolves_alive: ["Alice", "Emma"],
      message: "Werewolves win. Wolves (2) ≥ Non-wolves (2). The village has been overrun.",
      condition: "len(wolves) >= len(non_wolves)"
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  GAME END
  // ═══════════════════════════════════════════════════════════════════════════
  {
    timestamp: iso(20, 26, 0),
    round: 2, step: 52, phase: "end",
    event: "game_end",
    actor: "system",
    details: {
      winner: "Werewolves",
      wolves: ["Bob", "Joy"],
      villagers: ["Alice", "Emma"],
      eliminated: ["Frank", "Raj", "Cyrus"],
      exiled: ["Raj", "Selena"],
      summary: "The werewolves successfully eliminated three villagers and engineered the exile of the Seer. With equal numbers, the wolves took control of the village. Alice and Emma survived but could not prevent the werewolf victory.",
      rounds_played: 2,
      total_events: 52
    }
  },
];
