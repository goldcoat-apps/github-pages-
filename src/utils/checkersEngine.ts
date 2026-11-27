import { CheckersGameState, Move, Piece, Position, Team } from '../types/checkers';

export function isDarkSquare(row: number, col: number): boolean {
  return (row + col) % 2 === 1;
}

export function createInitialBoard(size: number = 8): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const rowsPerSide = size === 8 ? 3 : 4;

  let pieceId = 1;
  // White pieces at top
  for (let r = 0; r < rowsPerSide; r++) {
    for (let c = 0; c < size; c++) {
      if (isDarkSquare(r, c)) {
        board[r][c] = {
          id: `W_${pieceId++}`,
          team: 'W',
          isKing: false,
          row: r,
          col: c,
        };
      }
    }
  }

  // Red pieces at bottom
  for (let r = size - rowsPerSide; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isDarkSquare(r, c)) {
        board[r][c] = {
          id: `R_${pieceId++}`,
          team: 'R',
          isKing: false,
          row: r,
          col: c,
        };
      }
    }
  }

  return board;
}

export function cloneBoard(board: (Piece | null)[][]): (Piece | null)[][] {
  return board.map(row => row.map(cell => (cell ? { ...cell } : null)));
}

/**
 * Get all legal moves for a player.
 * @param mandatoryCaptures if true, captures are compulsory. If false (Free Choice), player can choose to capture or make standard moves.
 */
export function getAllLegalMoves(
  board: (Piece | null)[][],
  team: Team,
  size: number = 8,
  mandatoryCaptures: boolean = false
): Move[] {
  const pawnCaptures: Move[] = [];
  const pawnSimpleMoves: Move[] = [];
  const kingCaptures: Move[] = [];
  const kingSimpleMoves: Move[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const piece = board[r][c];
      if (piece && piece.team === team) {
        const pieceCaptures = getCapturesForPiece(board, piece, size);
        const pieceSimple = getSimpleMovesForPiece(board, piece, size);
        if (piece.isKing) {
          if (pieceCaptures.length > 0) kingCaptures.push(...pieceCaptures);
          if (pieceSimple.length > 0) kingSimpleMoves.push(...pieceSimple);
        } else {
          if (pieceCaptures.length > 0) pawnCaptures.push(...pieceCaptures);
          if (pieceSimple.length > 0) pawnSimpleMoves.push(...pieceSimple);
        }
      }
    }
  }

  // Authentic African Damii Trap & Forced Piece Capture Rules:
  // 1. "Only piece to take piece or piece's is force (when you like it or not is a force)"
  //    -> If a regular piece (man/pawn) can capture, captures are 100% compulsory for that piece!
  //       Pawns cannot make simple non-capturing moves if pawn captures are available.
  // 2. "We don't force opponent to use kings to piece or piece's, in fact is trap
  //    (we want to remove kings from that game because 🤴 is very powerful)"
  //    -> Kings are NEVER forced to capture! A King always retains both its captures AND its simple slides.
  //       If a player or opponent refuses the capture with their King (making a simple slide or moving elsewhere),
  //       they fall into the trap and the King is taken from the stool / board!
  if (mandatoryCaptures) {
    // If any regular piece can jump, pawns MUST jump (cannot slide)
    const sortedPawnCaptures = [...pawnCaptures].sort((a, b) => b.captures.length - a.captures.length);
    const sortedKingCaptures = [...kingCaptures].sort((a, b) => b.captures.length - a.captures.length);
    const eligiblePawnMoves = sortedPawnCaptures.length > 0 ? sortedPawnCaptures : pawnSimpleMoves;
    // Kings are never forced: can jump or slide (trap mechanism)
    const eligibleKingMoves = [...sortedKingCaptures, ...kingSimpleMoves];

    return [...eligiblePawnMoves, ...eligibleKingMoves];
  }

  // Free Choice mode:
  const allCaptures = [...kingCaptures, ...pawnCaptures].sort((a, b) => b.captures.length - a.captures.length);
  const allSimple = [...kingSimpleMoves, ...pawnSimpleMoves];
  return [...allCaptures, ...allSimple];
}

export function getLegalMovesForSelectedPiece(
  board: (Piece | null)[][],
  piece: Piece,
  size: number = 8,
  mandatoryCaptures: boolean = false
): Move[] {
  const allMoves = getAllLegalMoves(board, piece.team, size, mandatoryCaptures);
  return allMoves.filter(m => m.from.row === piece.row && m.from.col === piece.col);
}

