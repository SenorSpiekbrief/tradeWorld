// consistent-river.service.ts
import { Injectable } from "@angular/core";
import { CellData } from "../worldGeneration/world-map.service";
import { SeedService } from "./seed.service";

@Injectable({ providedIn: 'root' })
export class RiverService {
  private cachedPaths: Map<string, [number, number][]> = new Map();

  constructor(private seedService: SeedService) {}

  generateRivers(
    chunk: CellData[][],
    xStart: number,
    yStart: number,
    chunkWidth: number,
    chunkHeight: number
  ): void {
    const coastPoints = this.findCoastalCandidates(chunk);
    const sources = this.filterIntervalSources(coastPoints, 50, 3);
    for (const [sx, sy] of sources) {
      const path = this.traceUphillRiver(sx, sy, chunk);
      if (path.length > 5) {
        const end = path[path.length - 1];
        if (!this.isNearBoundary(end[0], end[1], chunkWidth, chunkHeight)) {
          this.carveRiver(chunk, path);
          const key = `${xStart + sx}:${yStart + sy}`;
          this.cachedPaths.set(key, path);
        }
      }
    }
  }

  private findCoastalCandidates(chunk: CellData[][]): [number, number][] {
    const points: [number, number][] = [];
    for (let y = 1; y < chunk.length - 1; y++) {
      for (let x = 1; x < chunk[0].length - 1; x++) {
        const tile = chunk[y][x];
        if (tile.elevation < 0.2) {
          for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
            const nx = x + dx;
            const ny = y + dy;
            const n = chunk[ny]?.[nx];
            if (n && n.elevation >= 0.2) {
              points.push([x, y]);
              break;
            }
          }
        }
      }
    }
    return points;
  }

  private filterIntervalSources(points: [number, number][], interval: number, minDistance: number): [number, number][] {
    const accepted: [number, number][] = [];
    for (const pt of points) {
      if (accepted.every(([ax, ay]) => this.distance(ax, ay, pt[0], pt[1]) >= minDistance)) {
        accepted.push(pt);
        if (accepted.length >= 1 && this.distance(accepted[accepted.length - 1][0], accepted[0][0], pt[1], accepted[0][1]) >= interval) {
          break;
        }
      }
    }
    return accepted;
  }

  private traceUphillRiver(sx: number, sy: number, chunk: CellData[][]): [number, number][] {
    const path: [number, number][] = [[sx, sy]];
    let x = sx;
    let y = sy;

    const maxSteps = 200;
    const directions: [number, number][] = [[0, -1], [1, 0], [0, 1], [-1, 0]];

    for (let i = 0; i < maxSteps; i++) {
      let highest = chunk[y][x].elevation;
      let next: [number, number] = [x, y];
      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        if (ny < 0 || ny >= chunk.length || nx < 0 || nx >= chunk[0].length) continue;
        const neighbor = chunk[ny][nx];
        if (neighbor.elevation > highest) {
          highest = neighbor.elevation;
          next = [nx, ny];
        }
      }
      if (next[0] === x && next[1] === y) break;
      path.push([next[0], next[1]]);
      x = next[0];
      y = next[1];

      if (i > 3 && this.isLocalMax(x, y, chunk)) break;
    }

    return path;
  }

  private isLocalMax(x: number, y: number, chunk: CellData[][]): boolean {
    const current = chunk[y][x].elevation;
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      const nx = x + dx;
      const ny = y + dy;
      const neighbor = chunk[ny]?.[nx];
      if (neighbor && neighbor.elevation > current) return false;
    }
    return true;
  }

  private carveRiver(chunk: CellData[][], path: [number, number][]): void {
    for (let i = 0; i < path.length - 4; i++) {
      const [x, y] = path[i];
      const tile = chunk[y][x];
      tile.elevation = Math.max(0, tile.elevation - 0.02);
      tile.moisture = Math.min(1, tile.moisture + 0.3);
      tile.biome = 'water';
    }
  }

  private distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  private isNearBoundary(x: number, y: number, width: number, height: number): boolean {
    return x < 2 || y < 2 || x > width - 3 || y > height - 3;
  }

  getCachedPath(x: number, y: number): [number, number][] | undefined {
    return this.cachedPaths.get(`${x}:${y}`);
  }
}