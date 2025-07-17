'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '@/lib/game-engine/game-store';
import { PlantNode, EnvironmentZone } from '@/types/game';

interface PlantCanvasProps {
  width: number;
  height: number;
}

export const PlantCanvas: React.FC<PlantCanvasProps> = ({ 
  width, 
  height
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { plantNodes, environment, growingTips } = useGameStore();

  // Convert world coordinates to canvas coordinates
  const worldToCanvas = useCallback((worldX: number, worldY: number) => {
    const { bounds } = environment;
    const canvasX = ((worldX - bounds.minX) / (bounds.maxX - bounds.minX)) * width;
    const canvasY = height - ((worldY - bounds.minY) / (bounds.maxY - bounds.minY)) * height;
    return { x: canvasX, y: canvasY };
  }, [environment, width, height]);

  // Convert canvas coordinates to world coordinates
  const canvasToWorld = useCallback((canvasX: number, canvasY: number) => {
    const { bounds } = environment;
    const worldX = (canvasX / width) * (bounds.maxX - bounds.minX) + bounds.minX;
    const worldY = ((height - canvasY) / height) * (bounds.maxY - bounds.minY) + bounds.minY;
    return { x: worldX, y: worldY };
  }, [environment, width, height]);

  // Draw environment zones
  const drawEnvironment = useCallback((ctx: CanvasRenderingContext2D) => {
    environment.zones.forEach(zone => {
      const topLeft = worldToCanvas(zone.bounds.minX, zone.bounds.maxY);
      const bottomRight = worldToCanvas(zone.bounds.maxX, zone.bounds.minY);
      
      const zoneWidth = bottomRight.x - topLeft.x;
      const zoneHeight = bottomRight.y - topLeft.y;

      // Set zone color based on type
      let color = '#fef3c7'; // Default light yellow
      switch (zone.type) {
        case 'fertile':
          color = '#86efac'; // Light green
          break;
        case 'rocky':
          color = '#d1d5db'; // Light gray
          break;
        case 'dry':
          color = '#fde68a'; // Light yellow
          break;
        case 'water':
          color = '#93c5fd'; // Light blue
          break;
        case 'shaded':
          color = '#cbd5e1'; // Light slate
          break;
      }

      ctx.fillStyle = color;
      ctx.fillRect(topLeft.x, topLeft.y, zoneWidth, zoneHeight);
    });
  }, [environment, worldToCanvas]);

  // Draw plant nodes and connections
  const drawPlant = useCallback((ctx: CanvasRenderingContext2D) => {
    // Draw connections first (so they appear behind nodes)
    plantNodes.forEach(node => {
      if (node.parentId) {
        const parent = plantNodes.find(p => p.id === node.parentId);
        if (parent) {
          const start = worldToCanvas(parent.x, parent.y);
          const end = worldToCanvas(node.x, node.y);
          
          ctx.strokeStyle = node.color;
          ctx.lineWidth = node.thickness;
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        }
      }
    });

    // Draw nodes
    plantNodes.forEach(node => {
      const pos = worldToCanvas(node.x, node.y);
      
      // Calculate radius based on thickness (smaller circles)
      const radius = Math.max(1, node.thickness * 0.6);

      // Node background - darker green for connections
      ctx.fillStyle = node.isGrowingTip ? node.color : '#166534'; // Darker green for non-growing tips
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Growing tip indicator
      if (node.isGrowingTip) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + 2, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Age indicator (color intensity based on age)
      const ageAlpha = Math.min(node.age / 10, 1); // Fade with age
      ctx.fillStyle = `rgba(255, 0, 0, ${ageAlpha})`;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius - 1, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [plantNodes, worldToCanvas]);



  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Draw environment
    drawEnvironment(ctx);

    // Draw plant
    drawPlant(ctx);
  }, [width, height, drawEnvironment, drawPlant]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border border-gray-300 rounded-lg"
      style={{ touchAction: 'none' }}
    />
  );
}; 