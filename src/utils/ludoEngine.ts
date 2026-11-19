import {
  LudoGameState,
  LudoMatchConfig,
  LudoRulesConfig,
  LudoToken,
  Player,
  PlayerColor,
  TokenMoveOption,
  TokenMoveType,
} from '../types/ludo';

export const TRACK_COORDINATES: { [trackIndex: number]: { r: number; c: number } } = {
  0: { r: 6, c: 1 },
  1: { r: 6, c: 2 },
  2: { r: 6, c: 3 },
  3: { r: 6, c: 4 },
  4: { r: 6, c: 5 },
  5: { r: 5, c: 6 },
  6: { r: 4, c: 6 },
  7: { r: 3, c: 6 },
  8: { r: 2, c: 6 }, // Star
  9: { r: 1, c: 6 },
  10: { r: 0, c: 6 },
  11: { r: 0, c: 7 },
  12: { r: 0, c: 8 },
  13: { r: 1, c: 8 }, // Green start
  14: { r: 2, c: 8 },
  15: { r: 3, c: 8 },
  16: { r: 4, c: 8 },
  17: { r: 5, c: 8 },
  18: { r: 6, c: 9 },
  19: { r: 6, c: 10 },
  20: { r: 6, c: 11 },
  21: { r: 6, c: 12 }, // Star
  22: { r: 6, c: 13 },
  23: { r: 6, c: 14 },
  24: { r: 7, c: 14 },
  25: { r: 8, c: 14 },
  26: { r: 8, c: 13 }, // Yellow start
  27: { r: 8, c: 12 },
  28: { r: 8, c: 11 },
  29: { r: 8, c: 10 },
  30: { r: 8, c: 9 },
  31: { r: 9, c: 8 },
  32: { r: 10, c: 8 },
  33: { r: 11, c: 8 },
  34: { r: 12, c: 8 }, // Star
  35: { r: 13, c: 8 },
  36: { r: 14, c: 8 },
  37: { r: 14, c: 7 },
  38: { r: 14, c: 6 },
  39: { r: 13, c: 6 }, // Blue start
  40: { r: 12, c: 6 },
  41: { r: 11, c: 6 },
  42: { r: 10, c: 6 },
  43: { r: 9, c: 6 },
  44: { r: 8, c: 5 },
  45: { r: 8, c: 4 },
  46: { r: 8, c: 3 },
  47: { r: 8, c: 2 }, // Star
  48: { r: 8, c: 1 },
  49: { r: 8, c: 0 },
  50: { r: 7, c: 0 },
  51: { r: 6, c: 0 },
};

export const HOME_CORRIDORS: Record<PlayerColor, { r: number; c: number }[]> = {
  red: [
    { r: 7, c: 1 },
    { r: 7, c: 2 },
    { r: 7, c: 3 },
    { r: 7, c: 4 },
    { r: 7, c: 5 },
  ],
  green: [
    { r: 1, c: 7 },
    { r: 2, c: 7 },
    { r: 3, c: 7 },
    { r: 4, c: 7 },
    { r: 5, c: 7 },
  ],
  yellow: [
    { r: 7, c: 13 },
    { r: 7, c: 12 },
    { r: 7, c: 11 },
    { r: 7, c: 10 },
    { r: 7, c: 9 },
  ],
  blue: [
    { r: 13, c: 7 },
    { r: 12, c: 7 },
    { r: 11, c: 7 },
    { r: 10, c: 7 },
    { r: 9, c: 7 },
  ],
};

export const YARD_POSITIONS: Record<PlayerColor, { r: number; c: number }[]> = {
  red: [
    { r: 2, c: 2 },
    { r: 2, c: 3 },
    { r: 3, c: 2 },
    { r: 3, c: 3 },
  ],
  green: [
    { r: 2, c: 11 },
    { r: 2, c: 12 },
    { r: 3, c: 11 },
    { r: 3, c: 12 },
  ],
  yellow: [
    { r: 11, c: 11 },
    { r: 11, c: 12 },
    { r: 12, c: 11 },
    { r: 12, c: 12 },
  ],
  blue: [
    { r: 11, c: 2 },
    { r: 11, c: 3 },
    { r: 12, c: 2 },
    { r: 12, c: 3 },
  ],
};

export const START_INDICES: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

export const SAFE_SQUARES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
export const HOME_GOAL_STEP = 56;

export const CORRIDOR_ENTRANCE_TRACK: Record<PlayerColor, number> = {
  red: 50,
  green: 11,
  yellow: 24,
  blue: 37,
};

