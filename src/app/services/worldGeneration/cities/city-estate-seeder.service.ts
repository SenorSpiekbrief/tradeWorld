import { Injectable } from '@angular/core';
import { TileData } from '../world-map.service';
import { Settlement } from '../../../shared/types/Settlement';
import { StructureType } from '../../../shared/enums/StructureType';
import { EstateType } from '../../../shared/enums/EstateType';
import { ID } from '../../../shared/types/ID';

@Injectable({ providedIn: 'root' })
export class CityEstateSeederService {
  constructor() {}

  seedEstatesAroundSettlement(
    settlement: Settlement,
    chunk: TileData[][],
    seedRandom: () => number
  ): void {
    const estateCount = this.determineEstateCount(settlement, seedRandom);

    const candidates: { x: number; y: number; biome: string }[] = [];

    const scanRadius = 20; // search within 20 tiles radius

    for (let dy = -scanRadius; dy <= scanRadius; dy++) {
      for (let dx = -scanRadius; dx <= scanRadius; dx++) {
        const tx = settlement.x + dx;
        const ty = settlement.y + dy;
        const tile = chunk[ty]?.[tx];
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
        settlement.estates.push({
          id: this.generateSimpleID(),
          type: estateType,
          name: `${estateType}_${placed}`,
          location: { x: candidate.x, y: candidate.y }
        });
        placed++;
      }
    }
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
      return rand() < 0.5 ? EstateType.ProductionTier1 : EstateType.ProductionTier2; // Farm estates
    }
    if (['forest', 'woodland', 'taiga'].includes(biome)) {
      return EstateType.ProductionTier1; // Logging camps
    }
    if (['mountain', 'rock', 'alpine'].includes(biome)) {
      return EstateType.ProductionTier2; // Mines
    }
    if (['beach', 'water', 'ocean'].includes(biome)) {
      return EstateType.Shipyard; // Docks, fisheries
    }
    if (['swamp', 'moor'].includes(biome)) {
      return EstateType.ProductionTier1; // Peat, Salt
    }

    return null; // Not suitable
  }

  private generateSimpleID(): ID {
    return Math.random().toString(36).substring(2, 10) as ID;
  }
}
