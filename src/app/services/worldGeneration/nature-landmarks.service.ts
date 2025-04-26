import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NatureLandmarksService {
  private size = 2048;

  constructor() {}

  generateLandmarks(tilemapData: any) {
    const { tilemap, overlays, rivers } = tilemapData;
    const landmarks = new Array(this.size)
      .fill(null)
      .map(() => new Array(this.size).fill(null).map(() => []));
    
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const elevation = tilemap[y][x];
        this.placeTrees(landmarks[y][x], elevation, overlays.biomes[y][x]);
        this.placeRocks(landmarks[y][x], elevation);
        this.placeCliffs(landmarks[y][x], elevation, tilemap, x, y);
        this.placeLakes(landmarks[y][x], tilemap, x, y);
        this.placeCaves(landmarks[y][x], elevation);
        this.placeWaterfalls(landmarks[y][x], rivers, tilemap, x, y);
      }
    }
    return landmarks;
  }

  private placeTrees(cell: any[], elevation: number, biome: string) {
    if (biome === 'plains' || biome === 'hills') {
      if (Math.random() < 0.3) {
        cell.push({ type: 'tree' });
      }
    }
  }

  private placeRocks(cell: any[], elevation: number) {
    if (elevation > 0.7 && Math.random() < 0.2) {
      cell.push({ type: 'rock' });
    }
  }

  private placeCliffs(cell: any[], elevation: number, tilemap: number[][], x: number, y: number) {
    const neighbors = [
      tilemap[y - 1]?.[x],
      tilemap[y + 1]?.[x],
      tilemap[y]?.[x - 1],
      tilemap[y]?.[x + 1],
    ].filter(n => n !== undefined);
    
    if (neighbors.some(n => Math.abs(n - elevation) > 0.2)) {
      cell.push({ type: 'cliff' });
    }
  }

  private placeLakes(cell: any[], tilemap: number[][], x: number, y: number) {
    if (tilemap[y][x] < 0.55 && tilemap[y][x] > 0.5 && Math.random() < 0.05) {
      cell.push({ type: 'lake' });
    }
  }

  private placeCaves(cell: any[], elevation: number) {
    if (elevation > 0.8 && Math.random() < 0.05) {
      cell.push({ type: 'cave' });
    }
  }

  private placeWaterfalls(cell: any[], rivers: number[][], tilemap: number[][], x: number, y: number) {
    if (rivers[y][x] === 1) {
      const neighbors = [
        tilemap[y - 1]?.[x],
        tilemap[y + 1]?.[x],
        tilemap[y]?.[x - 1],
        tilemap[y]?.[x + 1],
      ].filter(n => n !== undefined);
      
      if (neighbors.some(n => Math.abs(n - tilemap[y][x]) > 0.2) && Math.random() < 0.1) {
        cell.push({ type: 'waterfall' });
      }
    }
  }
}
