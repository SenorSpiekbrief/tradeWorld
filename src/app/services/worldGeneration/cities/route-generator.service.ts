import { Injectable } from '@angular/core';
import { Settlement } from '../../../shared/types/Settlement';
import { WorldTileService } from '../../world-tile.service';

@Injectable({ providedIn: 'root' })
export class RouteGeneratorService {
  constructor(private worldTileService: WorldTileService) {}

  // === FIND SEA ROUTE ===
  async findSeaRoute(
    from: Settlement,
    to: Settlement,
    seedRandom: () => number
  ): Promise<{ x: number; y: number }[]> {
    return await this.findRoute(from, to, ['ocean', 'water', 'beach'], seedRandom);
  }

  // === FIND LAND ROUTE ===
  async findLandRoute(
    from: Settlement,
    to: Settlement,
    seedRandom: () => number
  ): Promise<{ x: number; y: number }[]> {
    return await this.findRoute(from, to, ['grassland', 'forest', 'woodland', 'taiga', 'tundra', 'desert', 'mountain', 'rock', 'alpine'], seedRandom);
  }

  // === COMMON ROUTE FINDER ===
  private async findRoute(
    from: Settlement,
    to: Settlement,
    allowedBiomes: string[],
    seedRandom: () => number
  ): Promise<{ x: number; y: number }[]> {
    const path: { x: number; y: number }[] = [];

    let currentX = from.x;
    let currentY = from.y;

    const maxSteps = 1000;
    let steps = 0;

    while (steps++ < maxSteps) {
      path.push({ x: currentX, y: currentY });

      if (Math.abs(currentX - to.x) <= 1 && Math.abs(currentY - to.y) <= 1) {
        break; // Reached destination
      }

      // Pick best move toward destination
      const moveOptions: { x: number; y: number; score: number }[] = [];

      for (const [dx, dy] of [[1,0], [0,1], [-1,0], [0,-1], [1,1], [-1,1], [1,-1], [-1,-1]]) {
        const nx = currentX + dx;
        const ny = currentY + dy;
        const tile = await this.worldTileService.getTile(nx, ny);
        if (!tile || !allowedBiomes.includes(tile.biome)) {
          continue;
        }

        const distance = Math.sqrt((to.x - nx) ** 2 + (to.y - ny) ** 2);
        const randomFactor = seedRandom() * 0.3; // small randomness
        //const openSea = await this.isNearOceanLocked(to.x,to.y,['ocean'],4) ? 1 : 0;
        const nearBeach = await this.isNearOceanLocked(to.x,to.y,['beach'],3) ? -8 : 0;
        //const openOcean = await this.isNearOceanLocked(to.x,to.y,['ocean'],7) ? -2 : 0;
        //const waterOptimum = await this.isNearOceanLocked(to.x,to.y,['water'],4) ? 1 : 0;
        const openWater = await this.isNearOceanLocked(to.x,to.y,allowedBiomes,6) ? 3 : 0;
        moveOptions.push({ x: nx, y: ny, score: distance + randomFactor + openWater+ nearBeach});
      }

      if (moveOptions.length === 0) {
        console.warn('Route blocked!');
        break;
      }

      moveOptions.sort((a, b) => a.score - b.score);
      const bestMove = moveOptions[0];
      currentX = bestMove.x;
      currentY = bestMove.y;
    }

    return path;
  }

  private async isNearOceanLocked(x: number, y: number, allowedBiomes: string[],amount:number): Promise<boolean> {
    let waterNeighbors = 0;
    const neighborCoords = [
      [1, 0], [0, 1], [-1, 0], [0, -1],
      [1, 1], [-1, 1], [1, -1], [-1, -1],
    ];
  
    for (const [dx, dy] of neighborCoords) {
      const tile = await this.worldTileService.getTile(x + dx, y + dy);
      if (!tile || !allowedBiomes.includes(tile.biome)) {
        waterNeighbors++;
      }
    }
  
    // If 6 or more of 8 neighbors are water, we consider it near ocean-locked
    return waterNeighbors >= amount;
  }
}
