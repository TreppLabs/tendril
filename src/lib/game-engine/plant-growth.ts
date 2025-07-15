import { PlantNode, GameState, GrowthAction, GamePowers } from '@/types/game';

export class PlantGrowthEngine {
  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  static createInitialPlant(x: number, y: number): PlantNode {
    return {
      id: this.generateId(),
      x,
      y,
      parentId: null,
      children: [],
      age: 0,
      energy: 100,
      health: 100,
      isGrowingTip: true,
      thickness: 3,
      color: '#4ade80',
    };
  }

  static growPlant(
    gameState: GameState,
    action: GrowthAction
  ): GameState {
    const { plantNodes, growingTips } = gameState;
    const tipNode = plantNodes.find(node => node.id === action.tipId);
    
    if (!tipNode || !tipNode.isGrowingTip) {
      throw new Error('Invalid growing tip');
    }

    // Calculate new position
    const newX = tipNode.x + Math.cos(action.direction) * action.distance;
    const newY = tipNode.y + Math.sin(action.direction) * action.distance;

    // Check bounds
    const { bounds } = gameState.environment;
    if (newX < bounds.minX || newX > bounds.maxX || 
        newY < bounds.minY || newY > bounds.maxY) {
      throw new Error('Growth would exceed world bounds');
    }

    // Create new node
    const newNode: PlantNode = {
      id: this.generateId(),
      x: newX,
      y: newY,
      parentId: tipNode.id,
      children: [],
      age: 0,
      energy: 50,
      health: 100,
      isGrowingTip: true,
      thickness: Math.max(1, tipNode.thickness - 0.5),
      color: tipNode.color,
    };

    // Update parent node
    const updatedTipNode: PlantNode = {
      ...tipNode,
      children: [...tipNode.children, newNode.id],
      isGrowingTip: false,
    };

    // Update plant nodes
    const updatedPlantNodes = plantNodes.map(node => 
      node.id === tipNode.id ? updatedTipNode : node
    );
    updatedPlantNodes.push(newNode);

    // Update growing tips
    const updatedGrowingTips = growingTips.filter(id => id !== tipNode.id);
    updatedGrowingTips.push(newNode.id);

    return {
      ...gameState,
      plantNodes: updatedPlantNodes,
      growingTips: updatedGrowingTips,
    };
  }

  static allocatePowers(
    gameState: GameState,
    powerAllocation: Partial<GamePowers>
  ): GameState {
    const currentPowers = gameState.powers;
    const updatedPowers = { ...currentPowers };

    // Apply power allocations
    (Object.keys(powerAllocation) as Array<keyof GamePowers>).forEach((power) => {
      const value = powerAllocation[power];
      if (value !== undefined && power in updatedPowers) {
        updatedPowers[power] += value;
      }
    });

    return {
      ...gameState,
      powers: updatedPowers,
    };
  }

  static calculateMaxGrowthDistance(gameState: GameState): number {
    return 10 + gameState.powers.reach * 2; // Base 10 + 2 per reach power
  }

  static canBranch(gameState: GameState): boolean {
    return gameState.powers.branching > 0;
  }

  static createBranch(
    gameState: GameState,
    parentNodeId: string,
    direction: number
  ): GameState {
    if (!this.canBranch(gameState)) {
      throw new Error('Branching power not available');
    }

    const parentNode = gameState.plantNodes.find(node => node.id === parentNodeId);
    if (!parentNode) {
      throw new Error('Parent node not found');
    }

    // Create new growing tip from parent
    const newTip: PlantNode = {
      id: this.generateId(),
      x: parentNode.x,
      y: parentNode.y,
      parentId: parentNode.id,
      children: [],
      age: 0,
      energy: 30,
      health: 100,
      isGrowingTip: true,
      thickness: Math.max(1, parentNode.thickness - 1),
      color: parentNode.color,
    };

    // Update parent
    const updatedParent: PlantNode = {
      ...parentNode,
      children: [...parentNode.children, newTip.id],
    };

    const updatedPlantNodes = gameState.plantNodes.map(node => 
      node.id === parentNodeId ? updatedParent : node
    );
    updatedPlantNodes.push(newTip);

    const updatedGrowingTips = [...gameState.growingTips, newTip.id];

    return {
      ...gameState,
      plantNodes: updatedPlantNodes,
      growingTips: updatedGrowingTips,
      powers: {
        ...gameState.powers,
        branching: gameState.powers.branching - 1,
      },
    };
  }

  static getPlantStats(gameState: GameState) {
    const { plantNodes } = gameState;
    const totalNodes = plantNodes.length;
    const totalLength = plantNodes.reduce((sum, node) => {
      if (node.parentId) {
        const parent = plantNodes.find(p => p.id === node.parentId);
        if (parent) {
          const dx = node.x - parent.x;
          const dy = node.y - parent.y;
          return sum + Math.sqrt(dx * dx + dy * dy);
        }
      }
      return sum;
    }, 0);

    const averageHealth = plantNodes.reduce((sum, node) => sum + node.health, 0) / totalNodes;
    const averageEnergy = plantNodes.reduce((sum, node) => sum + node.energy, 0) / totalNodes;

    return {
      totalNodes,
      totalLength,
      averageHealth,
      averageEnergy,
      growingTips: gameState.growingTips.length,
    };
  }
} 