export const DEFAULT_AFRICAN_LUDO_RULES: LudoRulesConfig = {
  africanHomeRules: true,
  mustKillToEnterHome: true, // Signature African Home rule: must chop at least 1 opponent to enter home corridor
  blockadesEnabled: true,    // 2 tokens of same color form an impenetrable roadblock
  releaseOnSixOrOne: false,  // Standard 6 to release from yard (toggleable to 1 or 6)
  tripleSixPenalty: true,    // 3 sixes forfeits turn
  captureBonusRoll: true,    // Chop grants a bonus roll
  homeBonusRoll: true,       // Reaching center home goal grants a bonus roll
  reverseChopEnabled: true,  // African Home: Can move backwards by dice roll to chop opponent to yard
  homeLineRaidEnabled: true, // African Home: Can enter opponent home corridor to chop a seed and return to track
};

export const CLASSIC_INTERNATIONAL_LUDO_RULES: LudoRulesConfig = {
  africanHomeRules: false,
  mustKillToEnterHome: false,
  blockadesEnabled: false,
  releaseOnSixOrOne: false,
  tripleSixPenalty: true,
  captureBonusRoll: true,
  homeBonusRoll: true,
  reverseChopEnabled: false,
  homeLineRaidEnabled: false,
};

/**
 * Calculates global track index (0..51) for any token on the outer circuit.
 */
export function getTokenGlobalTrackIndex(color: PlayerColor, stepCount: number): number | null {
  if (stepCount < 0) return null;
  const start = START_INDICES[color];
  return (start + stepCount) % 52;
}

/**
 * Maps token state to precise board grid coordinates (row, col).
 */
export function getTokenBoardCoordinate(token: LudoToken): { r: number; c: number } {
  const { color, stepCount, inCorridor, isHome, id } = token;

  if (stepCount < 0) {
    // In Yard
    return YARD_POSITIONS[color][id] || { r: 0, c: 0 };
  }

  if (isHome) {
    // Center Home Goal
    return { r: 7, c: 7 };
  }

  if (inCorridor) {
    // Inside colored home corridor (steps 51..55 -> indices 0..4)
    const corridorIdx = Math.max(0, Math.min(4, stepCount - 51));
    return HOME_CORRIDORS[color][corridorIdx] || { r: 7, c: 7 };
  }

  // On outer circuit
  const trackIdx = getTokenGlobalTrackIndex(color, stepCount);
  if (trackIdx !== null && TRACK_COORDINATES[trackIdx]) {
    return TRACK_COORDINATES[trackIdx];
  }

  return { r: 7, c: 7 };
}

/**
 * Detects all active blockades (2+ friendly tokens on same outer track square).
 * Returns map of trackIndex -> PlayerColor
 */
export function getActiveBlockades(players: Player[]): Map<number, PlayerColor> {
  const blockades = new Map<number, PlayerColor>();
  const countsByColorAndTrack = new Map<string, number>();

  for (const player of players) {
    for (const token of player.tokens) {
      if (token.stepCount >= 0 && !token.inCorridor && !token.isHome) {
        const trackIdx = getTokenGlobalTrackIndex(token.color, token.stepCount);
        if (trackIdx !== null) {
          const key = `${player.color}-${trackIdx}`;
          const current = (countsByColorAndTrack.get(key) || 0) + 1;
          countsByColorAndTrack.set(key, current);
          if (current >= 2) {
            blockades.set(trackIdx, player.color);
          }
        }
      }
    }
  }

  return blockades;
}

export function createInitialLudoGame(config: LudoMatchConfig): LudoGameState {
  const rules = config.rules || DEFAULT_AFRICAN_LUDO_RULES;
  const players: Player[] = config.players.map((p, idx) => ({
    id: `player_${idx}`,
    color: p.color,
    name: p.name,
    isBot: p.isBot,
    avatar: p.isBot ? '🤖' : ['👑', '⭐', '⚡', '🔥'][idx % 4],
    kills: 0,
    hasKilled: !rules.mustKillToEnterHome, // If must-kill rule is disabled, home is unlocked by default
    tokens: [
      { id: 0, color: p.color, stepCount: -1, inCorridor: false, isHome: false },
      { id: 1, color: p.color, stepCount: -1, inCorridor: false, isHome: false },
      { id: 2, color: p.color, stepCount: -1, inCorridor: false, isHome: false },
      { id: 3, color: p.color, stepCount: -1, inCorridor: false, isHome: false },
    ],
  }));

  return {
    players,
    activePlayerIndex: 0,
    diceValue: null,
    isRolling: false,
    canRoll: true,
    consecutiveSixes: 0,
    movableTokens: [],
    selectedTokenId: null,
    statusMessage: `${players[0].name}'s turn to roll!`,
    winners: [],
    gameOver: false,
    historyLog: [`African Home Ludo match started with ${players.length} players.`],
    lastAction: null,
    rules,
    chopAlert: null,
  };
}

/**
 * Validates whether a token can legally move with the current dice roll under African Home rules.
 */
