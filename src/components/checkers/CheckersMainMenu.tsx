import React, { useState } from 'react';
import { ArrowLeft, Bot, Users, Grid } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface CheckersMainMenuProps {
  onSelectMode: (mode: 'online_pve' | 'offline_pvp', size: 8 | 10) => void;
  onBack: () => void;
}

export const CheckersMainMenu: React.FC<CheckersMainMenuProps> = ({
  onSelectMode,
  onBack,
}) => {
  const [selectedSize, setSelectedSize] = useState<8 | 10>(10);

  return (
    <div className="min-h-screen bg-[#121212] text-neutral-100 flex flex-col justify-between p-6 max-w-lg mx-auto">
      {/* Top back button */}
      <div>
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onBack();
          }}
          className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Main hero & menu */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-6 my-auto">
        {/* Big circular badge with crown */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff5252] to-[#b71c1c] shadow-2xl shadow-red-950/60 border-2 border-red-400/50 flex items-center justify-center text-5xl">
          👑
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-3xl font-black tracking-wider text-white">CHECKERS PRO</h1>
          <p className="text-xs font-bold tracking-[0.25em] text-red-500 uppercase">
            AFRICAN DAM RULES
          </p>
          <p className="text-xs text-neutral-400 pt-1">
            Flying Kings • Deep Lookahead AI • 1-Piece Left Win
          </p>
        </div>

        {/* Board Size Selector: 10x10 vs 8x8 */}
        <div className="w-full bg-[#181818] border border-neutral-800 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-neutral-300">
            <span className="font-semibold flex items-center gap-1.5 text-amber-400">
              <Grid className="w-4 h-4" /> Board Configuration:
            </span>
            <span className="text-[11px] text-neutral-400">
              {selectedSize === 10 ? '20 pieces per player' : '12 pieces per player'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setSelectedSize(10);
              }}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                selectedSize === 10
                  ? 'bg-red-950/80 border-red-500 text-white shadow-md shadow-red-950/50 ring-1 ring-red-400/60'
                  : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span className="text-sm">10 × 10</span>
              <span className="text-[10px] font-medium text-red-400/90 mt-0.5">Official African Dam</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setSelectedSize(8);
              }}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                selectedSize === 8
                  ? 'bg-red-950/80 border-red-500 text-white shadow-md shadow-red-950/50 ring-1 ring-red-400/60'
                  : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span className="text-sm">8 × 8</span>
              <span className="text-[10px] font-medium text-neutral-400 mt-0.5">Classic Draughts</span>
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full space-y-3 pt-2">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onSelectMode('online_pve', selectedSize);
            }}
            className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-red-900/40 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <Bot className="w-5 h-5" />
            <span>1 VS COMPUTER (DEEP AI · {selectedSize}×{selectedSize})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onSelectMode('offline_pvp', selectedSize);
            }}
            className="w-full h-14 rounded-2xl bg-[#1e1e1e] hover:bg-neutral-800 text-neutral-300 hover:text-white font-bold text-sm tracking-wide border border-neutral-700/80 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <Users className="w-5 h-5" />
            <span>LOCAL 2-PLAYER ({selectedSize}×{selectedSize})</span>
          </button>
        </div>
      </div>

      {/* Footer text */}
      <div className="text-center text-[11px] text-neutral-500 font-mono py-2">
        Tactile Physics · {selectedSize === 10 ? '100 Squares / 20 Men' : '64 Squares / 12 Men'} · Zero Lag
      </div>
    </div>
  );
};

