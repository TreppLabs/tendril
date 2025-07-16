'use client';

import React, { useState } from 'react';
import { useGameStore } from '../../lib/game-engine/game-store';
import { PlantGrowthEngine } from '@/lib/game-engine/plant-growth';

export const GameControls: React.FC = () => {
  const { 
    plantNodes, 
    growingTips, 
    turn, 
    powers, 
    growTendril, 
    allocatePower,
    initializeGame 
  } = useGameStore();

  const [selectedPower, setSelectedPower] = useState<keyof typeof powers>('resilience');

  const handleGrowTendril = () => {
    growTendril();
  };

  const handleAllocatePower = () => {
    allocatePower(selectedPower);
  };

  const handleInitializeGame = () => {
    initializeGame();
  };

  const stats = PlantGrowthEngine.getPlantStats(useGameStore.getState());

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
      {/* Game Info */}
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-800">
        <div>
          <span className="font-semibold">Turn:</span> {turn}
        </div>
        <div>
          <span className="font-semibold">Growing Tips:</span> {growingTips.length}
        </div>
        <div>
          <span className="font-semibold">Total Nodes:</span> {stats.totalNodes}
        </div>
        <div>
          <span className="font-semibold">Total Size:</span> {Math.round(stats.totalLength)}
        </div>
      </div>

      {/* Game Actions */}
      <div className="space-y-4">
        <button
          onClick={handleInitializeGame}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          New Game
        </button>
        
        <button
          onClick={handleGrowTendril}
          className="w-full bg-plant-green text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
        >
          Grow Tendril
        </button>
      </div>

      {/* Power Allocation */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-gray-800">Power Allocation</h3>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-800">
            Select Power to Allocate Point:
          </label>
          <select
            value={String(selectedPower)}
            onChange={(e) => setSelectedPower(e.target.value as keyof typeof powers)}
            className="w-full p-2 border border-gray-300 rounded text-gray-800"
          >
            <option value="growth">Growth: {powers.growth}</option>
            <option value="branchiness">Branchiness: {powers.branchiness}</option>
            <option value="resilience">Resilience: {powers.resilience}</option>
          </select>
        </div>

                  <button
            onClick={handleAllocatePower}
            className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 transition-colors"
          >
            Allocate Point to {String(selectedPower)}
          </button>
      </div>

      {/* Current Powers Display */}
      <div className="bg-gray-50 p-4 rounded">
        <h4 className="font-semibold mb-2 text-gray-800">Current Powers</h4>
        <div className="text-sm space-y-1 text-gray-800">
          <div>Growth: {powers.growth} (Base growth: {2 + powers.growth} units)</div>
          <div>Branchiness: {powers.branchiness} ({powers.branchiness * 10}% chance)</div>
          <div>Resilience: {powers.resilience} (Thickening factor: {0.1 + powers.resilience * 0.05})</div>
        </div>
      </div>
    </div>
  );
}; 