/**
 * Helper to check if an enemy token on a track square can be legally chopped.
 */
export function findChoppableEnemyAtTrack(
  trackIdx: number,
  myColor: PlayerColor,
  allPlayers: Player[],
  blockades: Map<number, PlayerColor>,
  africanHomeRules: boolean = true
): { playerColor: PlayerColor; tokenId: number; name: string } | null {
  // In African Home Ludo: "No two different opponent states one box, one have to send to yard"
  // Safe stars only grant immunity in Classic International Ludo.
  if (!africanHomeRules && SAFE_SQUARES.has(trackIdx)) return null;
  const blockadeColor = blockades.get(trackIdx);
  if (blockadeColor && blockadeColor !== myColor) return null;

  for (const p of allPlayers) {
    if (p.color === myColor) continue;
    for (const t of p.tokens) {
      if (t.stepCount >= 0 && !t.inCorridor && !t.isHome) {
        const tTrack = getTokenGlobalTrackIndex(t.color, t.stepCount);
        if (tTrack === trackIdx) {
          return {
            playerColor: p.color,
            tokenId: t.id,
            name: `${p.name} seed #${t.id + 1}`,
          };
        }
      }
    }
  }
  return null;
}

/**
 * Calculates all legal move options for a token under African Home Ludo rules:
 * - Forward advance
 * - Reverse Chop (African Home Rule: move backward by dice count to chop enemy to yard)
 * - Home Line Raid (African Home Rule: invade opponent home corridor, chop enemy to yard, and return to track)
 */
