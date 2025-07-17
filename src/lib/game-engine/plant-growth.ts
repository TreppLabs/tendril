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
      curviness: (Math.random() - 0.5) * (Math.PI / 6), // Random curviness between -15° and +15°
      curvinessRate: (Math.random() - 0.5) * (Math.PI / 90), // Random RCC between -1° and +1°
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

      // Calculate growth distance based on growth power (more conservative)
      const growthDistance = 1.5 + (powers.growth * 0.5); // Base 1.5 + 0.5 per growth power

      // Update curviness rate with larger random adjustment (0.3 degrees)
      const rateAdjustment = (Math.random() - 0.5) * (Math.PI / 300); // ±0.3 degree
      const newCurvinessRate = Math.max(
        -Math.PI / 180, // -1 degree
        Math.min(
          Math.PI / 180, // +1 degree
          tipNode.curvinessRate + rateAdjustment
        )
      );
      
      // Update curviness using the rate of change
      const newCurviness = Math.max(
        -Math.PI / 12, // -15 degrees
        Math.min(
          Math.PI / 12, // +15 degrees
          tipNode.curviness + newCurvinessRate
        )
      );
      
      // Calculate new direction using curviness
      const newDirection = tipNode.growthDirection + newCurviness;
      
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
        thickness: Math.max(0.8, tipNode.thickness - 0.3), // Smaller thickness reduction
        color: tipNode.color,
        creationTurn: turn,
        growthDirection: newDirection,
        curviness: newCurviness, // Use updated curviness
        curvinessRate: newCurvinessRate, // Use updated curviness rate
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

    // Calculate thickening factor based on resilience (more conservative)
    const resilienceFactor = 0.02 + (powers.resilience * 0.01); // Much smaller thickening
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
    const updatedPlantNodes = [...plantNodes];
    const newNodes: PlantNode[] = [];
    const updatedGrowingTips = [...growingTips];

    // Check each node for branching - no overall limit on branches
    
    updatedPlantNodes.forEach((node, index) => {
      // Allow branching from any node that's not a growing tip and is young enough
      // Nodes can branch for up to 8 turns after creation
      if (!node.isGrowingTip && turn - node.creationTurn <= 8) {
        // Base branching chance + branchiness bonus (much more conservative)
        const baseChance = 0; // 0% base chance - no branching without branchiness power
        const branchChance = baseChance + (powers.branchiness * 0.04); // 4% per branchiness point
        
        console.log(`Checking node ${node.id} for branching: chance=${branchChance}, turn=${turn}, creationTurn=${node.creationTurn}`);
        
                  if (Math.random() < branchChance) {
            // Create new branch at 30 degrees from parent direction
            const parentDirection = node.growthDirection || 0;
            const branchAngle = parentDirection + (Math.PI / 6); // 30 degrees
          const branchDistance = 1.5 + (powers.growth * 0.5);
        
          const newX = node.x + Math.cos(branchAngle) * branchDistance;
          const newY = node.y + Math.sin(branchAngle) * branchDistance;

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
                thickness: Math.max(0.8, node.thickness - 0.5),
                color: node.color,
                creationTurn: turn,
                growthDirection: branchAngle,
                curviness: (Math.random() - 0.5) * (Math.PI / 6), // New random curviness for branches
                curvinessRate: (Math.random() - 0.5) * (Math.PI / 90), // New random RCC for branches
              };

            // Update parent node
            const updatedParentNode: PlantNode = {
              ...node,
              children: [...node.children, branchNode.id],
            };

            // Update the parent node in the array
            updatedPlantNodes[index] = updatedParentNode;

            newNodes.push(branchNode);
            updatedGrowingTips.push(branchNode.id);
          }
        }
      }
    });

    return {
      ...gameState,
      plantNodes: [...updatedPlantNodes, ...newNodes],
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