import { Injectable } from '@angular/core';
import { CellData } from '../world-map.service';
import { Settlement } from '../../../shared/types/Settlement';
import { StructureType } from '../../../shared/enums/StructureType';
import { EstateType } from '../../../shared/enums/EstateType';
import { ID } from '../../../shared/types/ID';
import { Estate } from '../../../shared/types/Estate';

@Injectable({ providedIn: 'root' })
export class CityEstateSeederService {
  constructor() {}

  seedEstatesAroundSettlement(
    settlement: Settlement,
    chunk: CellData[][],
    seedRandom: () => number
  ): Estate[] {
    const estateCount = this.determineEstateCount(settlement, seedRandom);
    const result = [];

    const candidates: { x: number; y: number; biome: string }[] = [];

    const scanRadius = 3; 

    for (let dy = -scanRadius; dy <= scanRadius; dy++) {
      for (let dx = -scanRadius; dx <= scanRadius; dx++) {
        const tx = settlement.x + dx;
        const ty = settlement.y + dy;
        const tile = chunk[ty%512]?.[tx%512];
        if (tile) {
          candidates.push({ x: tx, y: ty, biome: tile.biome });
        }
      }
    }

    let placed = 0;

    while (placed < estateCount && candidates.length > 0) {
      const i = Math.floor(seedRandom() * candidates.length);
      const candidate = candidates.splice(i, 1)[0];

      const estateType = this.pickEstateTypeBasedOnBiome(candidate.biome, seedRandom);

      if (estateType) {
        result.push({
            id: this.generateSimpleID(),
            type: estateType,
            name: `${estateType}_${placed}`,
            location: { x: candidate.x, y: candidate.y },
            market: {
                sellOrders: [],
                buyOrders: [],
                auction: []
            },
            structures: [],
            upgrades: []
        });
        placed++;
      }
    }
    console.log(`CityEstateSeederService: Seeded ${result.length} estates.`);
    return result;
  }

  private determineEstateCount(
    settlement: Settlement,
    seedRandom: () => number
  ): number {
    switch (settlement.type) {
      case 'hamlet': return 0;
      case 'village': return 1 + Math.floor(seedRandom() * 2); // 1-2 estates
      case 'town': return 2 + Math.floor(seedRandom() * 3); // 2-4 estates
      case 'city':
      case 'capital': return 3 + Math.floor(seedRandom() * 3); // 3-5 estates
      default: return 2;
    }
  }

  private pickEstateTypeBasedOnBiome(biome: string, rand: () => number): EstateType | null {
    if (['grassland', 'plains', 'alpine grassland'].includes(biome)) {
      return rand() < 0.5 ? EstateType.ProductionTier1 : EstateType.ProductionTier2;
    }
    if (['forest', 'woodland', 'taiga'].includes(biome)) {
      return rand() < 0.5 ? EstateType.ProductionTier1 : EstateType.Encampment;
    }
    if (['mountain', 'rock', 'alpine'].includes(biome)) {
      return rand() < 0.5 ? EstateType.ProductionTier2 : EstateType.Residence;
    }
    if (['beach'].includes(biome)) {
      return rand() < 0.5 ? EstateType.Harbour : EstateType.Residence;
    }
    if (['swamp', 'moor'].includes(biome)) {
      return rand() < 0.5 ? EstateType.Encampment : EstateType.Infrastructure;
    }

    return null;
  }

  private generateSimpleID(): ID {
    return Math.random().toString(36).substring(2, 10) as ID;
  }
}
