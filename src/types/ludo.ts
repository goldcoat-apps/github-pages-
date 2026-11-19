export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export interface LudoToken {
  id: number; // 0 to 3
  color: PlayerColor;
  stepCount: number; // -1 if in yard, 0..50+ on outer track, 51..55 in home column, 56 in home goal
  inCorridor: boolean; // true if turned into home corridor (steps 51..55)
  isHome: boolean; // true if reached center goal
}

export interface Player {
  id: string;
  color: PlayerColor;
  name: string;
  isBot: boolean;
  avatar: string;
  tokens: LudoToken[];
  kills: number; // African Home rule: tracks how many enemy tokens this player has chopped
  hasKilled: boolean; // African Home rule: true if kills >= 1 (home corridor unlocked!)
  rank?: number; // 1st, 2nd, 3rd, 4th
}

export type TokenMoveType = 'forward' | 'reverse_chop' | 'home_raid' | 'backward';

export interface TokenMoveOption {
  tokenId: number;
  moveType: TokenMoveType;
  label: string;
  badge?: string;
  targetStepCount: number;
  targetInCorridor: boolean;
  targetIsHome: boolean;
  victim?: { playerColor: PlayerColor; tokenId: number; name: string };
}

export interface LudoRulesConfig {
  africanHomeRules: boolean; // Master toggle for African Home Ludo
  mustKillToEnterHome: boolean; // African Home: Must chop >= 1 opponent token before entering home corridor
  blockadesEnabled: boolean; // African Home: 2 tokens of same color form an impenetrable roadblock
  releaseOnSixOrOne: boolean; // African Street/Home: 1 or 6 releases token from yard (default: false = 6 only)
  tripleSixPenalty: boolean; // 3 consecutive sixes forfeits turn
  captureBonusRoll: boolean; // Chopping an opponent grants a bonus roll
  homeBonusRoll: boolean; // Reaching center home goal grants a bonus roll
  reverseChopEnabled: boolean; // African Home: Can move backwards by dice roll to chop an opponent to yard
  homeLineRaidEnabled: boolean; // African Home: Can enter opponent home corridor to chop a seed and return to track
}

export interface LudoMatchConfig {
  playerCount: 2 | 3 | 4;
  rules?: LudoRulesConfig;
  players: {
    color: PlayerColor;
    name: string;
    isBot: boolean;
  }[];
}

export interface LudoGameState {
  players: Player[];
  activePlayerIndex: number;
  diceValue: number | null;
  isRolling: boolean;
  canRoll: boolean;
  consecutiveSixes: number;
  movableTokens: number[]; // token IDs that can move with current dice
  selectedTokenId: number | null;
  statusMessage: string;
  winners: PlayerColor[];
  gameOver: boolean;
  historyLog: string[];
  lastAction: string | null;
  rules: LudoRulesConfig;
  chopAlert: { message: string; killer: PlayerColor; victim: PlayerColor } | null;
}