export function getTokenLegalMoves(
  token: LudoToken,
  dice: number,
  player: Player,
  allPlayers: Player[],
  rules: LudoRulesConfig
): TokenMoveOption[] {
  if (token.isHome) return [];
  const options: TokenMoveOption[] = [];
  const blockades = rules.blockadesEnabled ? getActiveBlockades(allPlayers) : new Map<number, PlayerColor>();

  // 1. In Yard
  if (token.stepCount < 0) {
    const canDeploy = rules.releaseOnSixOrOne ? dice === 6 || dice === 1 : dice === 6;
    if (canDeploy) {
      const startTrackIdx = START_INDICES[token.color];
      const enemyBlockade = blockades.get(startTrackIdx);
      if (!enemyBlockade || enemyBlockade === token.color) {
        options.push({
          tokenId: token.id,
          moveType: 'forward',
          label: `Deploy onto Start (Square ${startTrackIdx})`,
          badge: 'DEPLOY',
          targetStepCount: 0,
          targetInCorridor: false,
          targetIsHome: false,
        });
      }
    }
    return options;
  }

  // 2. In Corridor
  if (token.inCorridor) {
    // 2a. Advance forward along corridor
    const forwardStep = token.stepCount + dice;
    if (forwardStep <= HOME_GOAL_STEP) {
      options.push({
        tokenId: token.id,
        moveType: 'forward',
        label: forwardStep === HOME_GOAL_STEP ? 'Enter Center Home Goal! 🏆' : `Advance in Corridor (+${dice})`,
        targetStepCount: forwardStep,
        targetInCorridor: true,
        targetIsHome: forwardStep === HOME_GOAL_STEP,
      });
    }

    // 2b. Move backward out of corridor to track (Reverse Chop from corridor entrance)
    if (rules.reverseChopEnabled) {
      const stepsToEntrance = token.stepCount - 50; // 1 to 5
      if (dice === stepsToEntrance) {
        const entranceTrack = CORRIDOR_ENTRANCE_TRACK[token.color];
        const victim = findChoppableEnemyAtTrack(entranceTrack, player.color, allPlayers, blockades, rules.africanHomeRules);
        if (victim) {
          options.push({
            tokenId: token.id,
            moveType: 'reverse_chop',
            label: `Reverse Out of Corridor to Chop ${victim.name}! ⚔️`,
            badge: 'REVERSE CHOP',
            targetStepCount: 50,
            targetInCorridor: false,
            targetIsHome: false,
            victim,
          });
        }
      }
    }

    return options;
  }

  // 3. On Outer Circuit
  const fromTrack = (START_INDICES[token.color] + token.stepCount) % 52;
  const distOnLap = token.stepCount % 52;
  const isApproachingCorridor = distOnLap <= 50 && distOnLap + dice > 50;

  // 3a. Forward Move
  if (isApproachingCorridor) {
    if (player.hasKilled || !rules.mustKillToEnterHome) {
      // Option 1: Continue into Home Corridor!
      const stepsOnTrack = 50 - distOnLap;
      let blocked = false;
      for (let s = 1; s <= stepsOnTrack; s++) {
        const checkTrack = (fromTrack + s) % 52;
        const enemyBlockade = blockades.get(checkTrack);
        if (enemyBlockade && enemyBlockade !== token.color) {
          blocked = true;
          break;
        }
      }
      if (!blocked) {
        const overshoot = distOnLap + dice - 50;
        const targetStep = 50 + overshoot;
        if (targetStep <= HOME_GOAL_STEP) {
          options.push({
            tokenId: token.id,
            moveType: 'forward',
            label: targetStep === HOME_GOAL_STEP ? 'Enter Center Home Goal! 🏆' : `Continue to Home (+${dice})`,
            badge: 'TO HOME',
            targetStepCount: targetStep,
            targetInCorridor: true,
            targetIsHome: targetStep === HOME_GOAL_STEP,
          });
        }
      }

      // Option 2: African Home Rules - "The journey can be continue to home or annual journey(shorts cut)."
      // The player can tactically choose to stay on track and continue the annual journey circuit!
      if (rules.africanHomeRules) {
        let lapBlocked = false;
        for (let s = 1; s <= dice; s++) {
          const checkTrack = (fromTrack + s) % 52;
          const enemyBlockade = blockades.get(checkTrack);
          if (enemyBlockade && enemyBlockade !== token.color) {
            lapBlocked = true;
            break;
          }
        }
        if (!lapBlocked) {
          options.push({
            tokenId: token.id,
            moveType: 'forward',
            label: `Annual Journey on Track (+${dice})`,
            badge: 'ANNUAL JOURNEY',
            targetStepCount: token.stepCount + dice,
            targetInCorridor: false,
            targetIsHome: false,
          });
        }
      }
    } else {
      // Home is LOCKED! In African Home Ludo, seed cannot turn into home; it must take another lap around track
      let blocked = false;
      for (let s = 1; s <= dice; s++) {
        const checkTrack = (fromTrack + s) % 52;
        const enemyBlockade = blockades.get(checkTrack);
        if (enemyBlockade && enemyBlockade !== token.color) {
          blocked = true;
          break;
        }
      }
      if (!blocked) {
        options.push({
          tokenId: token.id,
          moveType: 'forward',
          label: `Continue Lap on Track (+${dice})`,
          badge: 'TRACK LAP',
          targetStepCount: token.stepCount + dice,
          targetInCorridor: false,
          targetIsHome: false,
        });
      }
    }
  } else {
    // Normal track forward movement
    let blocked = false;
    for (let s = 1; s <= dice; s++) {
      const checkTrack = (fromTrack + s) % 52;
      const enemyBlockade = blockades.get(checkTrack);
      if (enemyBlockade && enemyBlockade !== token.color) {
        blocked = true;
        break;
      }
    }
    if (!blocked) {
      options.push({
        tokenId: token.id,
        moveType: 'forward',
        label: `Move Forward (+${dice})`,
        targetStepCount: token.stepCount + dice,
        targetInCorridor: false,
        targetIsHome: false,
      });
    }
  }

  // 3b. Reverse Chop on Track (African Home Rule: "when you count back to send piece to yard you have to put your piece at that place and continue your journey")
  if (rules.reverseChopEnabled) {
    const backTrack = (fromTrack - dice + 52) % 52;
    // Check if path backward is blocked by enemy roadblock
    let backBlocked = false;
    for (let s = 1; s <= dice; s++) {
      const checkTrack = (fromTrack - s + 52) % 52;
      const enemyBlockade = blockades.get(checkTrack);
      if (enemyBlockade && enemyBlockade !== token.color) {
        backBlocked = true;
        break;
      }
    }

    if (!backBlocked) {
      const victim = findChoppableEnemyAtTrack(backTrack, player.color, allPlayers, blockades, rules.africanHomeRules);
      if (victim) {
        // Place the piece at that exact place where the victim was chopped:
        const trackDistFromStart = (backTrack - START_INDICES[token.color] + 52) % 52;
        const targetStep = token.stepCount - dice >= 0
          ? token.stepCount - dice
          : trackDistFromStart;

        options.push({
          tokenId: token.id,
          moveType: 'reverse_chop',
          label: `Reverse Chop ${victim.name} to Yard! ⚔️`,
          badge: 'REVERSE CHOP',
          targetStepCount: targetStep,
          targetInCorridor: false,
          targetIsHome: false,
          victim,
        });
      }
    }
  }

  // 3c. Home Line Raid (African Home Rule: "it can inter home line send piece to yard and back continues the journey")
  if (rules.homeLineRaidEnabled) {
    for (const otherPlayer of allPlayers) {
      if (otherPlayer.color === player.color) continue;
      const oppEntrance = CORRIDOR_ENTRANCE_TRACK[otherPlayer.color];
      const stepsToEntrance = (oppEntrance - fromTrack + 52) % 52;

      // Check if dice reaches through entrance and into otherPlayer's home line
      if (dice > stepsToEntrance && dice <= stepsToEntrance + 5) {
        const corridorIndex = dice - stepsToEntrance - 1; // 0..4
        const targetCorridorStep = 51 + corridorIndex;

        // Is there an enemy token sitting in this corridor slot?
        const enemyInCorridor = otherPlayer.tokens.find(
          t => t.inCorridor && t.stepCount === targetCorridorStep && !t.isHome
        );

        if (enemyInCorridor) {
          // Check if path to opponent entrance is blocked by enemy blockade
          let blockedToEntrance = false;
          for (let s = 1; s <= stepsToEntrance; s++) {
            const checkTrack = (fromTrack + s) % 52;
            const enemyBlockade = blockades.get(checkTrack);
            if (enemyBlockade && enemyBlockade !== player.color) {
              blockedToEntrance = true;
              break;
            }
          }

          if (!blockedToEntrance) {
            // Target step count on outer track after raiding into corridor and coming back to continue journey
            const trackDistToEntrance = (oppEntrance - START_INDICES[player.color] + 52) % 52;
            const lapBase = Math.floor(token.stepCount / 52) * 52;
            let raidReturnStep = lapBase + trackDistToEntrance;
            if (raidReturnStep < token.stepCount) {
              raidReturnStep += 52;
            }

            options.push({
              tokenId: token.id,
              moveType: 'home_raid',
              label: `Raid ${otherPlayer.name}'s Home Line & Chop to Yard! ⚡`,
              badge: 'HOME RAID',
              targetStepCount: raidReturnStep,
              targetInCorridor: false,
              targetIsHome: false,
              victim: {
                playerColor: otherPlayer.color,
                tokenId: enemyInCorridor.id,
                name: `${otherPlayer.name} seed #${enemyInCorridor.id + 1}`,
              },
            });
          }
        }
      }
    }
  }

  return options;
}

