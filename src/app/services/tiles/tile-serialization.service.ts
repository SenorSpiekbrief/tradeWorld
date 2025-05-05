// file: tile-serialization.service.ts
import { Injectable } from '@angular/core';
import { Tile } from '../worldGeneration/world-map.service';

@Injectable({ providedIn: 'root' })
export class TileSerializationService {
  serializeTiles(tiles?: Tile[][][]): string[][][] {
    return tiles ? tiles.map(layer =>
      layer.map(row =>
        row.map(tile => tile.sprite)
      )
    ):[];
  }

  deserializeTiles(data: string[][][]): Tile[][][] {
    return data.map(layer =>
      layer.map(row =>
        row.map(sprite => ({
          sprite,
          inventory: {
            equipment:{}, 
            assets:{
              wallet:{
                  thalers: 0,
                  gold: 0,
                  dollars: 0,
                  guilders: 0,
                  florins: 0
                }
            }
        }
        }))
      )
    );
  }
}
