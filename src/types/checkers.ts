export type Team = 'R' | 'W';

export interface Piece {
  id: string;
  team: Team;
  isKing: boolean;
  row: number;
  col: number;
}

export interface Position {
  row: number;
  col: number;
}

export interface MoveStep {
  from: Position;
  to: Position;
  captured?: Position;
}

export interface Move {
  from: Position;
  to: Position;
  path: Position[];
  captures: Position[];
  isPromotion?: boolean;
}

export interface CheckersGameState {
  board: (Piece | null)[][];
  boardSize: number; // 8 or 10
  turn: Team;
  moveCount: number;
  selectedPiece: Position | null;
  validMoves: Move[];
  isAiMoving: boolean;
  gameMode: 'online_pve' | 'offline_pvp';
  aiDifficulty: 'easy' | 'medium' | 'master';
  winner: Team | 'draw' | null;
  capturedRed: number;
  capturedWhite: number;
  moveLog: string[];
  history: {
    board: (Piece | null)[][];
    turn: Team;
    moveCount: number;
    log: string[];
    capturedRed: number;
    capturedWhite: number;
  }[];
}
