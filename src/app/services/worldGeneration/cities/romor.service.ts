import { Injectable } from '@angular/core';
import { Settlement } from '../../../shared/types/Settlement';
import { TileData } from '../world-map.service';
import { ID } from '../../../shared/types/ID';

interface Rumor {
  id: ID;
  settlementId: ID;
  description: string;
  hintBiome: string;
  targetLocation: { x: number; y: number };
}

@Injectable({ providedIn: 'root' })
export class RumorService {
  private rumorTemplates = [
    "An ancient ruin lies hidden in the {biome}.",
    "A treasure hoard is rumored to exist near the {biome}.",
    "Locals speak of a lost monastery beyond the {biome}.",
    "Bandits are said to have buried their loot in the {biome}.",
    "Ghost lights have been seen over the {biome} at night."
  ];

  constructor() {}

  generateRumorsForSettlement(
    settlement: Settlement,
    chunk: TileData[][],
    seedRandom: () => number
  ): Rumor[] {
    const rumors: Rumor[] = [];

    const rumorCount = 1 + Math.floor(seedRandom() * 2); // 1–2 rumors per city

    const nearbyTiles = this.findNearbyInterestingTiles(chunk, settlement, seedRandom);

    for (let i = 0; i < rumorCount && nearbyTiles.length > 0; i++) {
      const tile = nearbyTiles.splice(Math.floor(seedRandom() * nearbyTiles.length), 1)[0];

      const biome = tile.biome || 'unknown lands';
      const template = this.rumorTemplates[Math.floor(seedRandom() * this.rumorTemplates.length)];
      const description = template.replace('{biome}', biome);

      const rumor: Rumor = {
        id: this.generateSimpleID(),
        settlementId: settlement.id,
        description,
        hintBiome: biome,
        targetLocation: { x: tile.x, y: tile.y }
      };

      rumors.push(rumor);
    }

    return rumors;
  }

  private findNearbyInterestingTiles(
    chunk: TileData[][],
    settlement: Settlement,
    seedRandom: () => number
  ): { x: number; y: number; biome: string }[] {
    const radius = 40; // Scan within 40 tiles
    const interesting: { x: number; y: number; biome: string }[] = [];

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const tx = settlement.x + dx;
        const ty = settlement.y + dy;
        const tile = chunk[ty]?.[tx];
        if (tile && this.isInterestingBiome(tile.biome)) {
          interesting.push({ x: tx, y: ty, biome: tile.biome });
        }
      }
    }

    return interesting;
  }

  private isInterestingBiome(biome: string): boolean {
    return ['forest', 'woodland', 'mountain', 'rock', 'alpine', 'taiga', 'beach', 'swamp', 'moor'].includes(biome);
  }

  private generateSimpleID(): ID {
    return Math.random().toString(36).substring(2, 10) as ID;
  }
}
