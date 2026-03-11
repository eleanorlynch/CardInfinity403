import type { Ruleset } from "./RulesetTypes";

/** Serializable snapshot for persisting game state (e.g. current_session table). */
export interface GameStateSnapshot {
  gameId: number;
  ruleset: string[];
  gameOver: boolean;
  winner: number;
  winners: number[];
  tied: boolean;
  currentTurn: number;
  totalRounds: number;
  drawsThisTurn: number;
  playsThisTurn: number;
  discardsThisTurn: number;
  extraTurn: boolean;
  skipNextPlayer: boolean;
  reverseTurnOrder: boolean;
  players: { id: number; hand: { rank: number; suit: string; id: string }[] }[];
  deck: { rank: number; suit: string; id: string }[];
  discardPile: { rank: number; suit: string; id: string }[];
  rulesetData: Ruleset;
}
