/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HubLauncher } from './components/HubLauncher';
import { CheckersMainMenu } from './components/checkers/CheckersMainMenu';
import { CheckersGame } from './components/checkers/CheckersGame';
import { LudoGame } from './components/ludo/LudoGame';
import { OfflinePassGate } from './components/OfflinePassGate';

type AppView = 'hub' | 'checkers_menu' | 'checkers_game' | 'ludo_game';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('hub');
  const [checkersMode, setCheckersMode] = useState<'online_pve' | 'offline_pvp'>('online_pve');
  const [checkersSize, setCheckersSize] = useState<8 | 10>(10);

  const handleLaunchCheckersDirect = (mode: 'online_pve' | 'offline_pvp', size?: 8 | 10) => {
    setCheckersMode(mode);
    if (size) setCheckersSize(size);
    setCurrentView('checkers_game');
  };

  const handleOpenCheckersMenu = () => {
    setCurrentView('checkers_menu');
  };

  const handleLaunchLudo = () => {
    setCurrentView('ludo_game');
  };

  const handleBackToHub = () => {
    setCurrentView('hub');
  };

  const renderView = () => {
    switch (currentView) {
      case 'checkers_menu':
        return (
          <CheckersMainMenu
            onSelectMode={(mode, size) => {
              setCheckersMode(mode);
              setCheckersSize(size);
              setCurrentView('checkers_game');
            }}
            onBack={handleBackToHub}
          />
        );

      case 'checkers_game':
        return (
          <CheckersGame
            initialMode={checkersMode}
            initialBoardSize={checkersSize}
            onBackToHub={handleBackToHub}
          />
        );

      case 'ludo_game':
        return <LudoGame onBackToHub={handleBackToHub} />;

      case 'hub':
      default:
        return (
          <HubLauncher
            onLaunchCheckers={handleLaunchCheckersDirect}
            onLaunchLudo={handleLaunchLudo}
          />
        );
    }
  };

  return (
    <div className="w-full h-full max-h-full overflow-hidden flex flex-col bg-[#121212]">
      <OfflinePassGate>{renderView()}</OfflinePassGate>
    </div>
  );
}
