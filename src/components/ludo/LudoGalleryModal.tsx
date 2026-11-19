import React, { useState } from 'react';
import { PlayerColor } from '../../types/ludo';
import { LUDO_EMBLEMS, LUDO_CENTER_CREST } from '../../utils/ludoPictures';
import { X, Sparkles, Shield, ChevronLeft, ChevronRight } from 'lucide-react';

interface LudoGalleryModalProps {
  initialColor?: PlayerColor;
  onClose: () => void;
}

export const LudoGalleryModal: React.FC<LudoGalleryModalProps> = ({
  initialColor = 'red',
  onClose,
}) => {
  const items = [
    { type: 'color' as const, ...LUDO_EMBLEMS.red },
    { type: 'color' as const, ...LUDO_EMBLEMS.green },
    { type: 'color' as const, ...LUDO_EMBLEMS.yellow },
    { type: 'color' as const, ...LUDO_EMBLEMS.blue },
    {
      type: 'center' as const,
      color: 'yellow' as PlayerColor,
      animal: 'Royal Victory Crest',
      name: LUDO_CENTER_CREST.name,
      title: LUDO_CENTER_CREST.title,
      realm: 'The 4 Kingdoms Throne',
      emoji: '👑',
      image: LUDO_CENTER_CREST.image,
      accentColor: '#f59e0b',
    },
  ];

  const initialIndex = items.findIndex((i) => i.type === 'color' && i.color === initialColor);
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex >= 0 ? initialIndex : 0);

  const current = items[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#1c140d] border-2 border-amber-950/90 rounded-3xl max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-950/70 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🖼️</span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-amber-200">
                Ludo Board Art & Pictures
              </h3>
              <p className="text-[11px] text-amber-400/80 font-mono">
                African Wildlife & Royal Kingdoms Collection
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 cursor-pointer"
            aria-label="Close Gallery"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Artwork Showcase */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-amber-900/60 shadow-2xl bg-black aspect-square max-h-[340px] sm:max-h-[380px] w-full mx-auto flex items-center justify-center group">
          <img
            src={current.image}
            alt={current.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />

          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer"
            aria-label="Previous artwork"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer"
            aria-label="Next artwork"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Bottom Caption Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex items-end justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{current.emoji}</span>
                <span className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wide">
                  {current.name}
                </span>
              </div>
              <p className="text-[11px] text-neutral-300 font-medium">{current.title}</p>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40">
              {currentIndex + 1} / {items.length}
            </span>
          </div>
        </div>

        {/* Thumbnail Selector Bar */}
        <div className="grid grid-cols-5 gap-2 pt-1">
          {items.map((item, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow-md'
                    : 'border-neutral-800 opacity-60 hover:opacity-100'
                }`}
                aria-label={`Select ${item.name}`}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-center font-bold text-white truncate py-0.5">
                  {item.emoji}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-neutral-400 border-t border-amber-950/70 pt-3">
          <span className="flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Illustrated inside each corner yard and token!
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
