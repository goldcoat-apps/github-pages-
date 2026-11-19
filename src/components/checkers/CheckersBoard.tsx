import React from 'react';
import { Move, Piece, Position, Team } from '../../types/checkers';
import { isDarkSquare } from '../../utils/checkersEngine';
import { Crown } from 'lucide-react';

interface CheckersBoardProps {
  board: (Piece | null)[][];
  size?: number; // 8
  selectedPiece: Position | null;
  validMoves: Move[];
  turn: Team;
  isAiMoving: boolean;
  lastMove?: { from: Position; to: Position } | null;
  movablePieces?: string[];
  capturableEnemyPositions?: string[]; // enemy pieces currently vulnerable
  onSelectPiece: (pos: Position) => void;
  onExecuteMove: (move: Move) => void;
  onTargetEnemyPiece: (pos: Position) => void;
  onDeselectPiece?: () => void;
}

export const CheckersBoard: React.FC<CheckersBoardProps> = ({
  board,
  size = 8,
  selectedPiece,
  validMoves,
  turn,
  isAiMoving,
  lastMove,
  movablePieces = [],
  capturableEnemyPositions = [],
  onSelectPiece,
  onExecuteMove,
  onTargetEnemyPiece,
  onDeselectPiece,
}) => {
  const letters = React.useMemo(
    () => Array.from({ length: size }, (_, i) => String.fromCharCode(65 + i)),
    [size]
  );

  const maxCapturesAvailable = React.useMemo(() => {
    if (validMoves.length === 0) return 0;
    return Math.max(...validMoves.map(m => m.captures.length));
  }, [validMoves]);

  const isSquareSelected = (r: number, c: number) =>
    selectedPiece !== null && selectedPiece.row === r && selectedPiece.col === c;

  // Destination matching: matches exact landing destination, or intermediate waypoint along multi-jump path
  const getMoveForDestination = (r: number, c: number): Move | undefined => {
    const exact = validMoves.find(m => m.to.row === r && m.to.col === c);
    if (exact) return exact;
    return validMoves.find(m => m.path.some(p => p.row === r && p.col === c));
  };

  // Check if square contains an enemy piece being captured by moves of selected piece
  const getMovesForCapturedEnemy = (r: number, c: number): Move[] =>
    validMoves.filter(m => m.captures.some(cap => cap.row === r && cap.col === c));

  const isLastMoveSquare = (r: number, c: number) =>
    lastMove &&
    ((lastMove.from.row === r && lastMove.from.col === c) ||
      (lastMove.to.row === r && lastMove.to.col === c));

  const isKingSelected =
    selectedPiece !== null && board[selectedPiece.row][selectedPiece.col]?.isKing;

  const handleSquareClick = (r: number, c: number) => {
    if (isAiMoving) return;

    // 1. Check if clicking an exact move landing destination
    const move = getMoveForDestination(r, c);
    if (move) {
      onExecuteMove(move);
      return;
    }

    // 2. Check if clicking an ENEMY piece (either directly without selection, or targeting it)
    const piece = board[r][c];
    if (piece && piece.team !== turn) {
      onTargetEnemyPiece({ row: r, col: c });
      return;
    }

    // 3. Check if clicking on the currently selected piece -> toggle deselect
    if (isSquareSelected(r, c)) {
      if (onDeselectPiece) onDeselectPiece();
      return;
    }

    // 4. Check if clicking a friendly piece
    if (piece && piece.team === turn) {
      onSelectPiece({ row: r, col: c });
      return;
    }

    // 5. Clicking an empty non-move square deselects
    if (selectedPiece && onDeselectPiece) {
      onDeselectPiece();
    }
  };

  const coordTrack = size === 10 ? '12px' : '16px';
  const coordFontSize = size === 10 ? 'text-[8px] sm:text-[9px]' : 'text-[9px] sm:text-[10px]';

  return (
    <div className="relative flex items-center justify-center select-none w-full h-full touch-manipulation">
      {/* Board Outer Wooden Bezel - Explicit matching width and height completely eliminate browser aspect-ratio oscillation */}
      <div
        style={{
          width: 'min(92vw, calc(100vh - 210px), 500px)',
          height: 'min(92vw, calc(100vh - 210px), 500px)',
        }}
        className="relative p-1 sm:p-1.5 md:p-2 bg-[#1b1714] rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-amber-950/70 shrink-0 flex items-center justify-center"
      >
        {/* Unified (size+2)x(size+2) CSS Grid */}
        <div
          className="w-full h-full rounded-xl sm:rounded-2xl overflow-hidden border border-amber-900/50 bg-[#24170d]"
          style={{
            display: 'grid',
            gridTemplateColumns: `${coordTrack} repeat(${size}, minmax(0, 1fr)) ${coordTrack}`,
            gridTemplateRows: `${coordTrack} repeat(${size}, minmax(0, 1fr)) ${coordTrack}`,
          }}
        >
          {/* Top Letters */}
          {letters.map((letter, idx) => (
            <div
              key={`top-${letter}`}
              style={{
                gridColumn: `${idx + 2} / ${idx + 3}`,
                gridRow: '1 / 2',
              }}
              className={`flex items-center justify-center ${coordFontSize} font-mono font-bold text-amber-200/60 leading-none select-none pointer-events-none`}
            >
              {letter}
            </div>
          ))}

          {/* Left Ranks */}
          {Array.from({ length: size }, (_, i) => size - i).map((rank, idx) => (
            <div
              key={`left-${rank}`}
              style={{
                gridColumn: '1 / 2',
                gridRow: `${idx + 2} / ${idx + 3}`,
              }}
              className={`flex items-center justify-center ${coordFontSize} font-mono font-bold text-amber-200/60 leading-none select-none pointer-events-none`}
            >
              {rank}
            </div>
          ))}

          {/* Right Ranks */}
          {Array.from({ length: size }, (_, i) => size - i).map((rank, idx) => (
            <div
              key={`right-${rank}`}
              style={{
                gridColumn: `${size + 2} / ${size + 3}`,
                gridRow: `${idx + 2} / ${idx + 3}`,
              }}
              className={`flex items-center justify-center ${coordFontSize} font-mono font-bold text-amber-200/60 leading-none select-none pointer-events-none`}
            >
              {rank}
            </div>
          ))}

          {/* Bottom Letters */}
          {letters.map((letter, idx) => (
            <div
              key={`bottom-${letter}`}
              style={{
                gridColumn: `${idx + 2} / ${idx + 3}`,
                gridRow: `${size + 2} / ${size + 3}`,
              }}
              className={`flex items-center justify-center ${coordFontSize} font-mono font-bold text-amber-200/60 leading-none select-none pointer-events-none`}
            >
              {letter}
            </div>
          ))}

          {/* Board Squares */}
          {board.map((row, r) =>
            row.map((piece, c) => {
              const dark = isDarkSquare(r, c);
              const selected = isSquareSelected(r, c);
              const moveTarget = getMoveForDestination(r, c);
              const isCaptureTarget = moveTarget && moveTarget.captures.length > 0;
              const isRecent = isLastMoveSquare(r, c);
              const isCurrentTurnPiece = piece && piece.team === turn;
              const isPieceMovable = isCurrentTurnPiece && movablePieces.includes(`${r},${c}`);
              const isEnemyVulnerable =
                piece && piece.team !== turn && capturableEnemyPositions.includes(`${r},${c}`);
              const isSelectedPieceEnemyCaptureTarget =
                selectedPiece && getMovesForCapturedEnemy(r, c).length > 0;

              return (
                <button
                  key={`chk-sq-${r}-${c}`}
                  type="button"
                  onClick={() => handleSquareClick(r, c)}
                  style={{
                    gridColumn: `${c + 2} / ${c + 3}`,
                    gridRow: `${r + 2} / ${r + 3}`,
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                  }}
                  className={`relative w-full h-full flex items-center justify-center cursor-pointer outline-none select-none ${
                    dark
                      ? isRecent
                        ? 'bg-[#4e3625]'
                        : 'bg-[#3b2414]'
                      : 'bg-[#ddbe99]'
                  }`}
                  aria-label={`Square ${letters[c]}${size - r}`}
                >
                  {/* Selected Square Highlight Ring */}
                  {selected && (
                    <div className="absolute inset-0.5 rounded-full border-2 border-amber-400 bg-amber-400/30 pointer-events-none z-20 shadow-md" />
                  )}

                  {/* Valid Move Landing Indicator */}
                  {moveTarget && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      {isCaptureTarget ? (
                        isKingSelected ? (
                          <div
                            className={`${
                              size === 10 ? 'w-5 h-5 sm:w-6 sm:h-6 text-[10px]' : 'w-6 h-6 sm:w-7 sm:h-7 text-[12px]'
                            } rounded-full border-2 border-amber-400 bg-amber-500/80 flex items-center justify-center shadow-lg shadow-amber-950/80 font-bold text-amber-100 ring-2 ring-amber-400/80`}
                            title="👑 Flying King Jump"
                          >
                            👑
                          </div>
                        ) : (
                          <div
                            className={`${
                              size === 10 ? 'w-5 h-5 sm:w-6 sm:h-6 text-[10px]' : 'w-6 h-6 sm:w-7 sm:h-7 text-[11px]'
                            } rounded-full border-2 border-red-500 bg-red-500/80 flex items-center justify-center shadow-lg shadow-red-950/70 text-white font-bold`}
                            title="🎯 Pawn Jump"
                          >
                            🎯
                          </div>
                        )
                      ) : (
                        <div
                          className={`${
                            size === 10 ? 'w-3 h-3 sm:w-4 sm:h-4' : 'w-4 h-4 sm:w-5 sm:h-5'
                          } rounded-full bg-emerald-400 border border-emerald-200 shadow-md ring-2 ring-emerald-300/40`}
                        />
                      )}
                    </div>
                  )}

                  {/* Direct Enemy Capture Indicator */}
                  {(isEnemyVulnerable || isSelectedPieceEnemyCaptureTarget) && piece && (
                    <div className="absolute inset-0.5 rounded-full border-2 border-red-500 ring-2 ring-red-500/50 pointer-events-none z-20 flex items-start justify-end p-0.5">
                      <span className="bg-red-600 text-[7px] sm:text-[9px] text-white font-black px-1 rounded-full shadow-md leading-none py-0.5">
                        ⚔️
                      </span>
                    </div>
                  )}

                  {/* Piece Display - Prominent, chunky tournament token filling the square */}
                  {piece && (
                    <div
                      className={`relative rounded-full flex items-center justify-center ${
                        size === 10 ? 'w-[94%] h-[94%]' : 'w-[90%] h-[90%]'
                      } ${
                        piece.team === 'R'
                          ? 'bg-gradient-to-b from-red-500 via-red-600 to-red-950 border-[1.5px] sm:border-2 border-red-300/90 shadow-[0_2px_5px_rgba(0,0,0,0.7)] text-red-100'
                          : 'bg-gradient-to-b from-neutral-50 via-neutral-200 to-neutral-400 border-[1.5px] sm:border-2 border-white/95 shadow-[0_2px_5px_rgba(0,0,0,0.7)] text-neutral-900'
                      } ${
                        isPieceMovable && !isAiMoving && !selected
                          ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-[#3b2414] shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                          : ''
                      }`}
                    >
                      {/* Concentric Draughts Ridge Rim */}
                      <div
                        className={`w-[84%] h-[84%] rounded-full border flex items-center justify-center shadow-inner ${
                          piece.team === 'R'
                            ? 'border-red-400/40 bg-gradient-to-b from-red-600/90 to-red-800/90'
                            : 'border-neutral-300/80 bg-gradient-to-b from-neutral-100 to-neutral-200/90'
                        }`}
                      >
                        {piece.isKing ? (
                          <div className="relative flex items-center justify-center">
                            <Crown
                              className={`${
                                size === 10 ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-5 h-5 sm:w-6 sm:h-6'
                              } ${
                                piece.team === 'R'
                                  ? 'text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
                                  : 'text-amber-600 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]'
                              }`}
                            />
                          </div>
                        ) : (
                          /* Pawn Embossed Center Ridge & Pip */
                          <div
                            className={`w-[56%] h-[56%] rounded-full border flex items-center justify-center shadow-sm ${
                              piece.team === 'R'
                                ? 'border-red-400/50 bg-red-700/80'
                                : 'border-neutral-300 bg-neutral-100'
                            }`}
                          >
                            <div
                              className={`rounded-full shadow-inner ${
                                size === 10 ? 'w-1.5 h-1.5 sm:w-2 sm:h-2' : 'w-2 h-2 sm:w-2.5 sm:h-2.5'
                              } ${
                                piece.team === 'R' ? 'bg-red-400/80' : 'bg-neutral-400'
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
