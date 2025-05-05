// file: tilemap-visualization.service.ts
import { Injectable } from '@angular/core';
import { CellData } from '../worldGeneration/world-map.service';

@Injectable({ providedIn: 'root' })
export class TilemapVisualizationService {
  createCanvasFromChunk(chunk: CellData[][], tilesPerCellX: number, tilesPerCellY: number): HTMLCanvasElement {
    const width = chunk[0].length * tilesPerCellX;
    const height = chunk.length * tilesPerCellY;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    const imgData = ctx.createImageData(width, height);

    for (let cy = 0; cy < chunk.length; cy++) {
      for (let cx = 0; cx < chunk[cy].length; cx++) {
        const cell = chunk[cy][cx];
        for (let layer = 0; layer < cell.tiles.length; layer++) {
          for (let ty = 0; ty < cell.tiles[layer].length; ty++) {
            for (let tx = 0; tx < cell.tiles[layer][ty].length; tx++) {
              const tile = cell.tiles[layer][ty][tx];
              const px = cx * tilesPerCellX + tx;
              const py = cy * tilesPerCellY + ty;
              const idx = (py * width + px) * 4;
              const color = this.spriteToColor(tile.sprite);
              imgData.data[idx + 0] = color[0];
              imgData.data[idx + 1] = color[1];
              imgData.data[idx + 2] = color[2];
              imgData.data[idx + 3] = 255;
            }
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

  private spriteToColor(sprite: string): [number, number, number] {
    const hash = sprite.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return [(hash * 23) % 255, (hash * 47) % 255, (hash * 71) % 255];
  }
}
