import { create } from 'zustand';
import { GameState, GamePowers, EnvironmentZone } from '@/types/game';
import { PlantGrowthEngine } from './plant-growth';

interface GameStore extends GameState {
  // Actions
  initializeGame: () => void;
  growTendril: () => void;
  allocatePower: (powerName: keyof GamePowers) => void;
  resetGame: () => void;
}

const DEFAULT_POWERS: GamePowers = {
  growth: 0,
  branchiness: 0,
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
  energy: 0, // Not used in new model
  powers: DEFAULT_POWERS,
  environment: DEFAULT_ENVIRONMENT,

  // Actions
  initializeGame: () => {
    const initialPlant = PlantGrowthEngine.createInitialPlant(0, 0, 1);
    set({
      plantNodes: [initialPlant],
      growingTips: [initialPlant.id],
      turn: 1,
      energy: 0,
      powers: DEFAULT_POWERS,
      environment: DEFAULT_ENVIRONMENT,
    });
  },

  growTendril: () => {
    const currentState = get();
    const newTurn = currentState.turn + 1;
    
    try {
      // Step 1: Grow all growing tips
      let newState = PlantGrowthEngine.growPlant(currentState, newTurn);
      
      // Step 2: Thicken the plant
      newState = PlantGrowthEngine.thickenPlant(newState, newTurn);
      
      // Step 3: Check for branching
      newState = PlantGrowthEngine.checkBranching(newState, newTurn);
      
      // Step 4: Update turn
      newState.turn = newTurn;
      
      set(newState);
    } catch (error) {
      console.error('Failed to grow tendril:', error);
    }
  },

  allocatePower: (powerName: keyof GamePowers) => {
    const currentState = get();
    const newState = PlantGrowthEngine.allocatePower(currentState, powerName);
    set(newState);
  },

  resetGame: () => {
    set({
      plantNodes: [],
      growingTips: [],
      turn: 0,
      energy: 0,
      powers: DEFAULT_POWERS,
      environment: DEFAULT_ENVIRONMENT,
    });
  },
})); 