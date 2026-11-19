import React from 'react';
import { LudoRulesConfig, LudoToken, Player, PlayerColor } from '../../types/ludo';
import { getTokenBoardCoordinate } from '../../utils/ludoEngine';
import { LUDO_EMBLEMS, LUDO_CENTER_CREST } from '../../utils/ludoPictures';
import { Star, Lock, Unlock, Shield } from 'lucide-react';

interface LudoBoardProps {
  players: Player[];
  activePlayerIndex: number;
  movableTokens: number[];
  canSelectToken: boolean;
  rules?: LudoRulesConfig;
  onSelectToken: (tokenId: number) => void;
}

export const LudoBoard: React.FC<LudoBoardProps> = ({
  players,
  activePlayerIndex,
  movableTokens,
  canSelectToken,
  rules,
  onSelectToken,
}) => {
  const activePlayer = players[activePlayerIndex];

  // Helper to determine board tile role for the 72 cross track cells
  const getCrossTileInfo = (r: number, c: number) => {
    // Home corridors
    if (r === 7 && c >= 1 && c <= 5) return { type: 'home_corridor', color: 'red' as PlayerColor, index: c - 1 };
    if (c === 7 && r >= 1 && r <= 5) return { type: 'home_corridor', color: 'green' as PlayerColor, index: r - 1 };
    if (r === 7 && c >= 9 && c <= 13) return { type: 'home_corridor', color: 'yellow' as PlayerColor, index: 13 - c };
    if (c === 7 && r >= 9 && r <= 13) return { type: 'home_corridor', color: 'blue' as PlayerColor, index: 13 - r };

    // Starting positions
    if (r === 6 && c === 1) return { type: 'start', color: 'red' as PlayerColor };
    if (r === 1 && c === 8) return { type: 'start', color: 'green' as PlayerColor };
    if (r === 8 && c === 13) return { type: 'start', color: 'yellow' as PlayerColor };
    if (r === 13 && c === 6) return { type: 'start', color: 'blue' as PlayerColor };

    // Star Safe squares
    if ((r === 2 && c === 6) || (r === 6 && c === 12) || (r === 12 && c === 8) || (r === 8 && c === 2)) {
      return { type: 'star' };
    }

    return { type: 'track' };
  };

  // Group tokens by board coordinate
  const tokensByCoord: Record<string, { player: Player; token: LudoToken }[]> = {};
  for (const player of players) {
    for (const token of player.tokens) {
      if (token.stepCount >= 0) {
        const coord = getTokenBoardCoordinate(token);
        const key = `${coord.r},${coord.c}`;
        if (!tokensByCoord[key]) {
          tokensByCoord[key] = [];
        }
        tokensByCoord[key].push({ player, token });
      }
    }
  }

  const getColorClasses = (color: PlayerColor) => {
    switch (color) {
      case 'red':
        return {
          bg: 'bg-red-600',
          border: 'border-red-500',
          gradient: 'from-red-500 to-red-800',
          lightBg: 'bg-red-500/20',
          text: 'text-red-400',
        };
      case 'green':
        return {
          bg: 'bg-emerald-600',
          border: 'border-emerald-500',
          gradient: 'from-emerald-500 to-emerald-800',
          lightBg: 'bg-emerald-500/20',
          text: 'text-emerald-400',
        };
      case 'yellow':
        return {
          bg: 'bg-amber-500',
          border: 'border-amber-400',
          gradient: 'from-amber-400 to-amber-700',
          lightBg: 'bg-amber-500/20',
          text: 'text-amber-400',
        };
      case 'blue':
        return {
          bg: 'bg-blue-600',
          border: 'border-blue-500',
          gradient: 'from-blue-500 to-blue-800',
          lightBg: 'bg-blue-500/20',
          text: 'text-blue-400',
        };
    }
  };

  // Build the list of all 72 cross track cells
  const crossCells: { r: number; c: number }[] = [];
  // Top arm: r=0..5, c=6,7,8
  for (let r = 0; r < 6; r++) {
    for (let c = 6; c <= 8; c++) crossCells.push({ r, c });
  }
  // Bottom arm: r=9..14, c=6,7,8
  for (let r = 9; r < 15; r++) {
    for (let c = 6; c <= 8; c++) crossCells.push({ r, c });
  }
  // Left arm: r=6,7,8, c=0..5
  for (let r = 6; r <= 8; r++) {
    for (let c = 0; c < 6; c++) crossCells.push({ r, c });
  }
  // Right arm: r=6,7,8, c=9..14
  for (let r = 6; r <= 8; r++) {
    for (let c = 9; c < 15; c++) crossCells.push({ r, c });
  }

  // Helper to render Yard component with Vivid, Clear African Animal Artwork
  const renderYard = (color: PlayerColor, gridColumn: string, gridRow: string) => {
    const colClasses = getColorClasses(color);
    const targetPlayer = players.find((p) => p.color === color);
    const isThisPlayerTurn = activePlayer && activePlayer.color === color;
    const isHomeLocked = Boolean(rules?.mustKillToEnterHome && targetPlayer && !targetPlayer.hasKilled);
    const emblem = LUDO_EMBLEMS[color];

    return (
      <div
        style={{ gridColumn, gridRow }}
        className={`p-1 flex flex-col items-center justify-between ${colClasses.bg} relative border border-black/50 shadow-inner`}
      >
        <div className="w-full h-full bg-[#16120e] rounded-xl sm:rounded-2xl p-1 sm:p-1.5 flex flex-col items-center justify-between border-2 border-amber-950/80 shadow-2xl relative overflow-hidden group">
          {/* 1. Vivid African Animal Artwork (Full Vibrancy & Sharpness, decorative background) */}
          <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
            <img
              src={emblem.image}
              alt={emblem.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover filter brightness-105 contrast-110"
            />
            {/* Subtle corner shading to keep tokens and text legible without dimming the animal face */}
            <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
          </div>

          {/* 2. Top Name Banner */}
          <div className="w-full flex justify-between items-center px-1.5 py-0.5 relative z-10 bg-black/75 backdrop-blur-sm rounded-lg border border-amber-400/60 shadow-md pointer-events-none">
            <div className="flex items-center gap-1 text-left">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300 drop-shadow flex items-center gap-1">
                <span>{emblem.emoji}</span>
                <span className="truncate max-w-[110px]">{emblem.name}</span>
              </span>
            </div>
            <span className="text-[8px] sm:text-[9px] text-amber-300/80 font-mono px-1 py-0.2 rounded bg-amber-950/60 border border-amber-400/30">
              YARD
            </span>
          </div>

          {/* 3. Four Corner Token Nest Bases (High visibility, prominent tournament pawns) */}
          <div className="w-full h-full relative z-10 p-1 sm:p-2 flex items-center justify-center">
            {[0, 1, 2, 3].map((slotIdx) => {
              const yardToken = targetPlayer?.tokens.find(
                (t) => t.id === slotIdx && t.stepCount < 0
              );
              const isMovable =
                Boolean(yardToken) &&
                isThisPlayerTurn &&
                movableTokens.includes(yardToken!.id) &&
                canSelectToken &&
                !activePlayer.isBot;

              // Position 4 tokens neatly at the 4 corners of the yard
              const posClasses =
                slotIdx === 0
                  ? 'top-1 left-1 sm:top-2 sm:left-2'
                  : slotIdx === 1
                  ? 'top-1 right-1 sm:top-2 sm:right-2'
                  : slotIdx === 2
                  ? 'bottom-1 left-1 sm:bottom-2 sm:left-2'
                  : 'bottom-1 right-1 sm:bottom-2 sm:right-2';

              return (
                <div
                  key={`${color}-slot-${slotIdx}`}
                  className={`absolute ${posClasses} w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center pointer-events-auto`}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (yardToken && isMovable) {
                        onSelectToken(yardToken.id);
                      }
                    }}
                    className={`w-full h-full rounded-full flex items-center justify-center transition-all ${
                      yardToken
                        ? 'p-0.5 bg-[#fff8eb] border-2 border-amber-300 shadow-[0_3px_10px_rgba(0,0,0,0.85)]'
                        : 'border-2 border-dashed border-amber-400/40 bg-black/60 shadow-inner'
                    } ${
                      isMovable
                        ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-black bg-amber-300 shadow-[0_0_20px_rgba(251,191,36,1)] cursor-pointer z-30 scale-110 animate-bounce'
                        : yardToken
                        ? 'cursor-pointer hover:scale-105'
                        : 'cursor-default'
                    }`}
                    aria-label={`${color} seed ${slotIdx + 1}`}
                    title={
                      isMovable
                        ? `Tap to deploy ${color} seed #${slotIdx + 1} onto start!`
                        : yardToken
                        ? `${color} seed #${slotIdx + 1} (Roll 6 to deploy)`
                        : `Seed #${slotIdx + 1} deployed on board`
                    }
                  >
                    {yardToken ? (
                      <div
                        className={`w-full h-full rounded-full bg-gradient-to-br ${colClasses.gradient} border-[1.5px] border-white shadow-md flex items-center justify-center relative overflow-hidden`}
                      >
                        {/* Upper gloss reflection */}
                        <div className="absolute inset-x-1 top-0.5 h-2 bg-white/45 rounded-full pointer-events-none" />
                        <span className="text-xs sm:text-sm font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,1)]">
                          {slotIdx + 1}
                        </span>
                        {isMovable && (
                          <span className="absolute -bottom-1 inset-x-0 mx-auto w-fit bg-amber-400 text-black text-[7px] font-black uppercase px-1 rounded-full shadow leading-tight">
                            GO!
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[9px] sm:text-[10px] font-bold text-amber-200/50">
                        #{slotIdx + 1}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* 4. Bottom Realm & Home Lock Status */}
          <div className="w-full flex justify-between items-center px-1.5 py-0.5 text-[9px] font-mono relative z-10 bg-black/75 backdrop-blur-sm rounded-lg border border-neutral-800 shadow">
            <span className="text-amber-200/90 font-semibold">{emblem.realm}</span>
            {isHomeLocked ? (
              <span className="text-red-400 font-bold flex items-center gap-0.5" title="Must chop 1 opponent to enter home!">
                <Lock className="w-2.5 h-2.5" /> LOCKED
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-0.5" title="Home corridor unlocked!">
                <Unlock className="w-2.5 h-2.5" /> OPEN
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex items-center justify-center select-none w-full h-full touch-manipulation">
      {/* Board Outer Container - Explicit matching width and height eliminate aspect-ratio oscillation */}
      <div
        style={{
          width: 'min(92vw, calc(100vh - 210px), 480px)',
          height: 'min(92vw, calc(100vh - 210px), 480px)',
        }}
        className="relative p-1.5 sm:p-2 bg-[#1c140d] rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-amber-950/80 shrink-0 flex items-center justify-center"
      >
        {/* Strict 15x15 CSS Grid */}
        <div
          className="w-full h-full border border-amber-950/70 rounded-xl sm:rounded-2xl overflow-hidden bg-[#241c14]"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(15, minmax(0, 1fr))',
            gridTemplateRows: 'repeat(15, minmax(0, 1fr))',
          }}
        >
          {/* 1. Red Yard (Top Left: cols 1..6, rows 1..6) */}
          {renderYard('red', '1 / 7', '1 / 7')}

          {/* 2. Green Yard (Top Right: cols 10..15, rows 1..6) */}
          {renderYard('green', '10 / 16', '1 / 7')}

          {/* 3. Blue Yard (Bottom Left: cols 1..6, rows 10..15) */}
          {renderYard('blue', '1 / 7', '10 / 16')}

          {/* 4. Yellow Yard (Bottom Right: cols 10..15, rows 10..15) */}
          {renderYard('yellow', '10 / 16', '10 / 16')}

          {/* 5. Center Home Triangle (cols 7..9, rows 7..9) with Royal Victory Crest Picture */}
          <div
            style={{ gridColumn: '7 / 10', gridRow: '7 / 10' }}
            className="relative bg-[#16120e] border border-amber-950/80 flex items-center justify-center overflow-hidden pointer-events-none select-none"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
              {/* Red Triangle (Left) */}
              <polygon points="0,0 50,50 0,100" fill="#dc2626" opacity="0.95" />
              {/* Green Triangle (Top) */}
              <polygon points="0,0 50,50 100,0" fill="#059669" opacity="0.95" />
              {/* Yellow Triangle (Right) */}
              <polygon points="100,0 50,50 100,100" fill="#d97706" opacity="0.95" />
              {/* Blue Triangle (Bottom) */}
              <polygon points="0,100 50,50 100,100" fill="#2563eb" opacity="0.95" />
            </svg>
            <div className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#121212] border-2 border-amber-300 flex items-center justify-center shadow-xl overflow-hidden">
              <img
                src={LUDO_CENTER_CREST.image}
                alt={LUDO_CENTER_CREST.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* 6. All 72 Track and Home Corridor Cells */}
          {crossCells.map(({ r, c }) => {
            const tile = getCrossTileInfo(r, c);

            let tileBg = 'bg-[#2b221a]';
            let isCorridor = false;
            let isStarTile = tile.type === 'star';
            let isStartTile = tile.type === 'start';
            let isCorridorEntrance = false;
            let corridorOwnerLocked = false;

            if (tile.type === 'home_corridor') {
              isCorridor = true;
              const col = getColorClasses(tile.color!);
              tileBg = col.bg;

              // Check if entrance tile (index 0)
              if (tile.index === 0) {
                isCorridorEntrance = true;
                const owner = players.find((p) => p.color === tile.color);
                if (rules?.mustKillToEnterHome && owner && !owner.hasKilled) {
                  corridorOwnerLocked = true;
                }
              }
            } else if (tile.type === 'start') {
              const col = getColorClasses(tile.color!);
              tileBg = col.bg;
            }

            const coordKey = `${r},${c}`;
            const tokensHere = tokensByCoord[coordKey] || [];

            // Detect African Blockade (2+ tokens of same color on same square)
            const isBlockade =
              rules?.blockadesEnabled &&
              tokensHere.length >= 2 &&
              tokensHere.every((t) => t.token.color === tokensHere[0].token.color);

            return (
              <div
                key={`${r}-${c}`}
                style={{
                  gridColumn: `${c + 1} / ${c + 2}`,
                  gridRow: `${r + 1} / ${r + 2}`,
                }}
                className={`relative flex items-center justify-center border-[0.5px] border-amber-950/40 ${tileBg} ${
                  isCorridor ? 'shadow-inner' : ''
                }`}
              >
                {/* Safe Star Icon */}
                {isStarTile && (
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400 drop-shadow pointer-events-none" />
                )}

                {/* Start GO Marker */}
                {isStartTile && (
                  <span className="text-[8px] sm:text-[9px] font-black text-white/95 uppercase tracking-tighter pointer-events-none">
                    GO
                  </span>
                )}

                {/* African Home Lock Status Icon on Corridor Entrance */}
                {isCorridorEntrance && tokensHere.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80">
                    {corridorOwnerLocked ? (
                      <span className="text-[10px]" title="🔒 Home is LOCKED! Must chop an opponent to enter!">
                        🔒
                      </span>
                    ) : (
                      <span className="text-[9px] text-amber-200 font-bold" title="🔓 Home is OPEN!">
                        🔓
                      </span>
                    )}
                  </div>
                )}

                {/* African Blockade Badge Indicator */}
                {isBlockade && (
                  <div
                    className="absolute -top-1 -right-1 z-30 bg-amber-400 text-black text-[7px] sm:text-[8px] font-black px-1 rounded-full shadow-md border border-amber-200 leading-none py-0.5 flex items-center gap-0.5 pointer-events-none"
                    title="🛡️ African Stool / Blockade: Impassable to opponents!"
                  >
                    <Shield className="w-2.5 h-2.5 fill-black" />
                  </div>
                )}

                {/* Tokens Present on this Cell */}
                {tokensHere.length > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    {tokensHere.map(({ player, token }, idx) => {
                      const col = getColorClasses(token.color);
                      const emblem = LUDO_EMBLEMS[token.color];
                      const isMovable =
                        activePlayer &&
                        activePlayer.color === token.color &&
                        movableTokens.includes(token.id) &&
                        canSelectToken &&
                        !activePlayer.isBot;

                      return (
                        <button
                          key={`${token.color}-token-${token.id}`}
                          type="button"
                          onClick={() => isMovable && onSelectToken(token.id)}
                          disabled={!isMovable}
                          className={`w-[82%] h-[82%] rounded-full bg-gradient-to-br ${col.gradient} border-[1.5px] border-white/95 flex items-center justify-center shadow-lg transition-transform relative overflow-hidden ${
                            tokensHere.length > 1
                              ? `absolute ${idx === 0 ? '-translate-x-1' : 'translate-x-1'}`
                              : ''
                          } ${
                            isMovable
                              ? 'ring-4 ring-amber-400 ring-offset-1 ring-offset-black shadow-[0_0_10px_rgba(251,191,36,0.9)] scale-110 cursor-pointer z-20'
                              : 'cursor-default'
                          }`}
                          aria-label={`${token.color} token ${token.id + 1}`}
                        >
                          {/* High-visibility tournament token disc */}
                          <span className="text-[10px] sm:text-[11px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                            {tokensHere.length > 1 && idx === tokensHere.length - 1
                              ? `x${tokensHere.length}`
                              : token.id + 1}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
