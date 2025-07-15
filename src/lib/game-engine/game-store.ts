import { create } from 'zustand';
import { GameState, GrowthAction, GamePowers, EnvironmentZone } from '@/types/game';
import { PlantGrowthEngine } from './plant-growth';

interface GameStore extends GameState {
  // Actions
  initializeGame: () => void;
  growPlant: (action: GrowthAction) => void;
  allocatePowers: (powerAllocation: Partial<GamePowers>) => void;
  createBranch: (parentNodeId: string, direction: number) => void;
  nextTurn: () => void;
  resetGame: () => void;
}

const DEFAULT_POWERS: GamePowers = {
  reach: 0,
  branching: 0,
  photosynthesis: 0,
  resilience: 0,
};

const DEFAULT_ENVIRONMENT: {
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  zones: EnvironmentZone[];
} = {
  bounds: { minX: -100, maxX: 100, minY: -100, maxY: 100 },
  zones: [
    {
      id: 'fertile-center',
      type: 'fertile',
      bounds: { minX: -20, maxX: 20, minY: -20, maxY: 20 },
      properties: {
        growthMultiplier: 1.2,
        energyCost: 0,
        healthDrain: 0,
      },
    },
    {
      id: 'rocky-north',
      type: 'rocky',
      bounds: { minX: -100, maxX: 100, minY: 50, maxY: 100 },
      properties: {
        growthMultiplier: 0.7,
        energyCost: 5,
        healthDrain: 2,
      },
    },
  ],
};

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  plantNodes: [],
  growingTips: [],
  turn: 0,
  energy: 100,
  powers: DEFAULT_POWERS,
  environment: DEFAULT_ENVIRONMENT,

  // Actions
  initializeGame: () => {
    const initialPlant = PlantGrowthEngine.createInitialPlant(0, 0);
    set({
      plantNodes: [initialPlant],
      growingTips: [initialPlant.id],
      turn: 1,
      energy: 100,
      powers: DEFAULT_POWERS,
      environment: DEFAULT_ENVIRONMENT,
    });
  },

  growPlant: (action: GrowthAction) => {
    const currentState = get();
    try {
      const newState = PlantGrowthEngine.growPlant(currentState, action);
      set(newState);
    } catch (error) {
      console.error('Failed to grow plant:', error);
    }
  },

  allocatePowers: (powerAllocation: Partial<GamePowers>) => {
    const currentState = get();
    const newState = PlantGrowthEngine.allocatePowers(currentState, powerAllocation);
    set(newState);
  },

  createBranch: (parentNodeId: string, direction: number) => {
    const currentState = get();
    try {
      const newState = PlantGrowthEngine.createBranch(currentState, parentNodeId, direction);
      set(newState);
    } catch (error) {
      console.error('Failed to create branch:', error);
    }
  },

  nextTurn: () => {
    const currentState = get();
    const energyGain = 20 + currentState.powers.photosynthesis * 5;
    
    set({
      turn: currentState.turn + 1,
      energy: currentState.energy + energyGain,
    });
  },

  resetGame: () => {
    set({
      plantNodes: [],
      growingTips: [],
      turn: 0,
      energy: 100,
      powers: DEFAULT_POWERS,
      environment: DEFAULT_ENVIRONMENT,
    });
  },
})); 