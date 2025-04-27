import { Injectable } from '@angular/core';
import { TileData } from '../worldGeneration/world-map.service';
import { EstateType } from '../../shared/enums/EstateType';
import { SettlementType } from '../../shared/enums/SettlementType';
import { ID } from '../../shared/types/ID';
import { Settlement } from '../../shared/types/Settlement';

@Injectable({ providedIn: 'root' })
export class CitySeederService {
  constructor() {}

  async seedWorldSettlements(
    chunk: TileData[][],
    globalChunkX: number,
    globalChunkY: number,
    seedRandom: () => number,
    coastalCount: number = 6,
    inlandCount: number = 4,
    maxRetries: number = 10
  ): Promise<Settlement[]> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const coastalCandidates = this.findCoastalCandidates(chunk);
      console.log(`Attempt ${attempt}: Found ${coastalCandidates.length} coastal candidates.`);

      const coastalSettlements = this.pickCoastalSettlements(coastalCandidates, globalChunkX, globalChunkY, seedRandom, coastalCount);
      if (coastalSettlements.length < coastalCount) {
        console.warn(`Not enough coastal settlements. Retry.`);
        continue;
      }

      // Add harbor estate if needed
      for (const settlement of coastalSettlements) {
        if (!this.isDirectlyTouchingOcean(chunk, settlement.x % 512, settlement.y % 512)) {
          console.log(`Settlement ${settlement.name} is near water but not touching ocean. Adding Harbor estate.`);
          settlement.estates.push({
              estateId: this.generateSimpleID(),
              type: EstateType.Shipyard,
              name: '',
              location: {
                  x: 0,
                  y: 0
              },
              market: {
                  sellOrders: [],
                  buyOrders: [],
                  auction: []
              },
              structures: [],
              upgrades: []
          });
        }
      }

      // Now find inland candidates based on coastal hubs
      const inlandSettlements = this.placeInlandSettlements(chunk, coastalSettlements, globalChunkX, globalChunkY, seedRandom, inlandCount);

      const allSettlements = [...coastalSettlements, ...inlandSettlements];

