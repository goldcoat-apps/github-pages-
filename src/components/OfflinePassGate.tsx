import React, { useCallback, useEffect, useState } from 'react';
import { LayoutDashboard, WifiOff } from 'lucide-react';
import { sounds } from '../utils/audio';

export const BOARD_HUB_OFFLINE_PASS_KEY = 'board_hub_offline_pass_until';
export const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

type GateStatus = 'checking' | 'offline' | 'unlocked';

function getStoredPassUntil(): number {
  try {
    const raw = localStorage.getItem(BOARD_HUB_OFFLINE_PASS_KEY);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

function grantTwoHourPass(): number {
  const passUntil = Date.now() + TWO_HOURS_MS;
  try {
    localStorage.setItem(BOARD_HUB_OFFLINE_PASS_KEY, String(passUntil));
  } catch {
    // Ignore storage write restriction
  }
  return passUntil;
}

interface OfflinePassGateProps {
  children: React.ReactNode;
}

export const OfflinePassGate: React.FC<OfflinePassGateProps> = ({ children }) => {
  const [status, setStatus] = useState<GateStatus>(() => {
    const passUntil = getStoredPassUntil();
    return Date.now() < passUntil ? 'unlocked' : 'checking';
  });

  const runNetworkCheck = useCallback(async () => {
    const passUntil = getStoredPassUntil();
    if (Date.now() < passUntil) {
      setStatus('unlocked');
      return;
    }

    setStatus('checking');
    try {
      const response = await fetch('/manifest.json?t=' + Date.now(), {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Network check failed');
      }
      await response.json();
      grantTwoHourPass();
      setStatus('unlocked');
    } catch {
      setStatus('offline');
    }
  }, []);

  useEffect(() => {
    const passUntil = getStoredPassUntil();
    if (Date.now() < passUntil) {
      setStatus('unlocked');
      return;
    }

    runNetworkCheck();
  }, [runNetworkCheck]);

  if (status === 'unlocked') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full bg-[#121212] text-neutral-100 flex flex-col items-center justify-center p-5 selection:bg-red-500/30 selection:text-white">
      <div className="w-full max-w-md rounded-3xl bg-[#1e1e1e] border border-neutral-800/90 p-6 sm:p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/5 border border-amber-500/30 flex items-center justify-center shadow-lg">
          {status === 'offline' ? (
            <WifiOff className="w-8 h-8 text-red-400" />
          ) : (
            <LayoutDashboard className="w-8 h-8 text-amber-400" />
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            BOARD GAME HUB
          </h1>
          <p className="text-[11px] font-bold tracking-[0.22em] text-amber-400 uppercase">
            African Dame &amp; African Home Ludo
          </p>
        </div>

        {status === 'checking' && (
          <div className="py-4 space-y-3">
            <div className="w-8 h-8 mx-auto rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin" />
            <p className="text-xs text-neutral-400">Checking offline pass status...</p>
          </div>
        )}

        {status === 'offline' && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-neutral-900/80 border border-red-500/30 p-4">
              <p className="text-sm font-semibold text-neutral-100 leading-relaxed">
                Turn on mobile data briefly to unlock 2 hours of offline play
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                runNetworkCheck();
              }}
              className="w-full py-3.5 px-5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all cursor-pointer shadow-lg shadow-red-950/50"
            >
              🔄 Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
