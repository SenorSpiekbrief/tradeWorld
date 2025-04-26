import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class BiomeService {
  private treeMoistureTreshold = 0.3;

  getBiome(elevation: number, moisture: number, temperature: number): string {
    const isArid = moisture < this.treeMoistureTreshold;
    const isCold = temperature < 0.07;
    const isHot = temperature > 0.42;

    // Water & coast
    if (elevation < 0.12) return 'ocean';
    if (elevation < 0.18) return 'water';
    if (elevation < 0.19) return 'beach';

    // Very high rock or snow line
    if (elevation > 0.49) return 'rock';

    // Alpine transition (above tree line)
    if (elevation > 0.38) {
      return isCold ? 'tundra' : 'alpine';
    }

    // Cold, high elevation zones without trees
    if (elevation > 0.3) {
      if (isCold || isArid) return 'tundra';
      return 'alpine grassland';
    }

    // Regular temperature-based biomes
    if (isCold) {
      return isArid ? 'tundra' : 'taiga';
    }

    if (isHot) {
      return isArid ? 'desert' : 'rainforest';
    }

    if (isArid) return 'grassland';
    if (moisture < 0.3) return 'woodland';

    return 'forest';
  }
}