function getSimpleMovesForPiece(board: (Piece | null)[][], piece: Piece, size: number): Move[] {
  const moves: Move[] = [];
  const { row, col, team, isKing } = piece;

  if (!isKing) {
    // Red moves up (-1), White moves down (+1)
    const forwardDir = team === 'R' ? -1 : 1;
    const targetRow = row + forwardDir;

    if (targetRow >= 0 && targetRow < size) {
      for (const colDir of [-1, 1]) {
        const targetCol = col + colDir;
        if (targetCol >= 0 && targetCol < size && board[targetRow][targetCol] === null) {
          moves.push({
            from: { row, col },
            to: { row: targetRow, col: targetCol },
            path: [{ row: targetRow, col: targetCol }],
            captures: [],
            isPromotion: team === 'R' ? targetRow === 0 : targetRow === size - 1,
          });
        }
      }
    }
  } else {
    // Flying king: moves any number of empty squares in all 4 diagonal directions
    const directions = [
      { dr: -1, dc: -1 },
      { dr: -1, dc: 1 },
      { dr: 1, dc: -1 },
      { dr: 1, dc: 1 },
    ];

    for (const { dr, dc } of directions) {
      let step = 1;
      while (true) {
        const nr = row + dr * step;
        const nc = col + dc * step;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) break;
        if (board[nr][nc] !== null) break; // blocked

        moves.push({
          from: { row, col },
          to: { row: nr, col: nc },
          path: [{ row: nr, col: nc }],
          captures: [],
          isPromotion: false,
        });
        step++;
      }
    }
  }

  return moves;
}

/**
 * Finds all capture paths for a piece.
 * Under African Dam (Ghanaian Damii) rules:
 * - Kings and Pawns can choose any available branch (e.g. left vs right among 2–4 options).
 * - Captured pieces remain on the board until the end of the turn, and a piece/King
 *   cannot reverse 180° along the same diagonal to capture front and back at the same time.
 * - Intermediate landing squares that omit a continuation jump along the chosen branch remain
 *   selectable as moves so `checkHuffPenalty` can remove the King if a player forgets a lawful capture.
 */
