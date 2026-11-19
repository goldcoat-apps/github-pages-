import React, { useEffect, useState } from 'react';
import { sounds } from '../../utils/audio';

interface DiceProps {
  value: number | null;
  isRolling: boolean;
  canRoll: boolean;
  onRoll: () => void;
  colorTheme?: string;
}

export const Dice: React.FC<DiceProps> = ({
  value,
  isRolling,
  canRoll,
  onRoll,
  colorTheme = 'from-red-600 to-red-700',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value || 1);
  const [tumbleDeg, setTumbleDeg] = useState<number>(0);

  // Animate through random faces and play tumble ticks while rolling
  useEffect(() => {
    if (!isRolling) {
      if (value) {
        setDisplayValue(value);
      }
      setTumbleDeg(0);
      return;
    }

    const interval = setInterval(() => {
      const nextFace = Math.floor(Math.random() * 6) + 1;
      setDisplayValue(nextFace);
      setTumbleDeg((prev) => prev + (Math.random() > 0.5 ? 90 : -90));
    }, 70);

    return () => clearInterval(interval);
  }, [isRolling, value]);

  // Dot coordinates for standard 6-sided die with embossed ivory 3D look
  const renderDots = (num: number) => {
    switch (num) {
      case 1:
        return (
          <div className="flex items-center justify-center w-full h-full">
            <span className="w-5 h-5 rounded-full bg-amber-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),0_1px_2px_rgba(255,255,255,0.4)] ring-2 ring-red-600" />
          </div>
        );
      case 2:
        return (
          <div className="flex justify-between w-full h-full p-2.5">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)] self-start" />
            <span className="w-3.5 h-3.5 rounded-full bg-amber-50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)] self-end" />
          </div>
        );
      case 3:
        return (
          <div className="flex justify-between w-full h-full p-2">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)] self-start" />
            <span className="w-3.5 h-3.5 rounded-full bg-amber-50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)] self-center" />
            <span className="w-3.5 h-3.5 rounded-full bg-amber-50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)] self-end" />
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-2 gap-3 w-full h-full p-2.5 items-center justify-items-center">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)]" />
            <span className="w-3.5 h-3.5 rounded-full bg-amber-50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)]" />
            <span className="w-3.5 h-3.5 rounded-full bg-amber-50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)]" />
            <span className="w-3.5 h-3.5 rounded-full bg-amber-50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)]" />
          </div>
        );
      case 5:
        return (
          <div className="relative w-full h-full p-2">
            <div className="grid grid-cols-2 gap-3 w-full h-full items-center justify-items-center">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)]" />
              <span className="w-3.5 h-3.5 rounded-full bg-amber-50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)]" />
              <span className="w-3.5 h-3.5 rounded-full bg-amber-50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)]" />
              <span className="w-3.5 h-3.5 rounded-full bg-amber-50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)]" />
            </div>
            <span className="absolute inset-0 m-auto w-3.5 h-3.5 rounded-full bg-amber-50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)]" />
          </div>
        );
      case 6:
        return (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 w-full h-full p-2 items-center justify-items-center">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-300 shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)] ring-1 ring-amber-400" />
            <span className="w-3.5 h-3.5 rounded-full bg-amber-300 shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)] ring-1 ring-amber-400" />
            <span className="w-3.5 h-3.5 rounded-full bg-amber-300 shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)] ring-1 ring-amber-400" />
            <span className="w-3.5 h-3.5 rounded-full bg-amber-300 shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)] ring-1 ring-amber-400" />
            <span className="w-3.5 h-3.5 rounded-full bg-amber-300 shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)] ring-1 ring-amber-400" />
            <span className="w-3.5 h-3.5 rounded-full bg-amber-300 shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)] ring-1 ring-amber-400" />
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center w-full h-full text-white/80 text-xs font-black uppercase tracking-wider">
            <span>🎲</span>
            <span className="text-[10px] mt-0.5">Roll</span>
          </div>
        );
    }
  };

  return (
    <button
      type="button"
      onClick={onRoll}
      disabled={!canRoll || isRolling}
      aria-label="Roll Dice"
      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1 bg-gradient-to-br ${colorTheme} border-2 border-white/40 shadow-2xl transition-all duration-150 flex items-center justify-center cursor-pointer select-none ${
        canRoll && !isRolling
          ? 'hover:scale-105 active:scale-95 ring-4 ring-amber-400 ring-offset-2 ring-offset-black shadow-[0_0_20px_rgba(251,191,36,0.8)] animate-bounce'
          : 'opacity-95'
      } ${isRolling ? 'scale-105 shadow-[0_0_25px_rgba(251,191,36,1)]' : ''}`}
      style={{
        transform: isRolling ? `rotate(${tumbleDeg}deg) scale(0.96)` : undefined,
        transition: isRolling ? 'transform 0.07s ease-in-out' : 'transform 0.15s ease-out',
      }}
    >
      {/* 3D Dice Face Inset */}
      <div className="w-full h-full rounded-xl bg-black/40 flex items-center justify-center backdrop-blur-[2px] border border-white/30 shadow-inner relative overflow-hidden">
        {renderDots(isRolling ? displayValue : value || 0)}

        {/* Rolling overlay sheen */}
        {isRolling && (
          <div className="absolute inset-0 bg-white/10 pointer-events-none animate-pulse" />
        )}
      </div>

      {/* Floating prompt badge when ready to roll */}
      {canRoll && !isRolling && (
        <span className="absolute -top-2.5 -right-2 bg-amber-400 text-black text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full shadow-lg border border-black/40 leading-none">
          ROLL!
        </span>
      )}
    </button>
  );
};
