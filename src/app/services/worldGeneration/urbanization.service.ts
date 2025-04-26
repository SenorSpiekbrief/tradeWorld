import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UrbanizationService {
  private size = 2048;
  private cityCount = 12;

  constructor() {}

  placeUrbanCenters(tilemapData: any) {
    const { tilemap, overlays } = tilemapData;
    const urbanCenters = this.identifyUrbanCenters(overlays.urbanization);
    const structures = this.placeStructures(urbanCenters, overlays);
    return { urbanCenters, structures };
  }

  private identifyUrbanCenters(urbanizationMap: number[][]): [number, number][] {
    const centers: [number, number][] = [];
    
    while (centers.length < this.cityCount) {
      let x = Math.floor(Math.random() * this.size);
      let y = Math.floor(Math.random() * this.size);
      if (urbanizationMap[y][x] > 0.6) {
        centers.push([x, y]);
      }
    }
    return centers;
  }

  private placeStructures(centers: [number, number][], overlays: any) {
    const structures = new Array(this.size)
      .fill(null)
      .map(() => new Array(this.size).fill(null).map(() => []));
    
    centers.forEach(([cx, cy]) => {
      for (let dy = -10; dy <= 10; dy++) {
        for (let dx = -10; dx <= 10; dx++) {
          let x = cx + dx;
          let y = cy + dy;
          if (x >= 0 && y >= 0 && x < this.size && y < this.size) {
            if (overlays.urbanization[y][x] > 0.4) {
              structures[y][x] = this.generateBuildings(x, y);
            }
          }
        }
      }
    });
    return structures;
  }

  private generateBuildings(x: number, y: number) {
    const buildings = [];
    const numBuildings = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < numBuildings; i++) {
      buildings.push({ type: this.randomBuildingType(), position: [Math.random(), Math.random()] });
    }
    return buildings;
  }

  private randomBuildingType(): string {
    const types = ['house', 'market', 'workshop', 'warehouse', 'temple'];
    return types[Math.floor(Math.random() * types.length)];
  }
}