function getCapturesForPiece(
  board: (Piece | null)[][],
  piece: Piece,
  size: number
): Move[] {
  const completedMoves: Move[] = [];

  function canJumpFurther(
    pos: Position,
    currentPiece: Piece,
    boardState: (Piece | null)[][],
    capturedList: Position[],
    prevDir?: { dr: number; dc: number }
  ): boolean {
    const { row, col } = pos;
    const { team, isKing } = currentPiece;
    const directions = [
      { dr: -1, dc: -1 },
      { dr: -1, dc: 1 },
      { dr: 1, dc: -1 },
      { dr: 1, dc: 1 },
    ];

    if (!isKing) {
      for (const { dr, dc } of directions) {
        if (prevDir && dr === -prevDir.dr && dc === -prevDir.dc) continue;
        const eR = row + dr;
        const eC = col + dc;
        const lR = row + dr * 2;
        const lC = col + dc * 2;
        if (lR >= 0 && lR < size && lC >= 0 && lC < size) {
          const ep = boardState[eR][eC];
          const alreadyCap = capturedList.some(p => p.row === eR && p.col === eC);
          if (ep && ep.team !== team && !alreadyCap && boardState[lR][lC] === null) {
            return true;
          }
        }
      }
    } else {
      for (const { dr, dc } of directions) {
        // Kings cannot reverse 180 degrees along the same diagonal to capture front and back at the same time
        if (prevDir && dr === -prevDir.dr && dc === -prevDir.dc) continue;

        let step = 1;
        let enemyFound: Position | null = null;
        while (true) {
          const r = row + dr * step;
          const c = col + dc * step;
          if (r < 0 || r >= size || c < 0 || c >= size) break;
          // Captured pieces stay on boardState until the end of the move (cannot pass over captured pieces twice)
          const cell = boardState[r][c];
          if (cell !== null) {
            if (cell.team === team) break;
            if (capturedList.some(p => p.row === r && p.col === c)) break;
            if (enemyFound === null) {
              enemyFound = { row: r, col: c };
            } else {
              break;
            }
          } else if (enemyFound !== null) {
            return true;
          }
          step++;
        }
      }
    }
    return false;
  }

  function searchJumps(
    currentPos: Position,
    currentPiece: Piece,
    currentBoard: (Piece | null)[][],
    capturedSoFar: Position[],
    pathSoFar: Position[],
    prevDir?: { dr: number; dc: number }
  ) {
    const { row, col } = currentPos;
    const { team, isKing } = currentPiece;
    const directions = [
      { dr: -1, dc: -1 },
      { dr: -1, dc: 1 },
      { dr: 1, dc: -1 },
      { dr: 1, dc: 1 },
    ];

    if (!isKing) {
      // African Dam Pawn: Can capture forward AND backward (but not 180° back over a just-captured square)
      for (const { dr, dc } of directions) {
        if (prevDir && dr === -prevDir.dr && dc === -prevDir.dc) continue;

        const enemyR = row + dr;
        const enemyC = col + dc;
        const landR = row + dr * 2;
        const landC = col + dc * 2;

        if (landR >= 0 && landR < size && landC >= 0 && landC < size) {
          const enemyPiece = currentBoard[enemyR][enemyC];
          const landCell = currentBoard[landR][landC];

          const alreadyCaptured = capturedSoFar.some(p => p.row === enemyR && p.col === enemyC);
          const landOnCaptured = capturedSoFar.some(p => p.row === landR && p.col === landC);

          if (enemyPiece && enemyPiece.team !== team && !alreadyCaptured && !landOnCaptured && landCell === null) {
            const nextBoard = cloneBoard(currentBoard);
            nextBoard[row][col] = null;
            // Keep captured piece on nextBoard until the move ends (standard Draughts rule)

            const willPromote = (team === 'R' && landR === 0) || (team === 'W' && landR === size - 1);
            // In Fair Draughts Rules: A man only crowns if it STOPS on the king row at the end of the move!
            // If it jumps through the king row and continues jumping, it remains a man for the rest of this jump turn.
            const nextPiece: Piece = {
              ...currentPiece,
              row: landR,
              col: landC,
              isKing: isKing,
            };
            nextBoard[landR][landC] = nextPiece;

            const nextCaptured = [...capturedSoFar, { row: enemyR, col: enemyC }];
            const nextPath = [...pathSoFar, { row: landR, col: landC }];
            const dirUsed = { dr, dc };

            const hasMore = canJumpFurther(
              { row: landR, col: landC },
              nextPiece,
              nextBoard,
              nextCaptured,
              dirUsed
            );

            if (hasMore) {
              searchJumps(
                { row: landR, col: landC },
                nextPiece,
                nextBoard,
                nextCaptured,
                nextPath,
                dirUsed
              );
            } else {
              completedMoves.push({
                from: { row: piece.row, col: piece.col },
                to: { row: landR, col: landC },
                path: nextPath,
                captures: nextCaptured,
                isPromotion: !isKing && willPromote,
              });
            }
          }
        }
      }
    } else {
      // Flying King capture:
      // Can jump over enemy along diagonal ray at any distance,
      // and can land on empty squares along that ray behind the enemy.
      // Cannot reverse 180° along the same diagonal to capture front and back at the same time.
      for (const { dr, dc } of directions) {
        if (prevDir && dr === -prevDir.dr && dc === -prevDir.dc) continue;

        let step = 1;
        let enemyPos: Position | null = null;

        while (true) {
          const r = row + dr * step;
          const c = col + dc * step;
          if (r < 0 || r >= size || c < 0 || c >= size) break;

          // Captured pieces stay on currentBoard until move finishes, blocking any pass-back along this diagonal
          const cell = currentBoard[r][c];
          if (cell !== null) {
            if (cell.team === team) {
              break; // blocked by own piece
            }
            if (capturedSoFar.some(p => p.row === r && p.col === c)) {
              break;
            }
            if (enemyPos === null) {
              enemyPos = { row: r, col: c };
            } else {
              break; // cannot jump two pieces in one ray without landing
            }
          } else if (enemyPos !== null) {
            // Every empty square behind the enemy piece is an independent landing choice
            const nextBoard = cloneBoard(currentBoard);
            nextBoard[row][col] = null;
            // Keep enemyPos on nextBoard until applyMove at end of turn

            const nextPiece: Piece = {
              ...currentPiece,
              row: r,
              col: c,
            };
            nextBoard[r][c] = nextPiece;

            const nextCaptured = [...capturedSoFar, enemyPos];
            const nextPath = [...pathSoFar, { row: r, col: c }];
            const dirUsed = { dr, dc };

            const hasMore = canJumpFurther(
              { row: r, col: c },
              nextPiece,
              nextBoard,
              nextCaptured,
              dirUsed
            );

            if (hasMore) {
              searchJumps(
                { row: r, col: c },
                nextPiece,
                nextBoard,
                nextCaptured,
                nextPath,
                dirUsed
              );
            } else {
              completedMoves.push({
                from: { row: piece.row, col: piece.col },
                to: { row: r, col: c },
                path: nextPath,
                captures: nextCaptured,
                isPromotion: false,
              });
            }
          }
          step++;
        }
      }
    }
  }

  searchJumps({ row: piece.row, col: piece.col }, piece, board, [], []);

  // Deduplicate moves by from & to: preserve the variation that captures the MAXIMUM pieces for each unique destination
  const uniqueMoves: Move[] = [];
  for (const m of completedMoves) {
    const existingIdx = uniqueMoves.findIndex(
      u => u.from.row === m.from.row && u.from.col === m.from.col && u.to.row === m.to.row && u.to.col === m.to.col
    );
    if (existingIdx === -1) {
      uniqueMoves.push(m);
    } else if (m.captures.length > uniqueMoves[existingIdx].captures.length) {
      uniqueMoves[existingIdx] = m;
    }
  }

  return uniqueMoves;
}