/**
 * Validates whether a token can legally move with the current dice roll under African Home rules.
 */
export function canTokenMove(
  token: LudoToken,
  dice: number,
  player: Player,
  allPlayers: Player[],
  rules: LudoRulesConfig
): boolean {
  return getTokenLegalMoves(token, dice, player, allPlayers, rules).length > 0;
}

export function getMovableTokens(
  player: Player,
  dice: number,
  allPlayers: Player[],
  rules: LudoRulesConfig
): number[] {
  const movable: number[] = [];
  for (const token of player.tokens) {
    if (canTokenMove(token, dice, player, allPlayers, rules)) {
      movable.push(token.id);
    }
  }
  return movable;
}

/**
 * Move a token and execute African Home Ludo mechanics:
 * - Forward advance
 * - Reverse Chop (move backward to chop opponent to yard)
 * - Home Line Raid (enter opponent home corridor, chop seed to yard, and return to track)
 * - Unlock home corridor upon first chop (Must Kill rule)
 * - Bonus rolls for chopping, rolling 6, or reaching home
 * - Triple 6 penalty
 */
export function executeTokenMove(
  state: LudoGameState,
  tokenId: number,
  chosenOption?: TokenMoveOption
): {
  nextState: LudoGameState;
  capturedToken: { color: PlayerColor; id: number } | null;
  reachedHome: boolean;
  earnedBonusRoll: boolean;
  unlockedHome: boolean;
} {
  const player = state.players[state.activePlayerIndex];
  const dice = state.diceValue!;
  const token = player.tokens.find(t => t.id === tokenId)!;
  const rules = state.rules;

  // Resolve which legal move option to execute (prefer captures: home raid, reverse chop, or forward chop)
  const legalMoves = getTokenLegalMoves(token, dice, player, state.players, rules);
  const move =
    chosenOption ||
    legalMoves.find(m => m.moveType === 'home_raid') ||
    legalMoves.find(m => m.moveType === 'reverse_chop') ||
    legalMoves.find(m => m.victim !== undefined) ||
    legalMoves[0];

  if (!move) {
    return {
      nextState: state,
      capturedToken: null,
      reachedHome: false,
      earnedBonusRoll: false,
      unlockedHome: false,
    };
  }

  let capturedToken: { color: PlayerColor; id: number } | null = null;
  let reachedHome = move.targetIsHome;
  let earnedBonusRoll = dice === 6;
  let unlockedHome = false;

  const newStepCount = move.targetStepCount;
  const newInCorridor = move.targetInCorridor;
  const isNowHome = move.targetIsHome;

  if (reachedHome && rules.homeBonusRoll) {
    earnedBonusRoll = true;
  }

  // Update moving player's token
  const updatedTokens = player.tokens.map(t =>
    t.id === tokenId
      ? {
          ...t,
          stepCount: newStepCount,
          inCorridor: newInCorridor,
          isHome: isNowHome,
        }
      : t
  );

  let nextPlayers = state.players.map((p, idx) =>
    idx === state.activePlayerIndex ? { ...p, tokens: updatedTokens } : p
  );

  let moveDescription = `${player.name} moved seed #${tokenId + 1} by ${dice}`;

  // Execute specific move types
  if (move.moveType === 'home_raid' && move.victim) {
    // 💥 Home Line Raid! Invade opponent's corridor, chop seed to yard, and return to track
    capturedToken = {
      color: move.victim.playerColor,
      id: move.victim.tokenId,
    };
    if (rules.captureBonusRoll) {
      earnedBonusRoll = true;
    }

    // Send victim seed in corridor back to Yard
    nextPlayers = nextPlayers.map(p => {
      if (p.color === move.victim!.playerColor) {
        return {
          ...p,
          tokens: p.tokens.map(t =>
            t.id === move.victim!.tokenId
              ? { ...t, stepCount: -1, inCorridor: false, isHome: false }
              : t
          ),
        };
      }
      return p;
    });

    // Award kill to active player
    nextPlayers = nextPlayers.map((p, idx) => {
      if (idx === state.activePlayerIndex) {
        if (!p.hasKilled) unlockedHome = true;
        return { ...p, kills: p.kills + 1, hasKilled: true };
      }
      return p;
    });

    moveDescription = `⚡ African Home Raid: ${player.name} raided ${move.victim.playerColor}'s home line, chopped seed #${move.victim.tokenId + 1} to yard, and returned to track!`;
  } else if (move.moveType === 'reverse_chop' && move.victim) {
    // ⚔️ Reverse Chop! Move backward by dice count to chop enemy to yard
    capturedToken = {
      color: move.victim.playerColor,
      id: move.victim.tokenId,
    };
    if (rules.captureBonusRoll) {
      earnedBonusRoll = true;
    }

    // Send victim seed on track back to Yard
    nextPlayers = nextPlayers.map(p => {
      if (p.color === move.victim!.playerColor) {
        return {
          ...p,
          tokens: p.tokens.map(t =>
            t.id === move.victim!.tokenId
              ? { ...t, stepCount: -1, inCorridor: false, isHome: false }
              : t
          ),
        };
      }
      return p;
    });

    // Award kill to active player
    nextPlayers = nextPlayers.map((p, idx) => {
      if (idx === state.activePlayerIndex) {
        if (!p.hasKilled) unlockedHome = true;
        return { ...p, kills: p.kills + 1, hasKilled: true };
      }
      return p;
    });

    moveDescription = `⚔️ Reverse Chop: ${player.name} struck backward ${dice} steps and chopped ${move.victim.playerColor} seed #${move.victim.tokenId + 1} back to yard!`;
  } else if (move.moveType === 'forward' && !isNowHome && !newInCorridor && newStepCount >= 0) {
    // Standard Forward Move on outer track: check standard chops
    // African Home Rules: "No two different opponent states one box, one have to send to yard"
    const landingTrackIdx = getTokenGlobalTrackIndex(player.color, newStepCount)!;
    const isSafeSquare = !rules.africanHomeRules && SAFE_SQUARES.has(landingTrackIdx);

    if (!isSafeSquare) {
      const updatedOtherPlayers: Player[] = [];
      let choppedEnemy = false;

      for (let pIdx = 0; pIdx < nextPlayers.length; pIdx++) {
        const otherPlayer = nextPlayers[pIdx];
        if (pIdx === state.activePlayerIndex) {
          updatedOtherPlayers.push(otherPlayer);
          continue;
        }

        const remainingTokens: LudoToken[] = [];
        for (const otherToken of otherPlayer.tokens) {
          if (otherToken.stepCount >= 0 && !otherToken.inCorridor && !otherToken.isHome) {
            const otherTrackIdx = getTokenGlobalTrackIndex(otherToken.color, otherToken.stepCount);
            if (otherTrackIdx === landingTrackIdx) {
              // Chop! Opponent token sent back to Yard
              if (!capturedToken) {
                capturedToken = {
                  color: otherPlayer.color,
                  id: otherToken.id,
                };
              }
              choppedEnemy = true;
              if (rules.captureBonusRoll) {
                earnedBonusRoll = true;
              }

              remainingTokens.push({
                ...otherToken,
                stepCount: -1,
                inCorridor: false,
                isHome: false,
              });
              continue;
            }
          }
          remainingTokens.push(otherToken);
        }

        updatedOtherPlayers.push({
          ...otherPlayer,
          tokens: remainingTokens,
        });
      }

      if (choppedEnemy) {
        nextPlayers = updatedOtherPlayers.map((p, idx) => {
          if (idx === state.activePlayerIndex) {
            const newKills = p.kills + 1;
            if (!p.hasKilled) unlockedHome = true;
            return {
              ...p,
              kills: newKills,
              hasKilled: true,
            };
          }
          return p;
        });
        moveDescription = `💥 Chop: ${player.name} chopped ${capturedToken!.color} seed #${capturedToken!.id + 1} back to yard!`;
      } else {
        nextPlayers = updatedOtherPlayers;
      }
    }
  }

  // Check if active player just brought all tokens home
  const activeTokens = nextPlayers[state.activePlayerIndex].tokens;
  const allInHome = activeTokens.every(t => t.isHome);
  const updatedWinners = [...state.winners];

  if (allInHome && !updatedWinners.includes(player.color)) {
    updatedWinners.push(player.color);
  }

  const isGameOver = updatedWinners.length >= nextPlayers.length - 1;

  // Turn management & Triple 6 Penalty
  let nextActiveIndex = state.activePlayerIndex;
  let canRollNext = true;
  let nextConsecutiveSixes = dice === 6 ? state.consecutiveSixes + 1 : 0;

  if (rules.tripleSixPenalty && nextConsecutiveSixes >= 3) {
    earnedBonusRoll = false;
    nextConsecutiveSixes = 0;
  }

  if (!earnedBonusRoll || allInHome) {
    nextConsecutiveSixes = 0;
    let attempts = 0;
    do {
      nextActiveIndex = (nextActiveIndex + 1) % nextPlayers.length;
      attempts++;
    } while (updatedWinners.includes(nextPlayers[nextActiveIndex].color) && attempts < nextPlayers.length);
  }

  const nextActivePlayer = nextPlayers[nextActiveIndex];
  let status = `${nextActivePlayer.name}'s turn to roll`;
  let chopAlert: { message: string; killer: PlayerColor; victim: PlayerColor } | null = null;

  if (capturedToken) {
    if (move.moveType === 'home_raid') {
      status = `⚡ HOME RAID! ${player.name} raided ${capturedToken.color}'s home line and sent seed #${capturedToken.id + 1} to yard! Extra roll!`;
      chopAlert = {
        message: `⚡ African Home Raid! ${player.name} entered ${capturedToken.color}'s home line, chopped seed #${capturedToken.id + 1} to yard, and returned to track!`,
        killer: player.color,
        victim: capturedToken.color,
      };
    } else if (move.moveType === 'reverse_chop') {
      status = `⚔️ REVERSE CHOP! ${player.name} moved backward and chopped ${capturedToken.color}! Extra roll!`;
      chopAlert = {
        message: `⚔️ Reverse Chop! ${player.name} moved backward and chopped ${capturedToken.color} seed #${capturedToken.id + 1} to yard!`,
        killer: player.color,
        victim: capturedToken.color,
      };
    } else {
      status = `💥 CHOPPED! ${player.name} chopped ${capturedToken.color}! Extra roll!`;
      chopAlert = {
        message: `${player.name} chopped ${capturedToken.color}!`,
        killer: player.color,
        victim: capturedToken.color,
      };
    }

    if (unlockedHome) {
      status += ` Home Corridor UNLOCKED 🔓!`;
      chopAlert.message += ` Home Corridor is now UNLOCKED 🔓!`;
    }
  } else if (reachedHome) {
    status = `👑 GOAL! ${player.name} scored a token into Center Home! Extra roll!`;
  } else if (dice === 6 && earnedBonusRoll) {
    status = `${player.name} rolled a 6! Extra roll!`;
  } else if (rules.tripleSixPenalty && nextConsecutiveSixes === 0 && dice === 6) {
    status = `⚠️ Triple 6 Penalty! Three 6s in a row forfeits the turn!`;
  }

  const log = [moveDescription, ...state.historyLog.slice(0, 19)];

  return {
    nextState: {
      players: nextPlayers,
      activePlayerIndex: nextActiveIndex,
      diceValue: null,
      isRolling: false,
      canRoll: canRollNext,
      consecutiveSixes: nextConsecutiveSixes,
      movableTokens: [],
      selectedTokenId: null,
      statusMessage: status,
      winners: updatedWinners,
      gameOver: isGameOver,
      historyLog: log,
      lastAction: moveDescription,
      rules,
      chopAlert,
    },
    capturedToken,
    reachedHome,
    earnedBonusRoll,
    unlockedHome,
  };
}

