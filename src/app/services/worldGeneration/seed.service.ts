import { Injectable } from '@angular/core';
import { createNoise2D } from 'simplex-noise';

@Injectable({ providedIn: 'root' })
export class SeedService {
  private rng!: () => number;
  private noise2D!: (x: number, y: number) => number;

  setSeed(seed: string): void {
    this.rng = this.seededRandom(seed);
    this.noise2D = createNoise2D(this.rng);
  }

  getNoise(): (x: number, y: number) => number {
    return this.noise2D;
  }

  getSeededRandom(): () => number {
    return this.rng;
  }

  private seededRandom(seed: string): () => number {
    let h = 1779033703 ^ seed.length;
    for (let i = 0; i < seed.length; i++) {
      h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function() {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      return (h >>> 0) / 4294967296;
    };
  }

}