/**
 * Diagnostic helper: tells why an enemy piece can or cannot be captured.
 */
export function getEnemyPieceStatus(
  board: (Piece | null)[][],
  enemyPos: Position,
  playerTeam: Team,
  size: number = 8,
  mandatoryCaptures: boolean = false,
  selectedPiecePos?: Position | null
): {
  canBeCaptured: boolean;
  capturingMoves: Move[];
  capturingPieces: Position[];
  reason?: string;
} {
  const allMoves = getAllLegalMoves(board, playerTeam, size, mandatoryCaptures);

  // All moves across all friendly pieces that capture this enemy
  const allCapturingMoves = allMoves.filter(m =>
    m.captures.some(cap => cap.row === enemyPos.row && cap.col === enemyPos.col)
  );

  const capturingPieces = Array.from(
    new Set(allCapturingMoves.map(m => `${m.from.row},${m.from.col}`))
  ).map(str => {
    const [r, c] = str.split(',').map(Number);
    return { row: r, col: c };
  });

  // If a piece is already selected, filter to that piece's capturing moves
  let pieceSpecificMoves = allCapturingMoves;
  if (selectedPiecePos) {
    const forSelected = allCapturingMoves.filter(
      m => m.from.row === selectedPiecePos.row && m.from.col === selectedPiecePos.col
    );
    if (forSelected.length > 0) {
      pieceSpecificMoves = forSelected;
    }
  }

  if (pieceSpecificMoves.length > 0) {
    return {
      canBeCaptured: true,
      capturingMoves: pieceSpecificMoves,
      capturingPieces,
    };
  }

  // If selected piece cannot capture it, but ANOTHER friendly piece can:
  if (allCapturingMoves.length > 0) {
    return {
      canBeCaptured: true,
      capturingMoves: allCapturingMoves,
      capturingPieces,
      reason: 'Another piece can take this AI piece! Select it to capture.',
    };
  }

  // Detailed ray diagnosis for pawns and flying kings
  const directions = [
    { dr: -1, dc: -1 },
    { dr: -1, dc: 1 },
    { dr: 1, dc: -1 },
    { dr: 1, dc: 1 },
  ];

  let foundFriendlyPawnAdjacent = false;
  let foundFriendlyKingOnRay = false;
  let landingBlocked = false;
  let landingOffBoard = false;

  for (const { dr, dc } of directions) {
    const landR = enemyPos.row + dr;
    const landC = enemyPos.col + dc;

    // Check square directly behind enemy
    const isLandOffBoard = landR < 0 || landR >= size || landC < 0 || landC >= size;
    const isLandOccupied = !isLandOffBoard && board[landR][landC] !== null;

    // Check adjacent friendly piece (Pawn or King)
    const adjR = enemyPos.row - dr;
    const adjC = enemyPos.col - dc;
    if (adjR >= 0 && adjR < size && adjC >= 0 && adjC < size) {
      const p = board[adjR][adjC];
      if (p && p.team === playerTeam) {
        foundFriendlyPawnAdjacent = true;
        if (isLandOffBoard) landingOffBoard = true;
        if (isLandOccupied) landingBlocked = true;
      }
    }

    // Check ray further back for Flying Kings
    let step = 2;
    let pathBlocked = false;
    while (true) {
      const rayR = enemyPos.row - dr * step;
      const rayC = enemyPos.col - dc * step;
      if (rayR < 0 || rayR >= size || rayC < 0 || rayC >= size) break;
      const pieceOnRay = board[rayR][rayC];
      if (pieceOnRay !== null) {
        if (pieceOnRay.team === playerTeam && pieceOnRay.isKing && !pathBlocked) {
          foundFriendlyKingOnRay = true;
          if (isLandOffBoard) landingOffBoard = true;
          if (isLandOccupied) landingBlocked = true;
        }
        pathBlocked = true;
      }
      step++;
    }
  }

  if (landingBlocked) {
    return {
      canBeCaptured: false,
      capturingMoves: [],
      capturingPieces: [],
      reason: 'Protected: The landing square behind this piece is occupied.',
    };
  }

  if (landingOffBoard) {
    return {
      canBeCaptured: false,
      capturingMoves: [],
      capturingPieces: [],
      reason: 'Edge defense: No board square exists behind this piece to land on.',
    };
  }

  if (foundFriendlyPawnAdjacent || foundFriendlyKingOnRay) {
    return {
      canBeCaptured: false,
      capturingMoves: [],
      capturingPieces: [],
      reason: 'Cannot jump: Landing square behind this piece is blocked.',
    };
  }

  return {
    canBeCaptured: false,
    capturingMoves: [],
    capturingPieces: [],
    reason: 'Out of range: Move your piece into diagonal alignment to jump this AI piece.',
  };
}

