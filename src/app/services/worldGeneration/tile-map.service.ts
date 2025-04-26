import { Injectable } from '@angular/core';
import { SimplexNoise } from 'simplex-noise';
import seedrandom from 'seedrandom';

@Injectable({ providedIn: 'root' })
export class TilemapService {
  private size = 2048;
  private seaLevel = 0.5;
  private simplex1: SimplexNoise;
  private simplex2: SimplexNoise;

  constructor() {}

  generateTilemap(seed: string) {
    const rng = seedrandom(seed);
    this.simplex1 = new SimplexNoise(rng);
    this.simplex2 = new SimplexNoise(rng);
    const tilemap = new Array(this.size).fill(null).map(() => new Array(this.size).fill(0));
    
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const nx = x / this.size - 0.5;
        const ny = y / this.size - 0.5;
        
        // Base terrain noise
        let elevation = this.generateElevation(nx, ny);
        tilemap[y][x] = elevation;
      }
    }
    
    const rivers = this.generateRivers(tilemap);
    const overlays = this.generateOverlays(tilemap, rivers);
    
    return { tilemap, rivers, overlays };
  }

  private generateElevation(x: number, y: number): number {
    let elevation = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxAmplitude = 0;

    for (let i = 0; i < 5; i++) { // Multi-octave noise for ruggedness
      elevation += amplitude * this.simplex1.noise2D(x * frequency, y * frequency);
      elevation += amplitude * this.simplex2.noise2D((x - y) * frequency, (x + y) * frequency); // Rotated 45°
      maxAmplitude += amplitude;
      frequency *= 2;
      amplitude *= 0.5;
    }
    
    return elevation / maxAmplitude;
  }

  private generateRivers(tilemap: number[][]): number[][] {
    const rivers = new Array(this.size).fill(null).map(() => new Array(this.size).fill(0));
    for (let i = 0; i < 50; i++) { // Number of rivers
      let x = Math.floor(Math.random() * this.size);
      let y = Math.floor(Math.random() * this.size);
      while (tilemap[y][x] < this.seaLevel) {
        x = Math.floor(Math.random() * this.size);
        y = Math.floor(Math.random() * this.size);
      }
      
      while (tilemap[y][x] > this.seaLevel) { // Flow downward
        rivers[y][x] = 1;
        let [nextX, nextY] = this.findLowestNeighbor(tilemap, x, y);
        if (nextX === x && nextY === y) break; // Stop if no lower point
        x = nextX;
        y = nextY;
      }
    }
    return rivers;
  }

  private findLowestNeighbor(tilemap: number[][], x: number, y: number): [number, number] {
    let minHeight = tilemap[y][x];
    let lowest = [x, y];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    for (let [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < this.size && ny < this.size) {
        if (tilemap[ny][nx] < minHeight) {
          minHeight = tilemap[ny][nx];
          lowest = [nx, ny];
        }
      }
    }
    return lowest;
  }

  private generateOverlays(tilemap: number[][], rivers: number[][]) {
    const overlays = {
      shipPathfinding: new Array(this.size).fill(null).map(() => new Array(this.size).fill(0)),
      structures: new Array(this.size).fill(null).map(() => new Array(this.size).fill(null)),
      urbanization: new Array(this.size).fill(null).map(() => new Array(this.size).fill(0)),
      biomes: new Array(this.size).fill(null).map(() => new Array(this.size).fill('')),
    };
    
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const elevation = tilemap[y][x];
        overlays.shipPathfinding[y][x] = elevation < this.seaLevel ? 1 : 0;
        overlays.urbanization[y][x] = this.calculateUrbanization(elevation, rivers[y][x]);
        overlays.biomes[y][x] = this.determineBiome(elevation);
      }
    }
    return overlays;
  }

  private calculateUrbanization(elevation: number, river: number): number {
    if (elevation < this.seaLevel || river) return 0.8; // Coastal or river areas favor urbanization
    if (elevation > 0.8) return 0.2; // Mountains are less urbanized
    return 0.5;
  }

  private determineBiome(elevation: number): string {
    if (elevation < this.seaLevel) return 'water';
    if (elevation < this.seaLevel + 0.05) return 'coast';
    if (elevation < 0.6) return 'plains';
    if (elevation < 0.8) return 'hills';
    return 'mountains';
  }
}
