'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/lib/game-engine/game-store';
import { PlantNode, GrowthAction } from '@/types/game';

interface GameControlsProps {
  selectedNode?: PlantNode;
  onNodeSelect?: (node: PlantNode) => void;
}

export const GameControls: React.FC<GameControlsProps> = ({ 
  selectedNode, 
  onNodeSelect 
}) => {
  const { 
    plantNodes, 
    growingTips, 
    turn, 
    energy, 
    powers, 
    growPlant, 
    allocatePowers, 
    nextTurn,
    initializeGame 
  } = useGameStore();

  const [growthDirection, setGrowthDirection] = useState(0); // radians
  const [growthDistance, setGrowthDistance] = useState(10);
  const [powerAllocation, setPowerAllocation] = useState({
    reach: 0,
    branching: 0,
    photosynthesis: 0,
    resilience: 0,
  });

  const handleGrow = () => {
    if (!selectedNode || !selectedNode.isGrowingTip) {
      alert('Please select a growing tip');
      return;
    }

    const action: GrowthAction = {
      tipId: selectedNode.id,
      direction: growthDirection,
      distance: growthDistance,
    };

    try {
      growPlant(action);
      // Apply power allocation
      if (Object.values(powerAllocation).some(v => v > 0)) {
        allocatePowers(powerAllocation);
        setPowerAllocation({ reach: 0, branching: 0, photosynthesis: 0, resilience: 0 });
      }
    } catch (error) {
      alert(`Growth failed: ${error}`);
    }
  };

  const handleNextTurn = () => {
    nextTurn();
  };

  const handleInitializeGame = () => {
    initializeGame();
  };

  const growingTipNodes = plantNodes.filter(node => node.isGrowingTip);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
      {/* Game Info */}
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-800">
        <div>
          <span className="font-semibold">Turn:</span> {turn}
        </div>
        <div>
          <span className="font-semibold">Energy:</span> {energy}
        </div>
        <div>
          <span className="font-semibold">Growing Tips:</span> {growingTips.length}
        </div>
        <div>
          <span className="font-semibold">Total Nodes:</span> {plantNodes.length}
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
          onClick={handleNextTurn}
          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
        >
          Next Turn
        </button>
      </div>

      {/* Growth Controls */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Growth Controls</h3>
        
        {/* Direction Control */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-800">
            Direction: {Math.round((growthDirection * 180) / Math.PI)}°
          </label>
          <input
            type="range"
            min="0"
            max={2 * Math.PI}
            step={0.1}
            value={growthDirection}
            onChange={(e) => setGrowthDirection(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Distance Control */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-800">
            Distance: {growthDistance}
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={growthDistance}
            onChange={(e) => setGrowthDistance(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Growing Tips Selection */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-800">Growing Tips:</label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {growingTipNodes.map((node) => (
              <button
                key={node.id}
                onClick={() => onNodeSelect?.(node)}
                className={`w-full text-left p-2 rounded text-sm text-gray-800 ${
                  selectedNode?.id === node.id
                    ? 'bg-blue-100 border-blue-300'
                    : 'bg-gray-50 border-gray-200'
                } border`}
              >
                Tip at ({Math.round(node.x)}, {Math.round(node.y)})
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGrow}
          disabled={!selectedNode || !selectedNode.isGrowingTip}
          className="w-full bg-plant-green text-white py-2 px-4 rounded hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Grow Plant
        </button>
      </div>

      {/* Power Allocation */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Power Allocation</h3>
        
        {Object.entries(powerAllocation).map(([power, value]) => (
          <div key={power}>
            <label className="block text-sm font-medium mb-2 capitalize text-gray-800">
              {power}: {value} (Current: {powers[power as keyof typeof powers]})
            </label>
            <input
              type="range"
              min="0"
              max="3"
              value={value}
              onChange={(e) => setPowerAllocation(prev => ({
                ...prev,
                [power]: parseInt(e.target.value)
              }))}
              className="w-full"
            />
          </div>
        ))}
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-semibold mb-2 text-gray-800">Selected Node</h4>
          <div className="text-sm space-y-1 text-gray-800">
            <div>Position: ({Math.round(selectedNode.x)}, {Math.round(selectedNode.y)})</div>
            <div>Health: {Math.round(selectedNode.health)}%</div>
            <div>Energy: {Math.round(selectedNode.energy)}</div>
            <div>Age: {selectedNode.age}</div>
            <div>Thickness: {selectedNode.thickness}</div>
            <div>Growing Tip: {selectedNode.isGrowingTip ? 'Yes' : 'No'}</div>
          </div>
        </div>
      )}
    </div>
  );
}; 