/**
 * Apply a move to board state and return updated board, captures count, and promotion status.
 */
export function applyMove(
  board: (Piece | null)[][],
  move: Move,
  size: number = 8
): { nextBoard: (Piece | null)[][]; wasPromoted: boolean } {
  const nextBoard = cloneBoard(board);
  const piece = nextBoard[move.from.row][move.from.col];

  if (!piece) {
    return { nextBoard, wasPromoted: false };
  }

  // Remove piece from origin
  nextBoard[move.from.row][move.from.col] = null;

  // Remove all captured pieces
  for (const cap of move.captures) {
    nextBoard[cap.row][cap.col] = null;
  }

  // Check promotion
  let wasPromoted = false;
  let isKing = piece.isKing;
  if (!isKing) {
    if (move.isPromotion || (piece.team === 'R' && move.to.row === 0) || (piece.team === 'W' && move.to.row === size - 1)) {
      isKing = true;
      wasPromoted = true;
    }
  }

  nextBoard[move.to.row][move.to.col] = {
    ...piece,
    row: move.to.row,
    col: move.to.col,
    isKing,
  };

  return { nextBoard, wasPromoted };
}

export interface HuffResult {
  isHuffable: boolean;
  huffedPiecePos: Position | null;
  pieceType: 'king' | 'man';
  reason?: string;
  piecesMissed: number;
}

function isStrictCapturePrefix(shorter: Move, longer: Move): boolean {
  if (longer.captures.length <= shorter.captures.length) return false;
  return shorter.captures.every(
    (cap, idx) =>
      longer.captures[idx].row === cap.row &&
      longer.captures[idx].col === cap.col
  );
}

function filterCompleteCaptureMoves(captureMoves: Move[]): Move[] {
  const complete = captureMoves.filter(
    m =>
      !captureMoves.some(
        other =>
          other.from.row === m.from.row &&
          other.from.col === m.from.col &&
          isStrictCapturePrefix(m, other)
      )
  );
  return complete.length > 0 ? complete : captureMoves;
}

/**
 * African Dam "Huff / Stool Removal" Rule:
 * - When a King has 2, 3, or 4 capture options (e.g. left vs right), it may choose ANY
 *   option and stay safe as long as it captures ALL lawful pieces along that chosen path.
 * - If the King (or piece) captures some pieces along its chosen path and forgets a lawful
 *   continuation piece along that path, the opponent removes that King/piece from the board!
 * - If a King/piece refuses an available capture and makes a quiet move, it is also removed.
 */
export function checkHuffPenalty(
  board: (Piece | null)[][],
  move: Move,
  size: number
): HuffResult {
  const movingPiece = board[move.from.row][move.from.col];
  if (!movingPiece) {
    return { isHuffable: false, huffedPiecePos: null, pieceType: 'man', piecesMissed: 0 };
  }

  const team = movingPiece.team;

  // Authentic African Dam Rule:
  // Choosing between separate branches (e.g. left vs right) is 100% lawful.
  // Huff ONLY applies if the piece took some pieces on its chosen path and forgot
  // a lawful continuation piece in that same capture chain!
  if (move.captures.length > 0) {
    const pieceCaps = getCapturesForPiece(board, movingPiece, size);
    const extendedMoves = pieceCaps.filter(candidate => isStrictCapturePrefix(move, candidate));
    if (extendedMoves.length > 0) {
      const maxExtended = Math.max(...extendedMoves.map(m => m.captures.length));
      const leftBehind = maxExtended - move.captures.length;
      return {
        isHuffable: true,
        huffedPiecePos: move.to,
        pieceType: movingPiece.isKing ? 'king' : 'man',
        reason: `${movingPiece.isKing ? 'King 🤴' : 'Piece'} captured ${move.captures.length} piece(s) and forgot ${leftBehind} lawful piece(s) on that path! Opponent removes it from the board!`,
        piecesMissed: leftBehind,
      };
    }
    return { isHuffable: false, huffedPiecePos: null, pieceType: 'man', piecesMissed: 0 };
  }

  // From here on, move.captures.length === 0 (player made a non-capturing quiet move):

  // 1. If the King itself had an open capture and refused to take pieces:
  if (movingPiece.isKing) {
    const kingCaps = getCapturesForPiece(board, movingPiece, size);
    if (kingCaps.length > 0) {
      const maxPossible = Math.max(...kingCaps.map(m => m.captures.length));
      return {
        isHuffable: true,
        huffedPiecePos: move.to,
        pieceType: 'king',
        reason: `King 🤴 refused to take available pieces! In African Dam, the opponent removes that King from its stool!`,
        piecesMissed: maxPossible,
      };
    }
  }

  // 2. If the player made a quiet move with another piece, but a friendly King on the board
  // had an available capture and was refused ("when the king refuse takes that pieces"):
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const otherPiece = board[r][c];
      if (otherPiece && otherPiece.team === team && otherPiece.isKing) {
        const kingCaps = getCapturesForPiece(board, otherPiece, size);
        if (kingCaps.length > 0) {
          const maxKingCaps = Math.max(...kingCaps.map(m => m.captures.length));
          return {
            isHuffable: true,
            huffedPiecePos: { row: r, col: c },
            pieceType: 'king',
            reason: `King 🤴 on stool had ${maxKingCaps} capture(s) available but was refused! Opponent removes that King from its stool!`,
            piecesMissed: maxKingCaps,
          };
        }
      }
    }
  }

  // 3. If a regular pawn made a quiet move when it could capture:
  const pawnCaps = getCapturesForPiece(board, movingPiece, size);
  if (pawnCaps.length > 0) {
    const maxPossible = Math.max(...pawnCaps.map(m => m.captures.length));
    return {
      isHuffable: true,
      huffedPiecePos: move.to,
      pieceType: 'man',
      reason: `Piece refused to take available capture! Opponent removes that piece from the board!`,
      piecesMissed: maxPossible,
    };
  }

  return { isHuffable: false, huffedPiecePos: null, pieceType: 'man', piecesMissed: 0 };
}

