import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="flex items-center gap-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 px-3 py-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 px-3 py-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-[#1e1e1e] border border-neutral-800 p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-white">Install Board Game Hub</h3>
              <p className="text-xs leading-relaxed text-neutral-300">
                1. Tap the <strong className="text-amber-300">Share</strong> button in Safari&apos;s toolbar.
                <br />
                2. Scroll down and tap <strong className="text-amber-300">Add to Home Screen</strong>.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-neutral-800 hover:bg-neutral-700 py-2.5 text-xs font-bold text-neutral-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
