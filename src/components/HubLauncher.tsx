import React, { useState } from 'react';
import {
  LayoutDashboard,
  Crown,
  Dices,
  ChevronRight,
  Bot,
  Users,
  Volume2,
  VolumeX,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { LUDO_EMBLEMS } from '../utils/ludoPictures';
import { getRewardSmartLink } from '../utils/rewardLink';

interface HubLauncherProps {
  onLaunchCheckers: (mode: 'online_pve' | 'offline_pvp', size?: 8 | 10) => void;
  onLaunchLudo: () => void;
}

export const HubLauncher: React.FC<HubLauncherProps> = ({
  onLaunchCheckers,
  onLaunchLudo,
}) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sounds.isEnabled());
  const [checkersMenuOpen, setCheckersMenuOpen] = useState<boolean>(false);
  const [checkersSize, setCheckersSize] = useState<8 | 10>(10);

  const handleToggleSound = () => {
    const next = sounds.toggleSound();
    setSoundEnabled(next);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-neutral-100 flex flex-col justify-between selection:bg-red-500/30 selection:text-white">
      {/* Top Header / Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-neutral-900/60 max-w-2xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold tracking-wider text-neutral-400">
            OFFLINE READY · COMMERCIAL ENGINE
          </span>
        </div>

        <button
          type="button"
          onClick={handleToggleSound}
          className="p-2 rounded-xl bg-[#1e1e1e] hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          title={soundEnabled ? 'Mute' : 'Enable Sound'}
          aria-label="Toggle Sound"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-neutral-500" />
          )}
        </button>
      </header>

      {/* Main Hub Content */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 max-w-xl w-full mx-auto space-y-8">
        {/* Hub Header & Logo */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-500/20 to-amber-700/5 border border-amber-500/30 flex items-center justify-center shadow-xl shadow-amber-500/5">
            <LayoutDashboard className="w-10 h-10 text-amber-400" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white pt-2">
            BOARD GAME HUB
          </h1>

          <p className="text-xs font-bold tracking-[0.25em] text-red-500 uppercase">
            OFFLINE PRO COLLECTION
          </p>

          <p className="text-xs text-neutral-400 italic pt-1">
            No Sign-In Required • Pure Gaming • Instant Play
          </p>
        </div>

        {/* Game Cards List */}
        <div className="w-full space-y-4">
          {/* GAME 1: CHECKERS PRO */}
          <div className="rounded-2xl bg-[#1e1e1e] border border-neutral-800/80 hover:border-red-500/50 transition-all overflow-hidden shadow-xl">
            <div
              onClick={() => {
                sounds.playClick();
                setCheckersMenuOpen(!checkersMenuOpen);
              }}
              className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-800/40 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-700/60 flex items-center justify-center text-2xl shadow-inner shrink-0">
                  👑
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                    CHECKERS PRO (AFRICAN DAM)
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                    10×10 & 8×8 • Flying Kings • Backward captures • Deep Lookahead AI
                  </p>
                </div>
              </div>

              <ChevronRight
                className={`w-5 h-5 text-red-500 transition-transform duration-200 shrink-0 ${
                  checkersMenuOpen ? 'rotate-90' : ''
                }`}
              />
            </div>

            {/* Expanded Sub-modes for Checkers */}
            {checkersMenuOpen && (
              <div className="px-4 pb-4 pt-2 border-t border-neutral-800/60 bg-neutral-900/60 space-y-3 animate-in fade-in duration-150">
                {/* Board Size Toggle in Hub */}
                <div className="flex items-center justify-between bg-neutral-950/60 p-2 rounded-xl border border-neutral-800">
                  <span className="text-xs font-semibold text-neutral-300">Board Size:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setCheckersSize(10);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        checkersSize === 10
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-neutral-850 text-neutral-400 hover:text-white'
                      }`}
                    >
                      10×10 (Dam)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setCheckersSize(8);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        checkersSize === 8
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-neutral-850 text-neutral-400 hover:text-white'
                      }`}
                    >
                      8×8 (Classic)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onLaunchCheckers('online_pve', checkersSize);
                    }}
                    className="p-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-md shadow-red-950/40"
                  >
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      <span>VS DEEP AI ({checkersSize}×{checkersSize})</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onLaunchCheckers('offline_pvp', checkersSize);
                    }}
                    className="p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center justify-between border border-neutral-700 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>2-PLAYER PASS & PLAY</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* GAME 2: AFRICAN HOME LUDO */}
          <div
            onClick={() => {
              sounds.playClick();
              onLaunchLudo();
            }}
            className="p-4 sm:p-5 rounded-2xl bg-[#1e1e1e] border border-neutral-800/80 hover:border-amber-500/50 transition-all flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-800/40 shadow-xl group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/60 overflow-hidden shadow-inner shrink-0 relative">
                <img
                  src={LUDO_EMBLEMS.red.image}
                  alt="African Home Ludo Art"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-white tracking-wide group-hover:text-amber-300 transition-colors">
                    AFRICAN HOME LUDO
                  </h2>
                  <span className="text-[9px] bg-amber-950/90 text-amber-300 border border-amber-500/50 px-1.5 py-0.5 rounded font-mono font-bold">
                    ART EDITION
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                  Ghana & Nigeria house rules • Illustrated Lion, Leopard, Cheetah, Elephant & Royal Crest
                </p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-amber-500 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>
        </div>

        {/* Feature Highlights Pills */}
        <div className="grid grid-cols-3 gap-2 w-full text-center">
          <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
            <span className="block text-xs font-bold text-neutral-300">African Dam</span>
            <span className="text-[10px] text-neutral-500">10×10 & Stool Huff</span>
          </div>
          <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
            <span className="block text-xs font-bold text-amber-300">African Ludo</span>
            <span className="text-[10px] text-neutral-400">Locked Home & Chops</span>
          </div>
          <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
            <span className="block text-xs font-bold text-neutral-300">Deep AI</span>
            <span className="text-[10px] text-neutral-500">Tactical Search</span>
          </div>
        </div>

        {/* Online Daily Reward / Unlock Pro Theme Smart Link */}
        <a
          href={getRewardSmartLink()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sounds.playClick()}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600/20 via-amber-500/15 to-amber-600/20 hover:from-amber-600/35 hover:to-amber-500/30 border border-amber-500/40 hover:border-amber-400/70 text-amber-200 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <span>🎁 Online Daily Reward / Unlock Pro Theme</span>
        </a>
      </main>

      {/* Commercial Build Footer */}
      <footer className="py-4 text-center text-neutral-500 text-[11px] font-mono border-t border-neutral-900/60">
        Secure Commercial Build v4.0.0
      </footer>
    </div>
  );
};