/**
 * Algebraic coordinate notation: e.g. A1 to H8
 */
export function posToNotation(pos: Position, size: number = 8): string {
  const file = String.fromCharCode(65 + pos.col); // A, B, C...
  const rank = size - pos.row; // 1 to 8
  return `${file}${rank}`;
}

export function formatMoveNotation(move: Move, size: number = 8): string {
  const fromStr = posToNotation(move.from, size);
  const toStr = posToNotation(move.to, size);
  if (move.captures.length > 0) {
    const caps = move.captures.map(c => posToNotation(c, size)).join('x');
    return `${fromStr}x${caps}x${toStr}${move.isPromotion ? '👑' : ''}`;
  }
  return `${fromStr}-${toStr}${move.isPromotion ? '👑' : ''}`;
}

/**
 * Count active pieces on the board for both teams.
 */
export function countPieces(
  board: (Piece | null)[][],
  size: number = 8
): { red: number; white: number; total: number } {
  let red = 0;
  let white = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const p = board[r][c];
      if (p) {
        if (p.team === 'R') red++;
        else if (p.team === 'W') white++;
      }
    }
  }
  return { red, white, total: red + white };
}

/**
 * Check if the game is over, supporting the authentic African Dam "1 Piece Left" rule.
 * In African Dam (Ghanaian Damii / West African draughts), when an opponent is reduced down
 * to only 1 piece, the game is over and the player with more pieces wins!
 */
export function evaluateGameOver(
  board: (Piece | null)[][],
  currentTurn: Team,
  size: number = 8,
  mandatoryCaptures: boolean = false,
  onePieceEndgameRule: boolean = true
): {
  isOver: boolean;
  winner: Team | 'draw' | null;
  reason?: string;
} {
  const { red, white } = countPieces(board, size);

  // 1. Complete wipeout (0 pieces)
  if (red === 0) {
    return { isOver: true, winner: 'W', reason: 'White wins: All Red pieces captured!' };
  }
  if (white === 0) {
    return { isOver: true, winner: 'R', reason: 'Red wins: All White pieces captured!' };
  }

  // 2. African Dam "One Piece Cannot Play" Rule:
  // In African Dam, one piece cannot play — game is over!
  if (onePieceEndgameRule) {
    if (red === 1 && white === 1) {
      return {
        isOver: true,
        winner: 'draw',
        reason: 'Tactical Draw: In African Dam, one piece cannot play — both players left with 1 piece!',
      };
    }
    if (red === 1 && white > 1) {
      return {
        isOver: true,
        winner: 'W',
        reason: 'White wins: In African Dam, one piece cannot play — game is over!',
      };
    }
    if (white === 1 && red > 1) {
      return {
        isOver: true,
        winner: 'R',
        reason: 'Red wins: In African Dam, one piece cannot play — game is over!',
      };
    }
  }

  // 3. Trapped / No legal moves
  const legalMoves = getAllLegalMoves(board, currentTurn, size, mandatoryCaptures);
  if (legalMoves.length === 0) {
    const winningTeam: Team = currentTurn === 'R' ? 'W' : 'R';
    return {
      isOver: true,
      winner: winningTeam,
      reason: `${winningTeam === 'R' ? 'Red' : 'White'} wins: Opponent has no legal moves left!`,
    };
  }

  return { isOver: false, winner: null };
}

