import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { LudoGameState, LudoMatchConfig, PlayerColor, TokenMoveOption } from '../../types/ludo';
import {
  createInitialLudoGame,
  executeTokenMove,
  getBotTokenMove,
  getMovableTokens,
  getTokenLegalMoves,
  DEFAULT_AFRICAN_LUDO_RULES,
} from '../../utils/ludoEngine';
import { sounds } from '../../utils/audio';
import { LudoBoard } from './LudoBoard';
import { Dice } from './Dice';
import { LudoSetupModal } from './LudoSetupModal';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Settings,
  Bot,
  HelpCircle,
  Play,
  Shield,
  Wind,
  Image as ImageIcon,
} from 'lucide-react';
import { LUDO_EMBLEMS, LUDO_CENTER_CREST } from '../../utils/ludoPictures';
import { AdBanner320x50 } from '../AdBanner320x50';
import { LudoGalleryModal } from './LudoGalleryModal';

interface LudoGameProps {
  onBackToHub: () => void;
  initialConfig?: LudoMatchConfig;
}

export const LudoGame: React.FC<LudoGameProps> = ({
  onBackToHub,
  initialConfig,
}) => {
  const [matchConfig, setMatchConfig] = useState<LudoMatchConfig>(
    initialConfig || {
      playerCount: 2,
      rules: DEFAULT_AFRICAN_LUDO_RULES,
      players: [
        { color: 'red', name: 'Player 1', isBot: false },
        { color: 'yellow', name: 'Bot (Yellow)', isBot: true },
      ],
    }
  );

  const [gameState, setGameState] = useState<LudoGameState>(() =>
    createInitialLudoGame(matchConfig)
  );
  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  const [soundEnabled, setSoundEnabled] = useState<boolean>(sounds.isEnabled());
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showGalleryModal, setShowGalleryModal] = useState<boolean>(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);
  const [galleryColor, setGalleryColor] = useState<PlayerColor | undefined>(undefined);
  const [pendingMoveChoices, setPendingMoveChoices] = useState<{
    tokenId: number;
    options: TokenMoveOption[];
  } | null>(null);

  const activePlayer = gameState.players[gameState.activePlayerIndex];

  const handleToggleSound = () => {
    const next = sounds.toggleSound();
    setSoundEnabled(next);
  };

  const handleStartMatch = (config: LudoMatchConfig) => {
    setPendingMoveChoices(null);
    setMatchConfig(config);
    const newGame = createInitialLudoGame(config);
    setGameState(newGame);
    stateRef.current = newGame;
    setShowSetupModal(false);
  };

  const handleRestart = () => {
    setPendingMoveChoices(null);
    sounds.playClick();
    const newGame = createInitialLudoGame(matchConfig);
    setGameState(newGame);
    stateRef.current = newGame;
  };

  // Roll Dice logic
  const handleRollDice = () => {
    const currentState = stateRef.current;
    if (!currentState.canRoll || currentState.isRolling || currentState.gameOver) return;

    setPendingMoveChoices(null);
    sounds.playDiceRoll();

    setGameState((prev) => ({
      ...prev,
      isRolling: true,
      canRoll: false,
      selectedTokenId: null,
      movableTokens: [],
    }));

    setTimeout(() => {
      const rolled = Math.floor(Math.random() * 6) + 1;
      sounds.playDiceResult(rolled === 6);

      const latestState = stateRef.current;
      const currPlayer = latestState.players[latestState.activePlayerIndex];
      const movable = getMovableTokens(currPlayer, rolled, latestState.players, latestState.rules);

      if (movable.length === 0) {
        // No moves possible -> pass turn after brief pause
        setGameState((prev) => ({
          ...prev,
          diceValue: rolled,
          isRolling: false,
          movableTokens: [],
          statusMessage: `${currPlayer.name} rolled a ${rolled}. No moves available!`,
        }));

        setTimeout(() => {
          setGameState((prev) => {
            let nextIndex = prev.activePlayerIndex;
            let attempts = 0;
            do {
              nextIndex = (nextIndex + 1) % prev.players.length;
              attempts++;
            } while (prev.winners.includes(prev.players[nextIndex].color) && attempts < prev.players.length);

            const nextPlayer = prev.players[nextIndex];
            return {
              ...prev,
              activePlayerIndex: nextIndex,
              diceValue: null,
              canRoll: true,
              consecutiveSixes: 0,
              statusMessage: `${nextPlayer.name}'s turn to roll!`,
            };
          });
        }, 850);
      } else {
        setGameState((prev) => ({
          ...prev,
          diceValue: rolled,
          isRolling: false,
          movableTokens: movable,
          statusMessage:
            rolled === 6
              ? `${currPlayer.name} rolled a 6! Tap a token to deploy or move.`
              : `${currPlayer.name} rolled a ${rolled}. Tap a highlighted token to move.`,
        }));
      }
    }, 650);
  };

  // Move token logic
  const handleSelectToken = (tokenId: number, chosenOption?: TokenMoveOption) => {
    const currentState = stateRef.current;
    if (currentState.gameOver) return;

    const dice = currentState.diceValue;
    if (!dice) return;

    const currPlayer = currentState.players[currentState.activePlayerIndex];
    const token = currPlayer.tokens.find(t => t.id === tokenId);
    if (!token) return;

    const legalOptions = getTokenLegalMoves(token, dice, currPlayer, currentState.players, currentState.rules);
    if (legalOptions.length === 0) return;

    // If human player and multiple tactical choices exist (e.g. Forward vs Reverse Chop or Home Line Raid)
    // and they haven't explicitly chosen yet, prompt them with the tactical action selector!
    if (legalOptions.length > 1 && !chosenOption && !currPlayer.isBot) {
      sounds.playClick();
      setPendingMoveChoices({ tokenId, options: legalOptions });
      return;
    }

    setPendingMoveChoices(null);
    sounds.playPieceMove();

    const { nextState, capturedToken, reachedHome, earnedBonusRoll, unlockedHome } = executeTokenMove(
      currentState,
      tokenId,
      chosenOption
    );

    if (capturedToken) {
      sounds.playChopPiece();
      if (unlockedHome) {
        setTimeout(() => sounds.playHomeUnlocked(), 260);
      }
    } else if (reachedHome) {
      sounds.playKingCrown();
    }

    if (nextState.gameOver || nextState.winners.length > 0) {
      if (nextState.winners.length === 1 && currentState.winners.length === 0) {
        // First winner!
        sounds.playWin();
        confetti({
          particleCount: 140,
          spread: 85,
          origin: { y: 0.6 },
        });
      }
    }

    setGameState(nextState);
    stateRef.current = nextState;
  };

  // Keep stateRef continuously synchronized with current gameState
  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  // Bot automation lifecycle - Rock-solid synchronization with gameState
  useEffect(() => {
    if (gameState.gameOver) return;
    const currentActive = gameState.players[gameState.activePlayerIndex];
    if (!currentActive || !currentActive.isBot) return;

    // Phase 1: Bot needs to roll (only when canRoll is true, not rolling, and diceValue is cleared)
    if (gameState.canRoll && !gameState.isRolling && gameState.diceValue === null) {
      const rollTimer = setTimeout(() => {
        handleRollDice();
      }, 700);
      return () => clearTimeout(rollTimer);
    }

    // Phase 2: Bot rolled and has movable tokens
    if (
      !gameState.isRolling &&
      gameState.diceValue !== null &&
      gameState.movableTokens.length > 0
    ) {
      const moveTimer = setTimeout(() => {
        const latestActive = gameState.players[gameState.activePlayerIndex];
        if (latestActive && latestActive.isBot && gameState.diceValue !== null) {
          const chosenTokenId = getBotTokenMove(
            latestActive,
            gameState.movableTokens,
            gameState.players,
            gameState.diceValue,
            gameState.rules
          );
          handleSelectToken(chosenTokenId);
        }
      }, 650);
      return () => clearTimeout(moveTimer);
    }
  }, [
    gameState.activePlayerIndex,
    gameState.canRoll,
    gameState.isRolling,
    gameState.diceValue,
    gameState.movableTokens,
    gameState.gameOver,
    gameState.players,
    gameState.rules,
  ]);

  const getPlayerBadgeColor = (color: PlayerColor) => {
    switch (color) {
      case 'red':
        return 'from-red-600 to-red-800 border-red-500 text-red-200';
      case 'green':
        return 'from-emerald-600 to-emerald-800 border-emerald-500 text-emerald-200';
      case 'yellow':
        return 'from-amber-500 to-amber-700 border-amber-400 text-amber-200';
      case 'blue':
        return 'from-blue-600 to-blue-800 border-blue-500 text-blue-200';
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-h-full overflow-hidden bg-[#121212] text-neutral-100 select-none">
      {/* Top Header */}
      <header className="shrink-0 h-14 z-30 bg-[#181818]/95 backdrop-blur border-b border-neutral-800 px-2 sm:px-4 flex items-center">
        <div className="max-w-4xl w-full mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
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
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-base sm:text-lg">🌍</span>
                <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-wide text-amber-200">
                  AFRICAN HOME LUDO
                </h1>
              </div>
              <p className="text-[10px] text-amber-400 font-semibold tracking-wider font-mono">
                GHANA & NIGERIA HOME RULES
              </p>
            </div>
          </div>

          {/* Quick African Rule Toggles */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Must Chop Toggle */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setGameState((prev) => {
                  const nextMustKill = !prev.rules.mustKillToEnterHome;
                  const nextRules = { ...prev.rules, mustKillToEnterHome: nextMustKill };
                  return {
                    ...prev,
                    rules: nextRules,
                    players: prev.players.map((p) => ({
                      ...p,
                      hasKilled: !nextMustKill ? true : p.kills >= 1,
                    })),
                  };
                });
              }}
              className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                gameState.rules.mustKillToEnterHome
                  ? 'bg-amber-950/70 border-amber-500/60 text-amber-300'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-400'
              }`}
              title="African Home Rule: Must chop 1 opponent token before entering home corridor"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {gameState.rules.mustKillToEnterHome ? 'Must Chop: Active' : 'Must Chop: Optional'}
              </span>
            </button>

            {/* Blockades Toggle */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setGameState((prev) => ({
                  ...prev,
                  rules: { ...prev.rules, blockadesEnabled: !prev.rules.blockadesEnabled },
                }));
              }}
              className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                gameState.rules.blockadesEnabled
                  ? 'bg-red-950/70 border-red-500/60 text-red-300'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-400'
              }`}
              title="African Home Rule: 2 friendly tokens form an impassable blockade/stool"
            >
              <span className="text-xs">🛡️</span>
              <span className="hidden md:inline">
                {gameState.rules.blockadesEnabled ? 'Blockades: Active' : 'Blockades: Disabled'}
              </span>
            </button>

            {/* Yard Release Toggle */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setGameState((prev) => ({
                  ...prev,
                  rules: { ...prev.rules, releaseOnSixOrOne: !prev.rules.releaseOnSixOrOne },
                }));
              }}
              className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                gameState.rules.releaseOnSixOrOne
                  ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-400'
              }`}
              title="African Home Rule: Roll 6 only vs 1 or 6 to release from yard"
            >
              <Wind className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">
                {gameState.rules.releaseOnSixOrOne ? 'Release: 1 or 6' : 'Release: 6 Only'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowSetupModal(true)}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Match Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Safe Reset Match Action in Header */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setShowResetConfirmModal(true);
              }}
              className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-red-950/80 hover:border-red-600/60 border border-neutral-700/80 text-neutral-300 hover:text-red-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm group"
              title="Safely reset or restart match"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400 group-hover:text-red-400" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              type="button"
              onClick={handleToggleSound}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute' : 'Unmute'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-500" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setGalleryColor(activePlayer?.color || 'red');
                setShowGalleryModal(true);
              }}
              className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900 border border-amber-500/60 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="View African Animal Pictures & Royal Crest Gallery"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Pictures</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRulesModal(true)}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="African Home Ludo Rules"
            >
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Screen */}
      <main className="flex-1 min-h-0 max-w-2xl w-full mx-auto px-2 sm:px-4 py-1 flex flex-col items-center justify-center gap-1 sm:gap-1.5 overflow-hidden">
        {/* African Chop Alert Banner (Fixed 28px height prevents layout shift) */}
        <div className="w-full max-w-[min(480px,94vw)] h-7 min-h-7 max-h-7 shrink-0 flex items-center justify-center overflow-hidden">
          {gameState.chopAlert ? (
            <div className="w-full h-full px-3 rounded-lg bg-red-950/90 border border-red-500/80 flex items-center justify-center gap-1.5 text-xs text-red-200 font-bold shadow-md shadow-red-950/80">
              <span>💥</span>
              <span className="truncate leading-none">{gameState.chopAlert.message}</span>
            </div>
          ) : (
            <div className="w-full h-full px-3 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-center justify-center text-[11px] text-neutral-400">
              <span className="truncate leading-none">
                {gameState.rules.mustKillToEnterHome
                  ? '🌍 African Home Rules: Must chop at least 1 opponent seed to unlock home corridor!'
                  : '🎲 Classic Ludo Rules Active'}
              </span>
            </div>
          )}
        </div>

        {/* Players Status Ribbon - Shows Kills & Home Lock Status */}
        <div className="w-full max-w-[min(480px,94vw)] h-14 shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
          {gameState.players.map((p, idx) => {
            const isActive = idx === gameState.activePlayerIndex;
            const isWinner = gameState.winners.includes(p.color);
            const homeTokensCount = p.tokens.filter((t) => t.isHome).length;
            const emblem = LUDO_EMBLEMS[p.color];

            return (
              <div
                key={p.color}
                className={`px-2 py-1 rounded-xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-neutral-800/90 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                    : 'bg-[#181818] border-neutral-800/70 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-1.5 text-left min-w-0 select-none"
                    title={`${emblem.name} · ${p.name}`}
                  >
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full overflow-hidden border border-amber-400/80 shadow shrink-0">
                      <img
                        src={emblem.image}
                        alt={emblem.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs font-bold text-neutral-200 truncate max-w-[60px] sm:max-w-[75px]">
                      {p.name}
                    </span>
                  </div>
                  {p.isBot && <Bot className="w-3 h-3 text-neutral-500 shrink-0" />}
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  {/* Home lock status */}
                  <span
                    className={`font-semibold flex items-center gap-0.5 ${
                      p.hasKilled ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                    title={p.hasKilled ? 'Home unlocked!' : 'Must chop 1 opponent to unlock home!'}
                  >
                    {p.hasKilled ? '🔓 Open' : '🔒 Lock'}
                    <span className="text-neutral-500 font-normal">({p.kills}k)</span>
                  </span>

                  <span className="font-mono font-bold text-neutral-200">
                    {isWinner ? '🏆 Won' : `${homeTokensCount}/4`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Board - Anchored viewport dimensions */}
        {/* Board - Anchored viewport dimensions */}
        <div className="shrink-0 flex items-center justify-center p-0.5 overflow-hidden">
          <LudoBoard
            players={gameState.players}
            activePlayerIndex={gameState.activePlayerIndex}
            movableTokens={gameState.movableTokens}
            canSelectToken={!gameState.isRolling && gameState.diceValue !== null}
            rules={gameState.rules}
            onSelectToken={(tid) => handleSelectToken(tid)}
          />
        </div>

        {/* Tactical Move Option Chooser for African Home Ludo */}
        {pendingMoveChoices && (
          <div className="w-full max-w-[min(480px,94vw)] bg-gradient-to-r from-amber-950/95 via-neutral-900 to-amber-950/95 border-2 border-amber-500/80 rounded-2xl p-2.5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                <span>⚔️</span>
                <span>Select Seed #{pendingMoveChoices.tokenId + 1} Action</span>
              </span>
              <button
                type="button"
                onClick={() => setPendingMoveChoices(null)}
                className="text-[11px] font-medium text-neutral-400 hover:text-white px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {pendingMoveChoices.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectToken(pendingMoveChoices.tokenId, opt)}
                  className="w-full text-left p-2 rounded-xl bg-neutral-800/90 hover:bg-amber-600/30 border border-neutral-700 hover:border-amber-400 text-xs text-neutral-200 hover:text-white transition-all cursor-pointer flex items-center justify-between gap-2 group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">
                      {opt.moveType === 'home_raid' ? '⚡' : opt.moveType === 'reverse_chop' ? '⚔️' : '➡️'}
                    </span>
                    <span className="font-semibold truncate">{opt.label}</span>
                  </div>
                  {opt.badge && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {opt.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Controls & Dice Area */}
        <div className="w-full max-w-[min(480px,94vw)] h-15 shrink-0 bg-[#1a1a1a] border border-neutral-800 rounded-2xl px-3 py-1.5 flex items-center justify-between gap-3 shadow-xl">
          {/* Turn Message */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              {activePlayer && (
                <div
                  className="w-6 h-6 rounded-full overflow-hidden border-2 border-amber-400 shadow-md shrink-0 pointer-events-none select-none"
                  title={`${LUDO_EMBLEMS[activePlayer.color].name}`}
                >
                  <img
                    src={LUDO_EMBLEMS[activePlayer.color].image}
                    alt={LUDO_EMBLEMS[activePlayer.color].name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider truncate">
                {activePlayer ? `${activePlayer.name} · ${LUDO_EMBLEMS[activePlayer.color].animal}` : ''}
              </span>
            </div>
            <p className="text-xs font-medium text-neutral-300 leading-snug truncate">
              {gameState.statusMessage}
            </p>
          </div>

          {/* Dice & Roll Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Dice
              value={gameState.diceValue}
              isRolling={gameState.isRolling}
              canRoll={gameState.canRoll && !activePlayer.isBot}
              onRoll={handleRollDice}
              colorTheme={activePlayer ? getPlayerBadgeColor(activePlayer.color) : undefined}
            />

            {!activePlayer.isBot && gameState.canRoll && (
              <button
                type="button"
                onClick={handleRollDice}
                disabled={gameState.isRolling}
                className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Roll</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Bar: Safe Match Activity Log & Status (Safely removed destructive reset button from under dice) */}
        <div className="w-full max-w-[min(480px,94vw)] flex items-center justify-between text-xs text-neutral-400 px-3 py-1 bg-neutral-900/50 rounded-xl border border-neutral-800/60">
          <span className="truncate flex items-center gap-1.5 text-neutral-300 max-w-[340px]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="truncate">{gameState.historyLog[0] || 'African Home Ludo in progress'}</span>
          </span>
          <span className="text-[11px] text-neutral-500 font-mono shrink-0">
            Turn #{gameState.historyLog.length + 1}
          </span>
        </div>
      </main>

      {/* Match Setup Modal */}
      <LudoSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onStartMatch={handleStartMatch}
      />

      {/* African Home Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#1c140d] border-2 border-amber-950/80 rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-amber-950/70 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌍</span>
                <div>
                  <h3 className="text-lg font-bold text-amber-200">African Home Ludo Rules</h3>
                  <p className="text-[11px] text-amber-400/80 font-mono">Traditional Ghana & Nigeria House Rules</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-300 pr-1">
              {/* African Wildlife & Picture Kingdoms Showcase Strip */}
              <div className="p-3 bg-neutral-900/90 rounded-2xl border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    African Animal Kingdoms & Pictures
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRulesModal(false);
                      setShowGalleryModal(true);
                    }}
                    className="text-[10px] text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    View Full Art Gallery →
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(['red', 'green', 'yellow', 'blue'] as const).map((col) => {
                    const item = LUDO_EMBLEMS[col];
                    return (
                      <div
                        key={col}
                        onClick={() => {
                          setGalleryColor(col);
                          setShowRulesModal(false);
                          setShowGalleryModal(true);
                        }}
                        className="flex flex-col items-center p-1.5 rounded-xl bg-black/60 border border-amber-950/80 cursor-pointer hover:border-amber-400 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-amber-400/70 shadow mb-1">
                          <img
                            src={item.image}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[9px] font-bold text-neutral-200 text-center leading-tight truncate w-full">
                          {item.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 1. No Two Opponents in One Box */}
              <div className="p-3 bg-neutral-900/90 rounded-2xl border border-red-500/50">
                <h4 className="font-bold text-red-300 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span>⚔️</span>
                  1. No Two Opponents In One Box — One Sent To Yard!
                </h4>
                <p className="text-neutral-300 leading-relaxed">
                  In authentic African Home Ludo, <strong className="text-amber-300">no two different opponent seeds can ever share a single box</strong>. Whenever you land on an opponent, they are immediately chopped and sent back to their Yard! Star squares do not protect enemies from each other. The only tokens that can share a box are friendly seeds of the same color forming an impenetrable blockade.
                </p>
              </div>

              {/* 2. No Opponents In Home Row */}
              <div className="p-3 bg-neutral-900/90 rounded-2xl border border-amber-500/50">
                <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span>🏰</span>
                  2. Exclusive Home Row (No Opponents Stay in Home Line)
                </h4>
                <p className="text-neutral-300 leading-relaxed">
                  A player&apos;s colored home corridor is strictly private to their realm. <strong className="text-amber-300">No two different opponents can ever stay in one home row</strong>. If a player executes a lightning Home Raid to chop a sitting enemy, they chop the seed back to the yard and immediately return to the track entrance to continue their journey!
                </p>
              </div>

              {/* 3. Reverse Chop & Journey Choice */}
              <div className="p-3 bg-neutral-900/90 rounded-2xl border border-emerald-500/50">
                <h4 className="font-bold text-emerald-300 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span>🔄</span>
                  3. Reverse Chop & Journey Choice (Home vs. Annual Journey)
                </h4>
                <p className="text-neutral-300 leading-relaxed">
                  When you count backwards by the dice roll to chop an enemy to their yard, <strong className="text-amber-300">you put your seed at that exact place</strong>. From that place, your seed continues its journey with an earned bonus roll! When approaching the home entrance, you can tactically choose between <strong className="text-white">Continue to Home</strong> or embark on the <strong className="text-white">Annual Journey (shortcut track lap)</strong> to hunt enemies and block opponents!
                </p>
              </div>

              {/* 4. Must Kill (Chop) Rule */}
              <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800">
                <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  4. Must Chop to Unlock Home Corridor
                </h4>
                <p className="text-neutral-300 leading-relaxed">
                  Before any of your seeds are permitted to turn into your home corridor, you <strong className="text-amber-300">must chop at least 1 opponent seed</strong>! If home is locked, your seed must make another lap around the outer track until you score a kill.
                </p>
              </div>

              {/* 5. Blockades (Pairs / African Stools) */}
              <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800">
                <h4 className="font-bold text-neutral-300 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span>🛡️</span>
                  5. African Blockades (Stools)
                </h4>
                <p className="text-neutral-300 leading-relaxed">
                  Two seeds of the same color on a square form an impenetrable roadblock. Opponents cannot leap over or land on it.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition-colors cursor-pointer"
            >
              Back to Match
            </button>
          </div>
        </div>
      )}

      {/* Game Over / Winner Podium Modal */}
      {gameState.gameOver && gameState.winners.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1c140d] border-2 border-amber-500/60 rounded-3xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Winner Animal Picture Emblem */}
            {gameState.winners[0] && (
              <div className="relative w-24 h-24 mx-auto rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl group">
                <img
                  src={LUDO_EMBLEMS[gameState.winners[0]].image}
                  alt={LUDO_EMBLEMS[gameState.winners[0]].name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[10px] font-black text-amber-300 uppercase py-0.5">
                  {LUDO_EMBLEMS[gameState.winners[0]].animal}
                </span>
              </div>
            )}

            <div>
              <h2 className="text-2xl font-black tracking-wide text-amber-200">MATCH FINISHED!</h2>
              <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mt-1">
                {gameState.players.find((p) => p.color === gameState.winners[0])?.name} ({LUDO_EMBLEMS[gameState.winners[0]].title}) Wins!
              </p>
            </div>

            {/* Podium */}
            <div className="space-y-2 bg-neutral-900/90 p-3 rounded-2xl border border-amber-950 text-xs">
              {gameState.winners.map((color, idx) => {
                const player = gameState.players.find((p) => p.color === color);
                const emblem = LUDO_EMBLEMS[color];
                const medals = ['🥇 1st Place', '🥈 2nd Place', '🥉 3rd Place', '4th Place'];
                return (
                  <div
                    key={color}
                    className="flex items-center justify-between p-2 rounded-xl bg-neutral-800/60 font-semibold text-neutral-200"
                  >
                    <span className="text-amber-300 font-bold">{medals[idx] || `${idx + 1}th`}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full overflow-hidden border border-amber-400/80 shadow shrink-0">
                        <img
                          src={emblem.image}
                          alt={emblem.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="capitalize">{player?.name} ({emblem.animal})</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-2.5">
              <AdBanner320x50 className="py-1" />
              <button
                type="button"
                onClick={handleRestart}
                className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition-colors cursor-pointer shadow-lg shadow-amber-950/40"
              >
                Play Again
              </button>
              <button
                type="button"
                onClick={onBackToHub}
                className="w-full py-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Return to Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Picture Gallery Showcase Modal */}
      {showGalleryModal && (
        <LudoGalleryModal
          initialColor={galleryColor}
          onClose={() => setShowGalleryModal(false)}
        />
      )}

      {/* Safe Reset Confirmation Modal */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c140d] border-2 border-amber-900/60 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-950/90 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0 shadow-inner">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-100">Restart Match?</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Current game progress, captures, and token positions will restart from the beginning.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-amber-950/60">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setShowResetConfirmModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirmModal(false);
                  handleRestart();
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-red-950/60"
              >
                Yes, Restart Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
