import { PlantNode, GameState, GamePowers } from '@/types/game';

export class PlantGrowthEngine {
  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  static createInitialPlant(x: number, y: number, turn: number): PlantNode {
    return {
      id: this.generateId(),
      x,
      y,
      parentId: null,
      children: [],
      age: 0,
      isGrowingTip: true,
      thickness: 2,
      color: '#4ade80',
      creationTurn: turn,
      growthDirection: Math.random() * 2 * Math.PI, // Random initial direction
    };
  }

  static growPlant(
    gameState: GameState,
    turn: number
  ): GameState {
    const { plantNodes, growingTips, powers } = gameState;
    const updatedPlantNodes = [...plantNodes];
    const updatedGrowingTips = [...growingTips];
    const newNodes: PlantNode[] = [];

    // Grow each growing tip
    growingTips.forEach(tipId => {
      const tipNode = updatedPlantNodes.find(node => node.id === tipId);
      if (!tipNode || !tipNode.isGrowingTip) return;

      // Calculate growth distance based on growth power
      const growthDistance = 2 + powers.growth; // Base 2 + growth power

      // Calculate new direction (within 10 degrees of previous direction)
      const angleVariation = (10 * Math.PI) / 180; // 10 degrees in radians
      const newDirection = tipNode.growthDirection + (Math.random() - 0.5) * 2 * angleVariation;
      
      // Calculate new position
      const newX = tipNode.x + Math.cos(newDirection) * growthDistance;
      const newY = tipNode.y + Math.sin(newDirection) * growthDistance;

      // Check bounds
      const { bounds } = gameState.environment;
      if (newX < bounds.minX || newX > bounds.maxX || 
          newY < bounds.minY || newY > bounds.maxY) {
        return; // Skip growth if out of bounds
      }

      // Create new node
      const newNode: PlantNode = {
        id: this.generateId(),
        x: newX,
        y: newY,
        parentId: tipNode.id,
        children: [],
        age: 0,
        isGrowingTip: true,
        thickness: Math.max(1, tipNode.thickness - 0.5),
        color: tipNode.color,
        creationTurn: turn,
        growthDirection: newDirection,
      };

      // Update parent node
      const updatedTipNode: PlantNode = {
        ...tipNode,
        children: [...tipNode.children, newNode.id],
        isGrowingTip: false,
      };

      // Update the tip node in the array
      const tipIndex = updatedPlantNodes.findIndex(node => node.id === tipId);
      updatedPlantNodes[tipIndex] = updatedTipNode;
      
      newNodes.push(newNode);
      updatedGrowingTips.push(newNode.id);
    });

    // Remove old growing tips and add new nodes
    const finalGrowingTips = updatedGrowingTips.filter(id => 
      !growingTips.includes(id) || newNodes.some(node => node.id === id)
    );

    return {
      ...gameState,
      plantNodes: [...updatedPlantNodes, ...newNodes],
      growingTips: finalGrowingTips,
    };
  }

  static allocatePower(
    gameState: GameState,
    powerName: keyof GamePowers
  ): GameState {
    const currentPowers = gameState.powers;
    const updatedPowers = { ...currentPowers };
    updatedPowers[powerName] += 1;

    return {
      ...gameState,
      powers: updatedPowers,
    };
  }

  static thickenPlant(
    gameState: GameState,
    turn: number
  ): GameState {
    const { plantNodes, powers } = gameState;
    
    // Calculate total length
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

    // Calculate thickening factor based on resilience
    const resilienceFactor = 0.1 + (powers.resilience * 0.05); // Base 0.1 + 0.05 per resilience
    const totalThickening = totalLength * resilienceFactor;

    // Distribute thickening among all nodes
    const thickeningPerNode = totalThickening / Math.max(1, plantNodes.length);

    const updatedPlantNodes = plantNodes.map(node => ({
      ...node,
      thickness: node.thickness + thickeningPerNode,
    }));

    return {
      ...gameState,
      plantNodes: updatedPlantNodes,
    };
  }

  static checkBranching(
    gameState: GameState,
    turn: number
  ): GameState {
    const { plantNodes, growingTips, powers } = gameState;
    const newNodes: PlantNode[] = [];
    const updatedGrowingTips = [...growingTips];

    // Check each node for branching (only nodes created in last 5 turns)
    plantNodes.forEach(node => {
      if (turn - node.creationTurn <= 5 && node.children.length === 0) {
        // Branching chance based on branchiness power
        const branchChance = powers.branchiness * 0.1; // 10% per branchiness point
        if (Math.random() < branchChance) {
          // Create new branch
          const branchDirection = Math.random() * 2 * Math.PI; // Random direction
          const branchDistance = 2 + powers.growth;
          
          const newX = node.x + Math.cos(branchDirection) * branchDistance;
          const newY = node.y + Math.sin(branchDirection) * branchDistance;

          // Check bounds
          const { bounds } = gameState.environment;
          if (newX >= bounds.minX && newX <= bounds.maxX && 
              newY >= bounds.minY && newY <= bounds.maxY) {
            
            const branchNode: PlantNode = {
              id: this.generateId(),
              x: newX,
              y: newY,
              parentId: node.id,
              children: [],
              age: 0,
              isGrowingTip: true,
              thickness: Math.max(1, node.thickness - 1),
              color: node.color,
              creationTurn: turn,
              growthDirection: branchDirection,
            };

            // Update parent node
            const updatedParentNode: PlantNode = {
              ...node,
              children: [...node.children, branchNode.id],
            };

            newNodes.push(branchNode);
            updatedGrowingTips.push(branchNode.id);
          }
        }
      }
    });

    return {
      ...gameState,
      plantNodes: [...plantNodes, ...newNodes],
      growingTips: updatedGrowingTips,
    };
  }

  static getPlantStats(gameState: GameState) {
    const { plantNodes, growingTips, turn } = gameState;
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

    return {
      totalNodes,
      totalLength,
      growingTips: growingTips.length,
      turn,
    };
  }
} 