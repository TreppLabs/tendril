'use client';

import React, { useEffect } from 'react';
import { PlantCanvas } from '@/components/game/PlantCanvas';
import { GameControls } from '@/components/game/GameControls';
import { useGameStore } from '@/lib/game-engine/game-store';

export default function GamePage() {
  const { initializeGame, growTendril } = useGameStore();

  // Initialize game on first load
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault(); // Prevent page scrolling
        growTendril();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [growTendril]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Tendril</h1>
          <p className="text-gray-600">Grow your plant across the landscape</p>
        </div>

        {/* Game Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Canvas */}
          <div className="lg:col-span-3">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <PlantCanvas
                width={800}
                height={600}
              />
            </div>
          </div>

          {/* Game Controls */}
          <div className="lg:col-span-1">
            <GameControls />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">How to Play</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold mb-2">Basic Controls:</h3>
              <ul className="space-y-1">
                <li>• Click "New Game" to start</li>
                <li>• Allocate points to powers</li>
                <li>• Click "Grow Tendril" or press <strong>Space</strong> to grow</li>
                <li>• Watch your plant grow automatically!</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Powers:</h3>
              <ul className="space-y-1">
                <li>• <strong>Reach:</strong> Increases growth distance</li>
                <li>• <strong>Branching:</strong> Allows creating new tips</li>
                <li>• <strong>Photosynthesis:</strong> More energy per turn</li>
                <li>• <strong>Resilience:</strong> Survive harsh conditions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 