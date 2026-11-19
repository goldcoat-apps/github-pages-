import React, { useState } from 'react';
import { LudoMatchConfig, LudoRulesConfig, PlayerColor } from '../../types/ludo';
import { DEFAULT_AFRICAN_LUDO_RULES, CLASSIC_INTERNATIONAL_LUDO_RULES } from '../../utils/ludoEngine';
import { Bot, User, Play, Users, Shield, Zap, Wind } from 'lucide-react';
import { sounds } from '../../utils/audio';
import { LUDO_EMBLEMS } from '../../utils/ludoPictures';

interface LudoSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMatch: (config: LudoMatchConfig) => void;
}

export const LudoSetupModal: React.FC<LudoSetupModalProps> = ({
  isOpen,
  onClose,
  onStartMatch,
}) => {
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2);
  const [rules, setRules] = useState<LudoRulesConfig>(DEFAULT_AFRICAN_LUDO_RULES);
  const [players, setPlayers] = useState([
    { color: 'red' as PlayerColor, name: 'Player 1', isBot: false },
    { color: 'green' as PlayerColor, name: 'Bot 1', isBot: true },
    { color: 'yellow' as PlayerColor, name: 'Player 2', isBot: false },
    { color: 'blue' as PlayerColor, name: 'Bot 2', isBot: true },
  ]);

  if (!isOpen) return null;

  const handleToggleBot = (index: number) => {
    sounds.playClick();
    setPlayers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, isBot: !p.isBot } : p))
    );
  };

  const handleNameChange = (index: number, name: string) => {
    setPlayers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, name } : p))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();

    // Select colors based on playerCount
    let activePlayers = players.slice(0, playerCount);
    if (playerCount === 2) {
      // Classic 2-player opposite corners: Red & Yellow
      activePlayers = [
        players[0], // Red
        players[2], // Yellow
      ];
    }

    onStartMatch({
      playerCount,
      players: activePlayers,
      rules,
    });
  };

  const colorLabels: Record<PlayerColor, { text: string; bg: string }> = {
    red: { text: 'Red', bg: 'bg-red-500' },
    green: { text: 'Green', bg: 'bg-emerald-500' },
    yellow: { text: 'Yellow', bg: 'bg-amber-500' },
    blue: { text: 'Blue', bg: 'bg-blue-500' },
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#1c140d] border-2 border-amber-950/90 rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-amber-950/70 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌍</span>
            <div>
              <h3 className="text-lg font-bold text-amber-200">African Home Ludo Setup</h3>
              <p className="text-[11px] text-amber-400/80 font-mono">Traditional House & Street Rules</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rule Presets */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Rule Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setRules(DEFAULT_AFRICAN_LUDO_RULES);
                }}
                className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                  rules.mustKillToEnterHome && rules.blockadesEnabled
                    ? 'bg-amber-950/70 border-amber-500/70 text-amber-200 shadow-md'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <span>🌍</span> African Home Rules
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  Must chop 1 opponent to enter home + blockades
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setRules(CLASSIC_INTERNATIONAL_LUDO_RULES);
                }}
                className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                  !rules.mustKillToEnterHome && !rules.blockadesEnabled
                    ? 'bg-amber-950/70 border-amber-500/70 text-amber-200 shadow-md'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <span>🎲</span> International Classic
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  Open home corridor & standard racing
                </div>
              </button>
            </div>
          </div>

          {/* African Custom Rules Toggles */}
          <div className="p-3 bg-neutral-900/80 rounded-2xl border border-amber-950/60 space-y-2.5">
            <span className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
              African House Rules Config
            </span>

            {/* Must Kill to Enter Home Toggle */}
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  Must Chop to Enter Home (Locked Home)
                </span>
                <span className="text-[10px] text-neutral-400 block">
                  Must kill at least 1 opponent token before entering home corridor
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setRules(r => ({ ...r, mustKillToEnterHome: !r.mustKillToEnterHome }));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  rules.mustKillToEnterHome
                    ? 'bg-amber-900/60 border-amber-500/70 text-amber-200'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-500'
                }`}
              >
                {rules.mustKillToEnterHome ? 'ACTIVE' : 'Disabled'}
              </button>
            </div>

            {/* Blockades Toggle */}
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                  <span>🛡️</span>
                  Blockades (Pairs / African Stools)
                </span>
                <span className="text-[10px] text-neutral-400 block">
                  Two friendly seeds on same tile form an impassable barrier
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setRules(r => ({ ...r, blockadesEnabled: !r.blockadesEnabled }));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  rules.blockadesEnabled
                    ? 'bg-amber-900/60 border-amber-500/70 text-amber-200'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-500'
                }`}
              >
                {rules.blockadesEnabled ? 'ACTIVE' : 'Disabled'}
              </button>
            </div>

            {/* Release from Yard */}
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-emerald-400" />
                  Release from Yard (Opening Roll)
                </span>
                <span className="text-[10px] text-neutral-400 block">
                  Require 6 to release vs either 1 or 6
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setRules(r => ({ ...r, releaseOnSixOrOne: !r.releaseOnSixOrOne }));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  rules.releaseOnSixOrOne
                    ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-300'
                }`}
              >
                {rules.releaseOnSixOrOne ? '1 or 6' : '6 Only'}
              </button>
            </div>

            {/* Reverse Chop Toggle */}
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                  <span>⚔️</span>
                  Reverse Chop (Count Backward to Chop)
                </span>
                <span className="text-[10px] text-neutral-400 block">
                  Count backwards by dice roll to chop opponent seed to yard
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setRules(r => ({ ...r, reverseChopEnabled: !r.reverseChopEnabled }));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  rules.reverseChopEnabled
                    ? 'bg-amber-900/60 border-amber-500/70 text-amber-200'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-500'
                }`}
              >
                {rules.reverseChopEnabled ? 'ACTIVE' : 'Disabled'}
              </button>
            </div>

            {/* Home Line Raid Toggle */}
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                  <span>⚡</span>
                  Home Line Raid
                </span>
                <span className="text-[10px] text-neutral-400 block">
                  Raid opponent home corridor, chop seed, and return to track
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setRules(r => ({ ...r, homeLineRaidEnabled: !r.homeLineRaidEnabled }));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  rules.homeLineRaidEnabled
                    ? 'bg-amber-900/60 border-amber-500/70 text-amber-200'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-500'
                }`}
              >
                {rules.homeLineRaidEnabled ? 'ACTIVE' : 'Disabled'}
              </button>
            </div>
          </div>

          {/* Player Count Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Number of Players
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([2, 3, 4] as const).map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setPlayerCount(count);
                  }}
                  className={`py-2.5 rounded-xl font-bold text-sm border transition-all cursor-pointer ${
                    playerCount === count
                      ? 'bg-amber-700 text-white border-amber-500 shadow-md'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {count} Players
                </button>
              ))}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1.5 italic">
              {playerCount === 2 ? 'Opposite corners: Red vs Yellow match.' : `${playerCount} active colors.`}
            </p>
          </div>

          {/* Player List & Config */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Player Slots & Control
            </label>
            {(playerCount === 2 ? [players[0], players[2]] : players.slice(0, playerCount)).map((p) => {
              const originalIndex = players.findIndex((orig) => orig.color === p.color);
              const emblem = LUDO_EMBLEMS[p.color];
              return (
                <div
                  key={p.color}
                  className="flex items-center justify-between gap-3 p-2 bg-neutral-900 rounded-xl border border-neutral-800"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-400/80 shadow shrink-0">
                      <img
                        src={emblem.image}
                        alt={emblem.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={p.name}
                        maxLength={14}
                        onChange={(e) => handleNameChange(originalIndex, e.target.value)}
                        className="bg-transparent text-sm font-semibold text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded px-1 py-0.5 w-full"
                      />
                      <span className="text-[10px] text-amber-400/80 font-mono block px-1 -mt-0.5 truncate">
                        {emblem.name} · {emblem.title}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleBot(originalIndex)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      p.isBot
                        ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-200'
                    }`}
                  >
                    {p.isBot ? (
                      <>
                        <Bot className="w-3.5 h-3.5" />
                        AI Bot
                      </>
                    ) : (
                      <>
                        <User className="w-3.5 h-3.5" />
                        Human
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/60 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              Start African Home Match
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
