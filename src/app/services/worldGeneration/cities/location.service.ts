import { Injectable } from '@angular/core';
import { TileData } from '../world-map.service';
import { Settlement } from '../../../shared/types/Settlement';
import { WorldTileService } from '../../world-tile.service';

@Injectable({ providedIn: 'root' })
export class LocationService {
  constructor(private worldTileService: WorldTileService) {}

  findCoastalLocations(chunk: TileData[][], seedRandom: () => number, desiredCount: number = 6): { x: number; y: number }[] {
    const candidates: { x: number; y: number }[] = [];

    const width = chunk[0].length;
    const height = chunk.length;

    // 1. Gather all possible coastal candidates
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (this.isCoastal(chunk, x, y)) {
          candidates.push({ x, y });
        }
      }
    }

    console.log(`LocationService: Found ${candidates.length} coastal candidates.`);

    // 2. Pick random ones
    const picked: { x: number; y: number }[] = [];
    while (picked.length < desiredCount && candidates.length > 0) {
      const index = Math.floor(seedRandom() * candidates.length);
      picked.push(candidates.splice(index, 1)[0]);
    }

    return picked;
  }

  async findSeaExpansionRoute(
    chunk: TileData[][],
    from: Settlement,
    seedRandom: () => number
  ): Promise<{ path: { x: number; y: number }[], destination: { x: number; y: number } } | null> {
    const startX = from.x;
    const startY = from.y;
  
    let currentX = startX;
    let currentY = startY;
  
    const path: { x: number; y: number }[] = [];
    const maxSteps = 100;
    let steps = 0;
  
    const preferredCoastDistance = 4 + Math.floor(seedRandom() * 4); // Prefer 4–8 tiles from land
  
    while (steps++ < maxSteps) {
      path.push({ x: currentX, y: currentY });
  
      // Find best move
      const moveOptions: { x: number; y: number; penalty: number }[] = [];
  
      for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0], [1,1], [-1, -1], [-1, 1], [1, -1]]) {
        const nx = currentX + dx;
        const ny = currentY + dy;
        const tile = await this.worldTileService.getTile(nx, ny)
  
        if (!tile || !(tile.biome === 'ocean' || tile.biome === 'water')) {
          continue; // Must stay on water
        }
  
        // How close to land is this move?
        let landNearby = 0;
        for (const [dx2, dy2] of [[-1,0],[1,0],[0,-1],[0,1]]) {
          const adjX = nx + dx2;
          const adjY = ny + dy2;
          const adjTile = await this.worldTileService.getTile(adjX, adjY);
          if (adjTile && adjTile.biome !== 'ocean' && adjTile.biome !== 'water') {
            landNearby++;
          }
        }
  
        // Prefer to stay within preferredCoastDistance to land
        const penalty = Math.abs(landNearby - preferredCoastDistance) + seedRandom() * 0.5;
  
        moveOptions.push({ x: nx, y: ny, penalty });
      }
  
      if (moveOptions.length === 0) {
        console.warn('Blocked during sea expansion');
        break;
      }
  
      moveOptions.sort((a, b) => a.penalty - b.penalty);
      const bestMove = moveOptions[0];
  
      currentX = bestMove.x;
      currentY = bestMove.y;
  
      // Check if this is near a new coast
      for (const [dx2, dy2] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const adjX = currentX + dx2;
        const adjY = currentY + dy2;
        const adjTile = await this.worldTileService.getTile(adjX, adjY)
        if (adjTile && adjTile.biome !== 'ocean' && adjTile.biome !== 'water') {
          // 🎯 Land spotted, suitable for landing
          return { path, destination: { x: currentX, y: currentY } };
        }
      }
    }
  
    return null;
  }
  
  findExpansionLocation(
    chunk: TileData[][],
    from: Settlement,
    type: 'land' | 'sea',
    seedRandom: () => number
  ): { x: number; y: number } | null {
    const candidates: { x: number; y: number }[] = [];
  
    const maxRadius = type === 'sea' ? 160 : 20; // 🧠 Sea search bigger
    const minRadius = type === 'sea' ? 6 : 6;
  
    for (let dy = -maxRadius; dy <= maxRadius; dy++) {
      for (let dx = -maxRadius; dx <= maxRadius; dx++) {
        const nx = (from.x % 512) + dx;
        const ny = (from.y % 512) + dy;
  
        if (nx < 0 || ny < 0 || nx >= 512 || ny >= 512) continue;
  
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minRadius || dist > maxRadius) continue; // Skip too close or too far
  
        const tile = chunk[ny]?.[nx];
        if (!tile) continue;
  
        const isValid = (type === 'land')
          ? tile.biome !== 'ocean' && tile.biome !== 'water'
          : tile.biome === 'ocean' || tile.biome === 'water';
  
        if (!isValid) continue;
  
        if (type === 'sea') {
          // Special extra check for sea expansions:
          let touchesLand = false;
          for (const [dx2, dy2] of [[-1,0],[1,0],[0,-1],[0,1]]) {
            const adjX = nx + dx2;
            const adjY = ny + dy2;
            const adjTile = chunk[adjY]?.[adjX];
            if (adjTile && adjTile.biome !== 'ocean' && adjTile.biome !== 'water') {
              touchesLand = true;
              break;
            }
          }
          if (!touchesLand) continue; // Only accept sea tiles near land for now
        }
  
        candidates.push({ x: nx, y: ny });
      }
    }
  
    if (candidates.length === 0) return null;
  
    return candidates[Math.floor(seedRandom() * candidates.length)];
  }
  
  
  findInlandLocations(
    chunk: TileData[][],
    seedRandom: () => number,
    desiredCount: number,
    coastalSettlements: { x: number; y: number }[]
  ): { x: number; y: number }[] {
    const candidates: { x: number; y: number }[] = [];

    const width = chunk[0].length;
    const height = chunk.length;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = chunk[y][x];
        if (tile.biome !== 'ocean' && tile.biome !== 'water' && tile.elevation > 0.2) {
          // Only land tiles
          if (this.isNearCoastalSettlements(x, y, coastalSettlements)) {
            candidates.push({ x, y });
          }
        }
      }
    }

    console.log(`LocationService: Found ${candidates.length} inland candidates.`);

    const picked: { x: number; y: number }[] = [];
    while (picked.length < desiredCount && candidates.length > 0) {
      const index = Math.floor(seedRandom() * candidates.length);
      picked.push(candidates.splice(index, 1)[0]);
    }

    return picked;
  }

  private isCoastal(chunk: TileData[][], x: number, y: number): boolean {
    const tile = chunk[y][x];
    if (tile.biome !== 'beach') return false;

    const width = chunk[0].length;
    const height = chunk.length;

    const visited = new Set<string>();
    const queue: { x: number; y: number; dist: number }[] = [{ x, y, dist: 0 }];
    const maxDistance = 20;

    while (queue.length > 0) {
      const { x, y, dist } = queue.shift()!;
      const key = `${x},${y}`;

      if (visited.has(key)) continue;
      visited.add(key);

      if (chunk[y]?.[x]?.biome === 'ocean') {
        return true;
      }

      if (chunk[y]?.[x]?.biome !== 'water' && chunk[y]?.[x]?.biome !== 'beach') {
        continue; // Hit land
      }

      if (dist >= maxDistance) {
        continue; // Too far
      }

      for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < width && ny < height) {
          queue.push({ x: nx, y: ny, dist: dist + 1 });
        }
      }
    }

    return false;
  }

  private isNearCoastalSettlements(x: number, y: number, coastalSettlements: { x: number; y: number }[]): boolean {
    for (const coastal of coastalSettlements) {
      const dx = coastal.x - x;
      const dy = coastal.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance >= 8 && distance <= 24) {
        return true;
      }
    }
    return false;
  }
}