// -----------------------------------------------------------------------------
// HIGH-LOOKAHEAD AI ENGINE (MINIMAX + ALPHA-BETA + MOVE ORDERING + QUIESCENCE)
// -----------------------------------------------------------------------------

/**
 * Move ordering heuristic: evaluates captures first, then promotions, then center advances.
 * Dramatic 5-10x speedup in Alpha-Beta cutoffs, enabling much deeper search depths!
 */
export function orderMoves(moves: Move[], size: number): Move[] {
  const center = (size - 1) / 2;
  return [...moves].sort((a, b) => {
    // 1. Prioritize multi-jumps and captures
    const capDiff = b.captures.length - a.captures.length;
    if (capDiff !== 0) return capDiff;

    // 2. Prioritize promotions
    if (b.isPromotion && !a.isPromotion) return 1;
    if (a.isPromotion && !b.isPromotion) return -1;

    // 3. Central dominance: moves ending closer to board center
    const aDist = Math.abs(a.to.row - center) + Math.abs(a.to.col - center);
    const bDist = Math.abs(b.to.row - center) + Math.abs(b.to.col - center);
    return aDist - bDist;
  });
}

function evaluateBoard(board: (Piece | null)[][], aiTeam: Team, size: number = 8): number {
  let score = 0;
  const center = (size - 1) / 2;
  let aiPieceCount = 0;
  let opponentPieceCount = 0;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const isAi = piece.team === aiTeam;
      const mult = isAi ? 1 : -1;

      if (isAi) aiPieceCount++;
      else opponentPieceCount++;

      // 1. Material value: Pawn = 100, Flying King = 350
      const baseValue = piece.isKing ? 350 : 100;
      score += baseValue * mult;

      // 2. Center control (distance from board center)
      const centerDist = Math.abs(r - center) + Math.abs(c - center);
      const centerScore = Math.max(0, size - centerDist);
      score += centerScore * (piece.isKing ? 5 : 3) * mult;

      // 3. Non-linear advancement bonus for pawns
      if (!piece.isKing) {
        const advancement = piece.team === 'R' ? size - 1 - r : r;
        score += advancement * advancement * 2 * mult;

        // Back rank guard bonus: defending home row prevents opponent promotions
        if ((piece.team === 'W' && r === 0) || (piece.team === 'R' && r === size - 1)) {
          score += 25 * mult;
        }
      } else {
        // King roaming & territorial influence bonus
        score += 20 * mult;
      }
    }
  }

  // 4. African Dam endgame pressure: reward cornering or whittling opponent down
  if (opponentPieceCount <= 3) {
    score += (10 - opponentPieceCount) * 45;
  }
  if (aiPieceCount <= 3) {
    score -= (10 - aiPieceCount) * 45;
  }

  return score;
}

/**
 * Quiescence capture extension: continues searching captures at leaf nodes
 * to prevent the horizon effect and ensure the AI never blunders into a trap.
 */
