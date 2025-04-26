import { Injectable } from '@angular/core';
import { TileData } from '../worldGeneration/world-map.service';
import { Settlement } from '../../shared/types/Settlement';
import { Position } from '../../shared/types/Position';
import { SettlementType } from '../../shared/enums/SettlementType';
import { Structure } from '../construction-dialog.service';
import { StructureType } from '../../shared/enums/StructureType';


@Injectable({ providedIn: 'root' })
export class CitySeederService {
  constructor() {}

  seedCoastalSettlements(
    chunk: TileData[][],
    globalChunkX: number,
    globalChunkY: number,
    seedRandom: () => number,
    desiredCount: number = 8
  ): Settlement[] {
    const settlements: Settlement[] = [];
    const candidates: { x: number; y: number; tile: TileData }[] = [];

    const width = chunk[0].length;
    const height = chunk.length;

    // Step 1: Find beach candidates connected to ocean
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const tile = chunk[y][x];
        if (tile.biome === 'beach' && this.isConnectedToOcean(chunk, x, y)) {
          candidates.push({ x, y, tile });
        }
      }
    }

    // Step 2: Randomly select placements
    for (let i = 0; i < desiredCount && candidates.length > 0; i++) {
      const index = Math.floor(seedRandom() * candidates.length);
      const { x, y } = candidates.splice(index, 1)[0];

      const globalX = globalChunkX * 512 + x;
      const globalY = globalChunkY * 512 + y;

      const type = this.pickSettlementType(i, seedRandom);
      const pop = this.generatePopulation(type, seedRandom);

      const rule = this.generateInitialRule(seedRandom);

      const structures = this.generateInitialStructures(type, seedRandom);
      const estates = this.generateInitialEstates(type, seedRandom);

      settlements.push({
        id: this.generateID(globalX, globalY),
        name: this.generateSettlementName(seedRandom),
        type,
        location: { x: globalX, y: globalY } as Position,
        x: globalX,
        y: globalY,
        population: pop,
        specializations: this.pickSpecializations(seedRandom),
        estates,
        structures,
        market: { offers: [], demands: [] }, // Empty start
        inventory: { goods: [] }, // Empty start
        rule
      });
    }

    return settlements;
  }

  private isConnectedToOcean(chunk: TileData[][], startX: number, startY: number): boolean {
    const visited = new Set<string>();
    const queue: [number, number][] = [[startX, startY]];
    const width = chunk[0].length;
    const height = chunk.length;

    while (queue.length > 0) {
      const [x, y] = queue.shift()!;
      const key = `${x},${y}`;

      if (visited.has(key)) continue;
      visited.add(key);

      const tile = chunk[y]?.[x];
      if (!tile) continue;

      if (tile.biome === 'ocean') {
        return true;
      }

      if (tile.biome !== 'water' && tile.biome !== 'beach') continue;

      for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          queue.push([nx, ny]);
        }
      }
    }

    return false;
  }

  private pickSettlementType(index: number, rand: () => number): SettlementType {
    if (index === 0) return SettlementType.City;
    const roll = rand();
    if (roll < 0.2) return SettlementType.Town;
    if (roll < 0.5) return SettlementType.Village;
    return SettlementType.Hamlet;
  }

  private generatePopulation(type: SettlementType, rand: () => number): Population {
    let total = 50;
    switch (type) {
      case SettlementType.Hamlet: total = 50 + Math.floor(rand() * 100); break;
      case SettlementType.Village: total = 200 + Math.floor(rand() * 400); break;
      case SettlementType.Town: total = 800 + Math.floor(rand() * 2000); break;
      case SettlementType.City: total = 4000 + Math.floor(rand() * 8000); break;
    }

    const children = Math.floor(total * 0.25);
    const elderly = Math.floor(total * 0.1);
    const infirm = Math.floor(total * 0.05);
    const workforce = Math.floor(total * 0.4);
    const middle = Math.floor(total * 0.15);
    const upper = Math.floor(total * 0.04);
    const elite = Math.floor(total * 0.01);

    return { total, workforce, middle, upper, elite, children, elderly, infirm };
  }

  private generateInitialStructures(type: SettlementType, rand: () => number): Structure[] {
    const structures: Structure[] = [];

    structures.push({ id: this.generateSimpleID(), type: StructureType.Well });
    structures.push({ id: this.generateSimpleID(), type: StructureType.Market });

    if (type === SettlementType.Village || type === SettlementType.Town || type === SettlementType.City) {
      structures.push({ id: this.generateSimpleID(), type: StructureType.Tavern });
      structures.push({ id: this.generateSimpleID(), type: StructureType.Docks });
    }

    if (type === SettlementType.City) {
      structures.push({ id: this.generateSimpleID(), type: StructureType.Harbor });
      structures.push({ id: this.generateSimpleID(), type: StructureType.TownHall });
    }

    return structures;
  }

  private generateInitialEstates(type: SettlementType, rand: () => number): Estate[] {
    const estates: Estate[] = [];

    estates.push({ id: this.generateSimpleID(), type: EstateType.Residence });

    if (type === SettlementType.Town || type === SettlementType.City) {
      estates.push({ id: this.generateSimpleID(), type: EstateType.Warehouse });
    }

    return estates;
  }

  private generateInitialRule(rand: () => number): Feudal | Hanse {
    const roll = rand();
    if (roll < 0.7) {
      return { leader: this.generateSimpleID(), subjects: [] };
    } else {
      return { councilMembers: [this.generateSimpleID()], comittees: [] };
    }
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

  private generateSimpleID(): ID {
    return Math.random().toString(36).substring(2, 10) as ID;
  }

  private generateID(x: number, y: number): ID {
    return `settlement_${x}_${y}` as ID;
  }
}
