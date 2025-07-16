export interface PlantNode {
  id: string;
  x: number;
  y: number;
  parentId: string | null;
  children: string[]; // IDs of child nodes
  age: number;
  isGrowingTip: boolean;
  thickness: number;
  color: string;
  creationTurn: number; // Turn when this node was created
  growthDirection: number; // Current growth direction in radians
}

export interface GamePowers {
  growth: number;
  branchiness: number;
  resilience: number;
}

export interface EnvironmentZone {
  id: string;
  type: 'fertile' | 'rocky' | 'dry' | 'water' | 'shaded';
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  properties: {
    growthMultiplier: number;
    energyCost: number;
    healthDrain: number;
  };
}

export interface GameState {
  plantNodes: PlantNode[];
  growingTips: string[]; // IDs of active growing tips
  turn: number;
  energy: number;
  powers: GamePowers;
  environment: {
    bounds: { minX: number; maxX: number; minY: number; maxY: number };
    zones: EnvironmentZone[];
  };
}

export interface GrowthAction {
  tipId: string;
  direction: number; // angle in radians
  distance: number;
  powerAllocation?: Partial<GamePowers>;
}

export interface GameSettings {
  canvasWidth: number;
  canvasHeight: number;
  worldBounds: { minX: number; maxX: number; minY: number; maxY: number };
  initialEnergy: number;
  energyPerTurn: number;
} 