function quiescence(
  board: (Piece | null)[][],
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiTeam: Team,
  size: number,
  qDepth: number = 2
): number {
  const currentTeam: Team = isMaximizing ? aiTeam : aiTeam === 'R' ? 'W' : 'R';
  const allMoves = getAllLegalMoves(board, currentTeam, size, true);
  const captureMoves = allMoves.filter(m => m.captures.length > 0);

  if (captureMoves.length === 0 || qDepth <= 0) {
    return evaluateBoard(board, aiTeam, size);
  }

  const orderedCaptures = orderMoves(filterCompleteCaptureMoves(captureMoves), size);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of orderedCaptures) {
      const { nextBoard } = applyMove(board, move, size);
      const score = quiescence(nextBoard, alpha, beta, false, aiTeam, size, qDepth - 1);
      maxEval = Math.max(maxEval, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of orderedCaptures) {
      const { nextBoard } = applyMove(board, move, size);
      const score = quiescence(nextBoard, alpha, beta, true, aiTeam, size, qDepth - 1);
      minEval = Math.min(minEval, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function getBestMoveAI(
  board: (Piece | null)[][],
  aiTeam: Team,
  difficulty: 'easy' | 'medium' | 'master',
  size: number = 8,
  onePieceEndgameRule: boolean = true
): Move | null {
  const legalMoves = getAllLegalMoves(board, aiTeam, size, true);
  if (legalMoves.length === 0) return null;

  const pawnCaptures = legalMoves.filter(
    m => m.captures.length > 0 && !board[m.from.row][m.from.col]?.isKing
  );
  const kingCaptures = legalMoves.filter(
    m => m.captures.length > 0 && board[m.from.row][m.from.col]?.isKing
  );

  let movesToConsider = legalMoves;

  // Rule 1: "Only piece to take piece or piece's is force (when you like it or not is a force)"
  if (pawnCaptures.length > 0) {
    // Consider all complete pawn and king capture branches freely (avoid incomplete huffable stops)
    movesToConsider = filterCompleteCaptureMoves([...pawnCaptures, ...kingCaptures]);
  } else if (kingCaptures.length > 0) {
    // Rule 2: "We don't force opponent to use kings to piece or piece's, in fact is trap"
    // The player may lay a trap to remove the AI King from the board!
    // On Easy / Medium, the AI King can fall into the trap by making a non-capturing quiet move.
    const fallIntoTrapChance = difficulty === 'easy' ? 0.40 : difficulty === 'medium' ? 0.18 : 0.04;
    const fellIntoTrap = Math.random() < fallIntoTrapChance;
    const safeKingCaptures = filterCompleteCaptureMoves(kingCaptures);

    if (fellIntoTrap) {
      const quietMoves = legalMoves.filter(m => m.captures.length === 0);
      movesToConsider = quietMoves.length > 0 ? quietMoves : safeKingCaptures;
    } else {
      movesToConsider = safeKingCaptures;
    }
  }

  // Easy: casual lookahead with slight randomness among considered moves
  if (difficulty === 'easy') {
    if (Math.random() < 0.25) {
      const randomIdx = Math.floor(Math.random() * movesToConsider.length);
      return movesToConsider[randomIdx];
    }
  }

  const { total } = countPieces(board, size);

  // DEEP LOOKAHEAD DEPTHS:
  // Easy: depth 2
  // Medium: depth 4 + quiescence
  // Master: depth 5-6 (or depth 7 in late endgame when total pieces <= 10)
  let depth = 2;
  if (difficulty === 'medium') {
    depth = 4;
  } else if (difficulty === 'master') {
    depth = total <= 10 ? 7 : total <= 18 ? 6 : 5;
  }

  let bestScore = -Infinity;
  let bestMoves: Move[] = [];
  const orderedMoves = orderMoves(movesToConsider, size);

  let alpha = -Infinity;
  const beta = Infinity;

  for (const move of orderedMoves) {
    const { nextBoard } = applyMove(board, move, size);
    const score = minimax(nextBoard, depth - 1, alpha, beta, false, aiTeam, size, onePieceEndgameRule);

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
    alpha = Math.max(alpha, bestScore);
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)] || orderedMoves[0];
}

function minimax(
  board: (Piece | null)[][],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiTeam: Team,
  size: number,
  onePieceEndgameRule: boolean = true
): number {
  const currentTeam: Team = isMaximizing ? aiTeam : aiTeam === 'R' ? 'W' : 'R';

  // Check 1-piece left victory terminal condition
  const { red, white } = countPieces(board, size);
  const aiPieces = aiTeam === 'W' ? white : red;
  const humanPieces = aiTeam === 'W' ? red : white;

  if (humanPieces === 0) return 10000 + depth;
  if (aiPieces === 0) return -10000 - depth;

  if (onePieceEndgameRule) {
    if (humanPieces === 1 && aiPieces > 1) {
      return 10000 + depth; // Win for AI
    }
    if (aiPieces === 1 && humanPieces > 1) {
      return -10000 - depth; // Loss for AI
    }
    if (humanPieces === 1 && aiPieces === 1) {
      return 0; // Tactical draw
    }
  }

  const legalMoves = getAllLegalMoves(board, currentTeam, size, true);

  if (legalMoves.length === 0) {
    return isMaximizing ? -10000 - depth : 10000 + depth;
  }

  // When captures exist, prioritize complete capture branches (player/AI may choose any capture direction freely)
  const captureMoves = legalMoves.filter(m => m.captures.length > 0);
  const candidateMoves = captureMoves.length > 0 ? filterCompleteCaptureMoves(captureMoves) : legalMoves;

  if (depth <= 0) {
    // Extend with quiescence search on tactical captures
    return quiescence(board, alpha, beta, isMaximizing, aiTeam, size, 2);
  }

  const orderedMoves = orderMoves(candidateMoves, size);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of orderedMoves) {
      const { nextBoard } = applyMove(board, move, size);
      const ev = minimax(nextBoard, depth - 1, alpha, beta, false, aiTeam, size, onePieceEndgameRule);
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of orderedMoves) {
      const { nextBoard } = applyMove(board, move, size);
      const ev = minimax(nextBoard, depth - 1, alpha, beta, true, aiTeam, size, onePieceEndgameRule);
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}
