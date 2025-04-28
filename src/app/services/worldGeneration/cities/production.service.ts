import { Injectable } from '@angular/core';
import { TileData } from '../world-map.service';
import { GoodsType } from '../../../shared/enums/GoodsType';

@Injectable({ providedIn: 'root' })
export class ProductionService {
  constructor() {}

  determineProduction(
    tile: TileData,
    seedRandom: () => number
  ): GoodsType[] {
    const biome = tile.biome;

    const possibleGoods: GoodsType[] = [];

    switch (biome) {
      case 'forest':
      case 'woodland':
      case 'taiga':
        possibleGoods.push(GoodsType.Wood, GoodsType.Honey, GoodsType.Pelts);
        break;
      case 'grassland':
      case 'plains':
      case 'alpine grassland':
        possibleGoods.push(GoodsType.Grain, GoodsType.Wool, GoodsType.Meat, GoodsType.Cheese);
        break;
      case 'mountain':
      case 'rock':
      case 'alpine':
        possibleGoods.push(GoodsType.RawMetal, GoodsType.Coal, GoodsType.Stone, GoodsType.Iron);
        break;
      case 'beach':
      case 'water':
      case 'ocean':
        possibleGoods.push(GoodsType.Stockfish, GoodsType.Fish, GoodsType.Salt);
        break;
      case 'swamp':
      case 'moor':
        possibleGoods.push(GoodsType.Pitch, GoodsType.Salt, GoodsType.Meat);
        break;
      case 'jungle':
      case 'rainforest':
        possibleGoods.push(GoodsType.Spices, GoodsType.Cotton, GoodsType.Sugar);
        break;
      default:
        // fallback for unknown biomes
        possibleGoods.push(GoodsType.Grain, GoodsType.Wool);
        break;
    }

    const picks: Set<GoodsType> = new Set();

    const pickCount = 3 + Math.floor(seedRandom() * 3); // Pick 3 to 5 goods

    while (picks.size < pickCount && possibleGoods.length > 0) {
      const pick = possibleGoods[Math.floor(seedRandom() * possibleGoods.length)];
      picks.add(pick);
    }

    return Array.from(picks);
  }
}
