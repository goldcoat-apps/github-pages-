import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckersGameState,
  Move,
  Piece,
  Position,
  Team,
} from '../../types/checkers';
import {
  applyMove,
  checkHuffPenalty,
  countPieces,
  createInitialBoard,
  evaluateGameOver,
  formatMoveNotation,
  getAllLegalMoves,
  getBestMoveAI,
  getEnemyPieceStatus,
  getLegalMovesForSelectedPiece,
} from '../../utils/checkersEngine';
import { sounds } from '../../utils/audio';
import { AdBanner320x50 } from '../AdBanner320x50';
import { CheckersBoard } from './CheckersBoard';
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  HelpCircle,
  Crown,
  History,
  Bot,
  User,
  Shield,
  Zap,
  Wind,
} from 'lucide-react';

interface CheckersGameProps {
  initialMode?: 'online_pve' | 'offline_pvp';
  initialBoardSize?: 8 | 10;
  onBackToHub: () => void;
}

export const CheckersGame: React.FC<CheckersGameProps> = ({
  initialMode = 'online_pve',
  initialBoardSize = 10,
  onBackToHub,
}) => {
  const [boardSize, setBoardSize] = useState<number>(initialBoardSize);
  const [gameMode, setGameMode] = useState<'online_pve' | 'offline_pvp'>(initialMode);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'master'>('medium');
  const [mandatoryCaptures, setMandatoryCaptures] = useState<boolean>(true); // African Dam: Compulsory captures (must jump)
  const [onePieceRule, setOnePieceRule] = useState<boolean>(true); // African Dam: One piece cannot play — game is over!
  const [huffRule, setHuffRule] = useState<boolean>(true); // African Dam: King removed from stool if it refuses capture
  const [huffNotice, setHuffNotice] = useState<{ message: string; pieceType: 'king' | 'man' } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sounds.isEnabled());
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [statusAlert, setStatusAlert] = useState<string | null>(null);
  const [targetedEnemy, setTargetedEnemy] = useState<Position | null>(null);
  const [gameOverReason, setGameOverReason] = useState<string | null>(null);

  // Core Game State
  const [board, setBoard] = useState<(Piece | null)[][]>(() => createInitialBoard(initialBoardSize));
  const [turn, setTurn] = useState<Team>('R'); // Red starts
  const [moveCount, setMoveCount] = useState<number>(1);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [isAiMoving, setIsAiMoving] = useState<boolean>(false);
  const [winner, setWinner] = useState<Team | 'draw' | null>(null);
  const [capturedRed, setCapturedRed] = useState<number>(0);
  const [capturedWhite, setCapturedWhite] = useState<number>(0);
  const [moveLog, setMoveLog] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);

  // History stack for undo
  const [history, setHistory] = useState<CheckersGameState['history']>([]);

  // Count active pieces on the board
  const pieceCounts = useMemo(() => countPieces(board, boardSize), [board, boardSize]);

  // Calculate current turn's legal moves
  const currentLegalMoves = useMemo(() => {
    return getAllLegalMoves(board, turn, boardSize, mandatoryCaptures);
  }, [board, turn, boardSize, mandatoryCaptures]);

  const hasCapturesAvailable = useMemo(() => {
    return currentLegalMoves.some(m => m.captures.length > 0);
  }, [currentLegalMoves]);

  const movablePieces = useMemo(() => {
    return Array.from(new Set(currentLegalMoves.map(m => `${m.from.row},${m.from.col}`)));
  }, [currentLegalMoves]);

  // List of all enemy pieces currently vulnerable to being captured
  const capturableEnemyPositions = useMemo(() => {
    const vulnerable = new Set<string>();
    for (const move of currentLegalMoves) {
      for (const cap of move.captures) {
        vulnerable.add(`${cap.row},${cap.col}`);
      }
    }
    return Array.from(vulnerable);
  }, [currentLegalMoves]);

  // Sound toggle handler
  const handleToggleSound = () => {
    const next = sounds.toggleSound();
    setSoundEnabled(next);
  };

  // Check Game Over condition with African Dam 1-Piece Left Rule
  const checkGameOver = (currentBoard: (Piece | null)[][], currentTurn: Team) => {
    const res = evaluateGameOver(currentBoard, currentTurn, boardSize, mandatoryCaptures, onePieceRule);
    if (res.isOver) {
      setWinner(res.winner);
      setGameOverReason(res.reason || null);
      if (res.winner === 'draw') {
        sounds.playClick();
      } else {
        sounds.playWin();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      return true;
    }
    return false;
  };

  // Reset Game
  const startNewGame = (mode = gameMode, newSize?: number) => {
    sounds.playClick();
    const sizeToUse = newSize ?? boardSize;
    if (newSize && newSize !== boardSize) {
      setBoardSize(newSize);
    }
    const newBoard = createInitialBoard(sizeToUse);
    setBoard(newBoard);
    setTurn('R');
    setMoveCount(1);
    setSelectedPiece(null);
    setValidMoves([]);
    setTargetedEnemy(null);
    setIsAiMoving(false);
    setWinner(null);
    setGameOverReason(null);
    setCapturedRed(0);
    setCapturedWhite(0);
    setMoveLog([]);
    setLastMove(null);
    setHistory([]);
    setGameMode(mode);
    setStatusAlert(null);
    setHuffNotice(null);
  };

  // Select piece on board
  const handleSelectPiece = (pos: Position) => {
    if (winner || isAiMoving) return;
    const piece = board[pos.row][pos.col];
    if (!piece || piece.team !== turn) return;

    const moves = getLegalMovesForSelectedPiece(board, piece, boardSize, mandatoryCaptures);

    if (moves.length === 0) {
      sounds.playError();
      if (mandatoryCaptures && hasCapturesAvailable) {
        setStatusAlert('Forced jump rule active: must jump with highlighted piece!');
      } else {
        setStatusAlert('This piece has no legal moves right now.');
      }
      setTimeout(() => setStatusAlert(null), 2500);
      return;
    }

    sounds.playClick();
    setSelectedPiece(pos);
    setValidMoves(moves);
    setTargetedEnemy(null);

    if (piece.isKing) {
      const captureMoves = moves.filter(m => m.captures.length > 0);
      if (captureMoves.length > 0) {
        setStatusAlert('👑 Flying King: Tap ANY glowing square (including borders) to choose landing, or tap the AI piece to take directly!');
      } else {
        setStatusAlert('👑 Flying King: Slides freely diagonally any distance.');
      }
    } else {
      const captureMoves = moves.filter(m => m.captures.length > 0);
      if (captureMoves.length > 0) {
        setStatusAlert('🎯 Pawn Jump: Forward and backward captures enabled!');
      } else {
        setStatusAlert(null);
      }
    }
  };

  // When player clicks an enemy piece to target/capture it
  const handleTargetEnemyPiece = (pos: Position) => {
    if (winner || isAiMoving) return;

    const status = getEnemyPieceStatus(board, pos, turn, boardSize, mandatoryCaptures, selectedPiece);

    if (status.canBeCaptured && status.capturingMoves.length > 0) {
      // Find the capturing piece: prefer currently selected piece if it can take this enemy
      let capturingPiecePos = selectedPiece;
      const canSelectedCapture =
        selectedPiece &&
        status.capturingMoves.some(
          m => m.from.row === selectedPiece.row && m.from.col === selectedPiece.col
        );

      if (!canSelectedCapture) {
        capturingPiecePos = status.capturingPieces[0] || status.capturingMoves[0].from;
      }

      const landingMoves = status.capturingMoves.filter(
        m => m.from.row === capturingPiecePos!.row && m.from.col === capturingPiecePos!.col
      );

      if (landingMoves.length === 0) return;

      // Sort so the full multi-jump chain is prioritized first (prevents accidental stool penalty!)
      landingMoves.sort((a, b) => b.captures.length - a.captures.length);

      // Check if this enemy was already targeted on previous tap (second tap / double tap)
      const isSecondTapOnSameEnemy =
        targetedEnemy && targetedEnemy.row === pos.row && targetedEnemy.col === pos.col;

      // If only 1 landing square exists OR player taps enemy a second time: EXECUTE IMMEDIATELY!
      if (landingMoves.length === 1 || isSecondTapOnSameEnemy) {
        setTargetedEnemy(null);
        handleExecuteMove(landingMoves[0]);
        return;
      }

      // If multiple landing squares exist (e.g. Flying King) and it's the first tap:
      sounds.playClick();
      setSelectedPiece(capturingPiecePos);
      setValidMoves(landingMoves);
      setTargetedEnemy(pos);
      setStatusAlert('👑 Tap a glowing square to land, or tap AI piece again to take immediately!');
      return;
    }

    // Cannot be captured -> explain clearly why!
    sounds.playError();
    setTargetedEnemy(null);
    setStatusAlert(status.reason || 'This AI piece cannot be taken right now.');
    setTimeout(() => setStatusAlert(null), 3000);
  };

  const handleDeselect = () => {
    setSelectedPiece(null);
    setValidMoves([]);
    setTargetedEnemy(null);
  };

  // Execute a move
  const handleExecuteMove = (move: Move) => {
    if (winner || isAiMoving) return;

    // Save history snapshot for Undo
    setHistory(prev => [
      ...prev,
      {
        board: board.map(row => row.map(cell => (cell ? { ...cell } : null))),
        turn,
        moveCount,
        log: [...moveLog],
        capturedRed,
        capturedWhite,
      },
    ]);

    // 1. Check African Dam Huff / Stool Penalty BEFORE applying move
    let huffedPos: Position | null = null;
    let huffAlert: string | null = null;
    let huffPieceType: 'king' | 'man' = 'man';

    if (huffRule) {
      const huff = checkHuffPenalty(board, move, boardSize);
      if (huff.isHuffable && huff.huffedPiecePos) {
        huffedPos = huff.huffedPiecePos;
        huffAlert = huff.reason || 'Piece removed from stool (Huff Rule)!';
        huffPieceType = huff.pieceType;
      }
    }

    // Apply move
    const { nextBoard, wasPromoted } = applyMove(board, move, boardSize);
    let notation = formatMoveNotation(move, boardSize);

    // If Huff rule was triggered, opponent takes that King/piece from the stool / board!
    if (huffedPos) {
      const targetPosInNextBoard =
        huffedPos.row === move.from.row && huffedPos.col === move.from.col
          ? move.to
          : huffedPos;

      nextBoard[targetPosInNextBoard.row][targetPosInNextBoard.col] = null;
      notation += ` 💨 [${huffPieceType === 'king' ? 'King 🤴' : 'Piece'} Blown from Stool]`;
    }

    const updatedLog = [`${turn === 'R' ? moveCount + '.' : ''} ${turn === 'R' ? '🔴' : '⚪'} ${notation}`, ...moveLog];

    // Sound and capture tracking
    if (huffedPos) {
      sounds.playHuffPiece();
      if (turn === 'R') {
        // Red moved; White (opponent) huffs Red's piece -> White gets +1
        setCapturedWhite(prev => prev + move.captures.length);
        setCapturedRed(prev => prev + 1);
      } else {
        // White moved; Red (opponent) huffs White's piece -> Red gets +1
        setCapturedRed(prev => prev + move.captures.length);
        setCapturedWhite(prev => prev + 1);
      }
      setHuffNotice({
        message: huffAlert || 'Piece removed from stool (Huff Rule)!',
        pieceType: huffPieceType,
      });
      setTimeout(() => setHuffNotice(null), 4500);
    } else if (move.captures.length > 0) {
      sounds.playCapture();
      if (turn === 'R') {
        setCapturedWhite(prev => prev + move.captures.length);
      } else {
        setCapturedRed(prev => prev + move.captures.length);
      }
    } else {
      sounds.playPieceMove();
    }

    if (wasPromoted) {
      sounds.playKingCrown();
    }

    setBoard(nextBoard);
    setMoveLog(updatedLog);
    setLastMove({ from: move.from, to: move.to });
    setSelectedPiece(null);
    setValidMoves([]);
    setTargetedEnemy(null);
    setStatusAlert(null);

    const nextTurn: Team = turn === 'R' ? 'W' : 'R';
    const nextMoveCount = turn === 'W' ? moveCount + 1 : moveCount;
    setTurn(nextTurn);
    setMoveCount(nextMoveCount);

    // Verify game over
    const isOver = checkGameOver(nextBoard, nextTurn);
    if (isOver) return;

    // Trigger AI if in PvE and it's AI turn (White is AI)
    if (gameMode === 'online_pve' && nextTurn === 'W') {
      setIsAiMoving(true);
    }
  };

  // Handle AI turn
  useEffect(() => {
    if (gameMode !== 'online_pve' || turn !== 'W' || winner || !isAiMoving) {
      return;
    }

    const timer = setTimeout(() => {
      try {
        const aiMove = getBestMoveAI(board, 'W', aiDifficulty, boardSize, onePieceRule);
        if (aiMove) {
          let huffedPos: Position | null = null;
          let huffAlert: string | null = null;
          let huffPieceType: 'king' | 'man' = 'man';

          if (huffRule) {
            const huff = checkHuffPenalty(board, aiMove, boardSize);
            if (huff.isHuffable && huff.huffedPiecePos) {
              huffedPos = huff.huffedPiecePos;
              huffAlert = huff.reason || 'AI King removed from stool (Huff Rule)!';
              huffPieceType = huff.pieceType;
            }
          }

          const { nextBoard, wasPromoted } = applyMove(board, aiMove, boardSize);
          let notation = formatMoveNotation(aiMove, boardSize);

          if (huffedPos) {
            const targetPosInNextBoard =
              huffedPos.row === aiMove.from.row && huffedPos.col === aiMove.from.col
                ? aiMove.to
                : huffedPos;

            nextBoard[targetPosInNextBoard.row][targetPosInNextBoard.col] = null;
            notation += ` 💨 [${huffPieceType === 'king' ? 'King 🤴' : 'Piece'} Blown from Stool]`;
          }

          const updatedLog = [`${moveCount}. ⚪ ${notation}`, ...moveLog];

          if (huffedPos) {
            sounds.playHuffPiece();
            setCapturedRed(prev => prev + aiMove.captures.length);
            setCapturedWhite(prev => prev + 1); // Red player huffed White piece!
            setHuffNotice({
              message: `💨 TRAP SPRUNG: Opponent ${huffPieceType === 'king' ? 'King 🤴' : 'Piece'} fell into the trap, refused capture, and was removed from stool!`,
              pieceType: huffPieceType,
            });
            setTimeout(() => setHuffNotice(null), 4500);
          } else if (aiMove.captures.length > 0) {
            sounds.playCapture();
            setCapturedRed(prev => prev + aiMove.captures.length);
          } else {
            sounds.playPieceMove();
          }

          if (wasPromoted) {
            sounds.playKingCrown();
          }

          setBoard(nextBoard);
          setMoveLog(updatedLog);
          setLastMove({ from: aiMove.from, to: aiMove.to });
          setTurn('R');
          setMoveCount(prev => prev + 1);
          setIsAiMoving(false);

          checkGameOver(nextBoard, 'R');
        } else {
          setIsAiMoving(false);
          setWinner('R');
          setGameOverReason('Red wins: AI has no legal moves left!');
          sounds.playWin();
        }
      } catch (err) {
        console.error('AI calculation error:', err);
        setIsAiMoving(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [turn, isAiMoving, gameMode, winner, board, aiDifficulty, boardSize, moveCount, moveLog, onePieceRule, huffRule, mandatoryCaptures]);

  // Undo move
  const handleUndo = () => {
    if (history.length === 0 || isAiMoving) return;
    sounds.playClick();

    let stepsBack = 1;
    if (gameMode === 'online_pve' && history.length >= 2) {
      stepsBack = 2;
    }

    const targetSnapshot = history[history.length - stepsBack];
    setBoard(targetSnapshot.board);
    setTurn(targetSnapshot.turn);
    setMoveCount(targetSnapshot.moveCount);
    setMoveLog(targetSnapshot.log);
    setCapturedRed(targetSnapshot.capturedRed);
    setCapturedWhite(targetSnapshot.capturedWhite);
    setWinner(null);
    setGameOverReason(null);
    setSelectedPiece(null);
    setValidMoves([]);
    setTargetedEnemy(null);
    setLastMove(null);
    setStatusAlert(null);
    setHistory(prev => prev.slice(0, prev.length - stepsBack));
  };

  return (
    <div className="flex flex-col h-full w-full max-h-full overflow-hidden bg-[#121212] text-neutral-100 select-none">
      {/* Top Header */}
      <header className="shrink-0 h-14 z-30 bg-[#181818]/95 backdrop-blur border-b border-neutral-800 px-3 sm:px-4 flex items-center">
        <div className="max-w-4xl w-full mx-auto flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onBackToHub}
              className="p-1.5 sm:p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0"
              aria-label="Back to Hub"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-red-500" />
                <h1 className="text-base sm:text-lg font-bold tracking-wide">CHECKERS PRO</h1>
              </div>
              <p className="text-xs text-red-400 font-semibold tracking-wider">
                {boardSize === 10 ? '10×10 AFRICAN DAM' : '8×8 DRAUGHTS'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Board Size Switcher (10x10 vs 8x8) */}
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => startNewGame(gameMode, 10)}
                className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg transition-all cursor-pointer ${
                  boardSize === 10
                    ? 'bg-red-600 text-white shadow-sm font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="10×10 African Dam (20 pieces each, 100 squares)"
              >
                10×10
              </button>
              <button
                type="button"
                onClick={() => startNewGame(gameMode, 8)}
                className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg transition-all cursor-pointer ${
                  boardSize === 8
                    ? 'bg-red-600 text-white shadow-sm font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="8×8 Classic Draughts (12 pieces each, 64 squares)"
              >
                8×8
              </button>
            </div>

            {/* African Dam "One Piece Cannot Play" Rule Toggle */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setOnePieceRule(!onePieceRule);
              }}
              className={`px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                onePieceRule
                  ? 'bg-amber-950/70 border-amber-500/60 text-amber-300'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-400'
              }`}
              title={onePieceRule ? 'African Dam Rule: One piece cannot play — game is over when reduced to 1 piece' : 'Standard Draughts: Play until 0 pieces or trapped'}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {onePieceRule ? '1-Piece Rule (Africa)' : 'Wipeout (0)'}
              </span>
            </button>

            {/* Forced Jumps vs Free Choice Toggle */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setMandatoryCaptures(!mandatoryCaptures);
                setSelectedPiece(null);
                setValidMoves([]);
              }}
              className={`px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                mandatoryCaptures
                  ? 'bg-red-950/70 border-red-500/60 text-red-300'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-400'
              }`}
              title={mandatoryCaptures ? 'Compulsory Jumps (Must capture when open, choose any capturing piece)' : 'Free Choice: Move freely without forced captures'}
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {mandatoryCaptures ? 'Forced Jumps' : 'Free Choice'}
              </span>
            </button>

            {/* African Dam Huff / Stool Penalty Toggle */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setHuffRule(!huffRule);
              }}
              className={`px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                huffRule
                  ? 'bg-orange-950/70 border-orange-500/60 text-orange-300'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-400'
              }`}
              title={huffRule ? 'African Dam Rule: King on stool removed if it refuses to capture (pieces taking pieces leaves Kings safe)' : 'Stool Penalty: Off'}
            >
              <Wind className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {huffRule ? 'King Stool Penalty' : 'Stool Penalty: Off'}
              </span>
            </button>

            {/* Mode Switcher */}
            <div className="hidden lg:flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => startNewGame('online_pve')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  gameMode === 'online_pve'
                    ? 'bg-red-600 text-white font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Vs AI</span>
              </button>
              <button
                type="button"
                onClick={() => startNewGame('offline_pvp')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  gameMode === 'offline_pvp'
                    ? 'bg-red-600 text-white font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>2-Player</span>
              </button>
            </div>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={handleToggleSound}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
              aria-label="Toggle Sound"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-500" />}
            </button>

            {/* Rules Button */}
            <button
              type="button"
              onClick={() => setShowRulesModal(true)}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="African Dam Rules & Board Config"
              aria-label="African Dam Rules"
            >
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Screen with Rock-Solid Fixed Height & Layout */}
      <main className="flex-1 min-h-0 max-w-2xl w-full mx-auto px-2 sm:px-4 py-1 flex flex-col items-center justify-center gap-1 sm:gap-1.5 overflow-hidden">
        {/* Fixed-Height Alert Slot (28px fixed height prevents layout shifts) */}
        <div className="w-full max-w-[min(540px,96vw)] h-7 shrink-0 flex items-center justify-center overflow-hidden">
          {huffNotice ? (
            <div className="w-full h-full px-3 rounded-lg bg-red-950/90 border border-red-500/80 flex items-center justify-center gap-1.5 text-xs text-red-200 font-bold shadow-md shadow-red-950/80">
              <span>💨</span>
              <span className="truncate leading-none">{huffNotice.message}</span>
            </div>
          ) : statusAlert ? (
            <div className="w-full h-full px-3 rounded-lg bg-amber-950/80 border border-amber-500/50 flex items-center justify-center gap-2 text-xs text-amber-200">
              <span className="truncate leading-none">{statusAlert}</span>
            </div>
          ) : hasCapturesAvailable ? (
            <div className="w-full h-full px-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center gap-2 text-xs text-emerald-200">
              <span className="truncate leading-none">🎯 Taking pieces available! Tap your piece or AI piece to jump.</span>
            </div>
          ) : (
            <div className="w-full h-full px-3 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-center justify-center text-[11px] text-neutral-400">
              <span className="truncate leading-none">{turn === 'R' ? '🔴 Your turn · Select any highlighted piece' : '⚪ White turn'}</span>
            </div>
          )}
        </div>

        {/* Players Scoreboard Bar - Locked height prevents any vertical jitter */}
        <div className="w-full max-w-[min(540px,96vw)] h-14 shrink-0 bg-[#1a1a1a] rounded-2xl border border-neutral-800 px-3 py-1.5 flex items-center justify-between gap-2 shadow-sm">
          {/* Red Player */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-800 border-2 flex items-center justify-center font-bold text-xs ${
                turn === 'R'
                  ? 'border-red-400 ring-2 ring-red-500/50 shadow-md shadow-red-900/40'
                  : 'border-neutral-700 opacity-60'
              }`}
            >
              R
            </div>
            <div className="leading-tight">
              <div className="text-xs font-semibold text-neutral-200 truncate max-w-[90px] sm:max-w-[120px]">
                {gameMode === 'online_pve' ? 'You (Red)' : 'Player 1 (Red)'}
              </div>
              <div className="text-[10px] text-neutral-400 flex items-center gap-1">
                <span className={pieceCounts.red === 1 ? 'text-amber-400 font-bold' : ''}>
                  {pieceCounts.red === 1 ? '⚠️ 1 left' : `${pieceCounts.red} left`}
                </span>
                <span>· Cap: {capturedWhite}</span>
              </div>
            </div>
          </div>

          {/* Turn / Move Center Badge - Fixed width & height container */}
          <div className="w-24 sm:w-28 h-10 flex flex-col items-center justify-center shrink-0">
            <div className="h-6 w-full flex items-center justify-center">
              {isAiMoving ? (
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" />
                  Thinking...
                </span>
              ) : winner ? (
                <span className="text-xs font-bold text-amber-400">Game Over</span>
              ) : (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    turn === 'R' ? 'text-red-400 bg-red-950/80 border-red-800/60' : 'text-neutral-200 bg-neutral-800 border-neutral-700'
                  }`}
                >
                  {turn === 'R' ? 'Red Turn' : 'White Turn'}
                </span>
              )}
            </div>
            <span className="text-[10px] text-neutral-500 font-mono leading-none mt-0.5">Move #{moveCount}</span>
          </div>

          {/* White Player */}
          <div className="flex items-center gap-2 text-right shrink-0">
            <div className="leading-tight">
              <div className="text-xs font-semibold text-neutral-200 truncate max-w-[90px] sm:max-w-[120px]">
                {gameMode === 'online_pve' ? 'AI (White)' : 'Player 2 (White)'}
              </div>
              <div className="text-[10px] text-neutral-400 flex items-center justify-end gap-1">
                <span>Cap: {capturedRed} · </span>
                <span className={pieceCounts.white === 1 ? 'text-amber-400 font-bold' : ''}>
                  {pieceCounts.white === 1 ? '⚠️ 1 left' : `${pieceCounts.white} left`}
                </span>
              </div>
            </div>
            <div
              className={`w-8 h-8 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-400 border-2 flex items-center justify-center font-bold text-xs text-neutral-900 ${
                turn === 'W'
                  ? 'border-amber-300 ring-2 ring-amber-400/50 shadow-md'
                  : 'border-neutral-700 opacity-60'
              }`}
            >
              W
            </div>
          </div>
        </div>

        {/* Board Component Container - Rock solid centering without layout shift */}
        <div className="shrink-0 flex items-center justify-center p-0.5 sm:p-1 overflow-hidden">
          <CheckersBoard
            board={board}
            size={boardSize}
            selectedPiece={selectedPiece}
            validMoves={validMoves}
            turn={turn}
            isAiMoving={isAiMoving}
            lastMove={lastMove}
            movablePieces={movablePieces}
            capturableEnemyPositions={capturableEnemyPositions}
            onSelectPiece={handleSelectPiece}
            onExecuteMove={handleExecuteMove}
            onTargetEnemyPiece={handleTargetEnemyPiece}
            onDeselectPiece={handleDeselect}
          />
        </div>

        {/* Bottom Action Controls */}
        <div className="w-full max-w-[min(540px,96vw)] h-11 shrink-0 flex items-center justify-between gap-2 px-1 pb-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length === 0 || isAiMoving || !!winner}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                history.length === 0 || isAiMoving || !!winner
                  ? 'bg-neutral-800/40 text-neutral-600 cursor-not-allowed'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Undo
            </button>

            {gameMode === 'online_pve' && (
              <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-1 text-[10px] sm:text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setAiDifficulty('easy');
                  }}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    aiDifficulty === 'easy'
                      ? 'bg-neutral-700 text-white font-bold'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                  title="Easy Lookahead: 2-ply search"
                >
                  Easy (2p)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setAiDifficulty('medium');
                  }}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    aiDifficulty === 'medium'
                      ? 'bg-neutral-700 text-white font-bold'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                  title="Medium Lookahead: 4 plies + Quiescence capture search"
                >
                  Med (4p)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setAiDifficulty('master');
                  }}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    aiDifficulty === 'master'
                      ? 'bg-red-700 text-white font-bold shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                  title="Master Deep Lookahead: 5 to 7 plies deep + Quiescence tactical search"
                >
                  Master (7p)
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>Moves ({moveLog.length})</span>
            </button>

            <button
              type="button"
              onClick={() => startNewGame()}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              Restart
            </button>
          </div>
        </div>
      </main>

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-neutral-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-white">Checkers Pro Rules & Board Config</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm text-neutral-300 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-500/40">
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span>🌍</span> African Dam (Ghanaian Damii) Authentic Rules
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Dam is configured with authentic African home rules: <strong className="text-amber-300">one piece cannot play</strong> (the game is over when an opponent is down to 1 piece), and when taking pieces, <strong className="text-emerald-300">using a piece to capture leaves Kings safe on the board</strong>!
                </p>
              </div>

              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-1">
                  1. One Piece Cannot Play (Game Over)
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  In African Dam, <strong className="text-amber-300">one piece cannot play</strong>. When an opponent is reduced down
                  to <strong className="text-white">only 1 piece</strong> while the other player has 2 or more pieces, that player has lost immediately and <strong className="text-white">the game is declared over</strong>! If both players are reduced to 1 piece each, the match ends in a tactical draw.
                </p>
              </div>

              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-1">
                  2. Only Pieces are Forced to Capture (Kings are Trap Bait)
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  In African Damii, <strong className="text-emerald-400">only regular pieces (pawns) are forced to capture</strong> ("whether you like it or not is a force"). We <strong className="text-amber-300">do not force kings to capture</strong> because players set clever tactical traps to bait and remove powerful opponent Kings from the game!
                </p>
              </div>

              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-1">
                  3. The King Trap & Removal from Stool (Huff)
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  When a King has an available capture, it can choose to capture or slide. But if the King <strong className="text-white">refuses to take those pieces</strong> and makes a quiet move or moves another piece, <strong className="text-orange-400">the trap springs</strong>! The opponent takes that King from the stool and removes it from the board! However, when you use a regular piece to capture, your Kings are completely safe.
                </p>
              </div>

              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-1">
                  4. Flying King Landing Control (👑)
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  When your King jumps over an opponent piece, it can land on{' '}
                  <strong className="text-white">ANY empty square behind the jumped piece</strong> along that diagonal ray. All valid landing squares light up with gold crown badges so you maintain total tactical control over where your King lands!
                </p>
              </div>

              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-1">
                  5. 10×10 Grand Dam & 8×8 Classic Boards
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Authentic African Dam is traditionally played on a{' '}
                  <strong className="text-white">10×10 board with 100 squares and 20 pieces per side</strong>.
                  Toggle dynamically between the 10×10 grand board and the 8×8 classic board using the top bar switcher at any time.
                </p>
              </div>

              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-1">
                  6. Backward Captures for Pawns
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  In African Dam, regular pawns can jump and capture diagonally both forward and backward, while regular non-capture moves are forward only.
                </p>
              </div>

              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-1">
                  7. Fair King Coronation
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  A pawn only crowns as a King if it <strong className="text-white">stops its turn on the king row</strong>. If a pawn jumps through the king row as part of a multi-jump and continues jumping, it remains a normal man for the rest of that turn.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors cursor-pointer"
            >
              Got It, Let&apos;s Play
            </button>
          </div>
        </div>
      )}

      {/* Move History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-neutral-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white">Move History ({moveLog.length})</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1 text-xs font-mono">
              {moveLog.length === 0 ? (
                <p className="text-neutral-500 italic text-center py-6">No moves made yet.</p>
              ) : (
                moveLog.map((log, idx) => (
                  <div key={`log-${moveLog.length - idx}-${log}`} className="p-2 rounded bg-neutral-900/60 border border-neutral-800/80 flex items-center justify-between text-neutral-300">
                    <span>{log}</span>
                    <span className="text-[10px] text-neutral-500">#{moveLog.length - idx}</span>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowHistoryModal(false)}
              className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs cursor-pointer"
            >
              Close History
            </button>
          </div>
        </div>
      )}

      {/* Victory Modal */}
      {winner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1c1c1c] border border-amber-500/40 rounded-3xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center mx-auto text-3xl">
              👑
            </div>

            <div>
              <h2 className="text-2xl font-black tracking-wide text-white">
                {winner === 'draw'
                  ? 'TACTICAL DRAW!'
                  : winner === 'R'
                  ? gameMode === 'online_pve'
                    ? 'VICTORY!'
                    : 'PLAYER 1 WINS!'
                  : gameMode === 'online_pve'
                  ? 'AI WINS!'
                  : 'PLAYER 2 WINS!'}
              </h2>
              {gameOverReason ? (
                <p className="text-xs text-amber-300 bg-amber-950/60 border border-amber-500/40 rounded-xl px-2.5 py-1.5 mt-2 font-medium">
                  {gameOverReason}
                </p>
              ) : (
                <p className="text-xs text-amber-400/80 mt-1 uppercase font-semibold tracking-wider">
                  Checkers Champion
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
              <div className="text-left">
                <span className="text-neutral-500 block">Total Moves</span>
                <span className="text-white font-mono font-bold text-sm">{moveCount}</span>
              </div>
              <div className="text-right">
                <span className="text-neutral-500 block">Total Captures</span>
                <span className="text-white font-mono font-bold text-sm">
                  {capturedRed + capturedWhite}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <AdBanner320x50 className="py-1" />
              <button
                type="button"
                onClick={() => startNewGame()}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors cursor-pointer shadow-lg shadow-red-900/30"
              >
                Play Again
              </button>
              <button
                type="button"
                onClick={onBackToHub}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Return to Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