      if (allSettlements.length >= (coastalCount + inlandCount)) {
        console.log(`World settlements seeded successfully on attempt ${attempt}.`);
        return allSettlements;
      } else {
        console.warn(`Not enough inland settlements. Retrying.`);
      }
    }

    throw new Error(`Failed to seed world settlements after ${maxRetries} attempts.`);
  }

  // ------------------ CORE METHODS ------------------ //

  private findCoastalCandidates(chunk: TileData[][]): { x: number; y: number }[] {
    const candidates: { x: number; y: number }[] = [];
    const width = chunk[0].length;
    const height = chunk.length;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (chunk[y][x].biome === 'beach' && this.isTrueCoast(chunk, x, y)) {
          candidates.push({ x, y });
        }
      }
    }

    return candidates;
  }

  private pickCoastalSettlements(
    candidates: { x: number; y: number }[],
    globalChunkX: number,
    globalChunkY: number,
    rand: () => number,
    count: number
  ): Settlement[] {
    const settlements: Settlement[] = [];

    for (let i = 0; i < count && candidates.length > 0; i++) {
      const index = Math.floor(rand() * candidates.length);
      const { x, y } = candidates.splice(index, 1)[0];

      const globalX = globalChunkX * 512 + x;
      const globalY = globalChunkY * 512 + y;

      settlements.push(this.createSettlement(globalX, globalY, rand, true));
    }

    return settlements;
  }

  private placeInlandSettlements(
    chunk: TileData[][],
    coastalSettlements: Settlement[],
    globalChunkX: number,
    globalChunkY: number,
    rand: () => number,
    inlandCount: number
  ): Settlement[] {
    const settlements: Settlement[] = [];
    const width = chunk[0].length;
    const height = chunk.length;

    for (let i = 0; i < inlandCount; i++) {
      const coastalHub = coastalSettlements[Math.floor(rand() * coastalSettlements.length)];

      let found = false;
      for (let attempt = 0; attempt < 100; attempt++) {
        const angle = rand() * 2 * Math.PI;
        const distance = 8 + Math.floor(rand() * 16); // between 8 and 24 tiles
        const dx = Math.round(Math.cos(angle) * distance);
        const dy = Math.round(Math.sin(angle) * distance);

        const tx = (coastalHub.x % 512) + dx;
        const ty = (coastalHub.y % 512) + dy;

        if (tx < 0 || ty < 0 || tx >= width || ty >= height) continue;

        const tile = chunk[ty][tx];
        if (tile.biome !== 'ocean' && tile.biome !== 'water') {
          const globalX = globalChunkX * 512 + tx;
          const globalY = globalChunkY * 512 + ty;
          settlements.push(this.createSettlement(globalX, globalY, rand, false));
          found = true;
          break;
        }
      }

      if (!found) {
        console.warn(`Could not place inland city ${i}`);
      }
    }

    return settlements;
  }

  private isTrueCoast(chunk: TileData[][], startX: number, startY: number, maxSearchDistance: number = 20): boolean {
    const visited = new Set<string>();
    const queue: { x: number; y: number; dist: number }[] = [{ x: startX, y: startY, dist: 0 }];
    const width = chunk[0].length;
    const height = chunk.length;
  
    while (queue.length > 0) {
      const { x, y, dist } = queue.shift()!;
      const key = `${x},${y}`;
  
      if (visited.has(key)) continue;
      visited.add(key);
  
      const tile = chunk[y]?.[x];
      if (!tile) continue;
  
      if (tile.biome === 'ocean') {
        return true; // 🎯 Ocean reached through water path!
      }
  
      if (tile.biome !== 'water' && tile.biome !== 'beach') {
        continue; // ❌ Hit land
      }
  
      if (dist >= maxSearchDistance) {
        continue; // ❌ Too far away
      }
  
      // Spread to neighbors
      for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < width && ny < height) {
          queue.push({ x: nx, y: ny, dist: dist + 1 });
        }
      }
    }
  
    return false; // ❌ No ocean found
  }
  

  private isDirectlyTouchingOcean(chunk: TileData[][], x: number, y: number): boolean {
    return this.isTrueCoast(chunk, x, y);
  }

  private createSettlement(globalX: number, globalY: number, rand: () => number, coastal: boolean): Settlement {
    console.log(globalX,globalY,  coastal)
    return {
      id: this.generateID(globalX, globalY),
      name: this.generateSettlementName(rand),
      type: coastal ? this.pickCoastalSettlementType(rand) : this.pickInlandSettlementType(rand),
      location: { x: globalX, y: globalY },
      x: globalX,
      y: globalY,
      population: this.generatePopulation(rand),
      specializations: this.pickSpecializations(rand),
      estates: [],
      structures: [],
      inventory: {
          equipment: {},
          assets: {
              wallet: {
                  thalers: 0,
                  gold: 0,
                  dollars: 0,
                  guilders: 0,
                  florins: 0
              },
              commodities: undefined,
              estates: undefined
          }
      },
      market: {
          sellOrders: [],
          buyOrders: [],
          auction: []
      },
      rule: this.generateInitialRule(rand),
    };
  }

  private pickCoastalSettlementType(rand: () => number): SettlementType {
    const roll = rand();
    if (roll < 0.15) return SettlementType.City;
    if (roll < 0.5) return SettlementType.Town;
    return SettlementType.Village;
  }

  private pickInlandSettlementType(rand: () => number): SettlementType {
    const roll = rand();
    if (roll < 0.5) return SettlementType.Village;
    return SettlementType.Hamlet;
  }

  private generatePopulation(rand: () => number): any {
    const total = 50 + Math.floor(rand() * 1000);
    return {
      total,
      workforce: Math.floor(total * 0.4),
      middle: Math.floor(total * 0.15),
      upper: Math.floor(total * 0.04),
      elite: Math.floor(total * 0.01),
      children: Math.floor(total * 0.25),
      elderly: Math.floor(total * 0.1),
      infirm: Math.floor(total * 0.05),
    };
  }

  private pickSpecializations(rand: () => number): string[] {
    const options = ['grain', 'fish', 'timber', 'salt', 'wool', 'spices'];
    const count = 1 + Math.floor(rand() * 2);
    const picks: Set<string> = new Set();

    while (picks.size < count) {
      const pick = options[Math.floor(rand() * options.length)];
      picks.add(pick);
    }

    return Array.from(picks);
  }

  private generateSettlementName(rand: () => number): string {
    const prefixes = ['New', 'Old', 'Port', 'Lake', 'North', 'South', 'East', 'West'];
    const roots = ['shore', 'cove', 'tide', 'rock', 'bay', 'harbor', 'cliff'];
    const suffixes = ['ton', 'mouth', 'haven', 'stead', 'ville'];

    return `${prefixes[Math.floor(rand() * prefixes.length)]}${roots[Math.floor(rand() * roots.length)]}${suffixes[Math.floor(rand() * suffixes.length)]}`;
  }

  private generateInitialRule(rand: () => number): any {
    const roll = rand();
    if (roll < 0.7) {
      return { leader: this.generateSimpleID(), subjects: [] };
    } else {
      return { councilMembers: [this.generateSimpleID()], comittees: [] };
    }
  }

  private generateSimpleID(): ID {
    return Math.random().toString(36).substring(2, 10) as ID;
  }

  private generateID(x: number, y: number): ID {
    return `settlement_${x}_${y}` as ID;
  }
}