/**
 * Intelligent African Ludo Bot Decision Engine:
 * - Prioritizes unlocking home corridor if currently locked
 * - Hunts enemy single tokens (chop!)
 * - Creates strategic blockades on track
 * - Protects tokens by entering safe star squares
 * - Moves home when unlocked
 */
export function getBotTokenMove(
  player: Player,
  movableTokenIds: number[],
  allPlayers: Player[],
  dice: number,
  rules: LudoRulesConfig
): number {
  if (movableTokenIds.length === 1) {
    return movableTokenIds[0];
  }

  // African Ludo Rule: "Ai have to take all win lawful pieces"
  // If ANY movable token can chop an opponent piece (forward chop, reverse chop, or home line raid),
  // the bot MUST choose among the tokens that execute a chop!
  const choppingTokenIds = movableTokenIds.filter(tid => {
    const token = player.tokens.find(t => t.id === tid);
    if (!token) return false;
    const moves = getTokenLegalMoves(token, dice, player, allPlayers, rules);
    return moves.some(m => m.victim !== undefined || m.moveType === 'home_raid' || m.moveType === 'reverse_chop');
  });

  const candidatesToConsider = choppingTokenIds.length > 0 ? choppingTokenIds : movableTokenIds;
  if (candidatesToConsider.length === 1) {
    return candidatesToConsider[0];
  }

  let bestTokenId = candidatesToConsider[0];
  let highestScore = -Infinity;

  const blockades = rules.blockadesEnabled ? getActiveBlockades(allPlayers) : new Map<number, PlayerColor>();

  for (const tid of candidatesToConsider) {
    const token = player.tokens.find(t => t.id === tid)!;
    let score = 0;

    const moves = getTokenLegalMoves(token, dice, player, allPlayers, rules);
    for (const m of moves) {
      if (m.moveType === 'home_raid') {
        score += (!player.hasKilled && rules.mustKillToEnterHome ? 2600 : 1300);
      } else if (m.moveType === 'reverse_chop') {
        score += (!player.hasKilled && rules.mustKillToEnterHome ? 2300 : 1100);
      }
    }

    // 1. Reaching home goal is top priority
    if (token.inCorridor && token.stepCount + dice === HOME_GOAL_STEP) {
      score += 1500;
    } else if (
      !token.inCorridor &&
      token.stepCount >= 0 &&
      (token.stepCount % 52) <= 50 &&
      (token.stepCount % 52) + dice > 50 &&
      (player.hasKilled || !rules.mustKillToEnterHome)
    ) {
      const overshoot = (token.stepCount % 52) + dice - 50;
      if (50 + overshoot === HOME_GOAL_STEP) {
        score += 1400;
      } else {
        score += 350; // Entering safe home corridor!
      }
    }

    // 2. Chopping opponent tokens (HUGE priority if home is locked!)
    if (token.stepCount >= 0 && !token.inCorridor) {
      const targetStep = token.stepCount + dice;
      const targetTrackIdx = getTokenGlobalTrackIndex(player.color, targetStep);
      const isTargetSafe = !rules.africanHomeRules && targetTrackIdx !== null && SAFE_SQUARES.has(targetTrackIdx);

      if (targetTrackIdx !== null && !isTargetSafe) {
        for (const opp of allPlayers) {
          if (opp.color === player.color) continue;
          for (const ot of opp.tokens) {
            if (ot.stepCount >= 0 && !ot.inCorridor && !ot.isHome) {
              const otTrack = getTokenGlobalTrackIndex(ot.color, ot.stepCount);
              if (otTrack === targetTrackIdx) {
                // If home is locked, chopping an enemy unlocks home for the entire team!
                if (!player.hasKilled && rules.mustKillToEnterHome) {
                  score += 2000;
                } else {
                  score += 850;
                }
              }
            }
          }
        }
      }
    }

    // 3. Exiting yard on 6 or 1
    if (token.stepCount < 0) {
      score += 450;
    }

    // 4. Forming a Blockade with a friendly token
    if (rules.blockadesEnabled && token.stepCount >= 0 && !token.inCorridor) {
      const targetTrackIdx = getTokenGlobalTrackIndex(player.color, token.stepCount + dice);
      if (targetTrackIdx !== null) {
        const friendlyTokensAtTarget = player.tokens.filter(
          t => t.id !== tid && t.stepCount >= 0 && !t.inCorridor && !t.isHome && getTokenGlobalTrackIndex(t.color, t.stepCount) === targetTrackIdx
        );
        if (friendlyTokensAtTarget.length === 1) {
          score += 400; // Creating a blockade roadblock!
        }
      }
    }

    // 5. Landing on safe Star tile (Classic International rules only)
    if (!rules.africanHomeRules && token.stepCount >= 0 && !token.inCorridor) {
      const targetTrackIdx = getTokenGlobalTrackIndex(player.color, token.stepCount + dice);
      if (targetTrackIdx !== null && SAFE_SQUARES.has(targetTrackIdx)) {
        score += 220;
      }
    }

    // 6. Prefer moving tokens closer to home
    score += token.stepCount * 2;

    if (score > highestScore) {
      highestScore = score;
      bestTokenId = tid;
    }
  }

  return bestTokenId;
}
