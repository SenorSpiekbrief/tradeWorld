import { Injectable } from '@angular/core';
import { CellData, WorldMapService } from './worldGeneration/world-map.service';

@Injectable({ providedIn: 'root' })
export class WorldTileService {
  private chunkSize = 512;
  private chunkMap = new Map<string, CellData[][]>();

  constructor(private worldMapService: WorldMapService) {}

  // Key format "chunkX:chunkY"
  private getChunkKey(chunkX: number, chunkY: number): string {
    return `${chunkX}:${chunkY}`;
  }

  async getTile(globalX: number, globalY: number): Promise<CellData | null> {
    const chunkX = Math.floor(globalX / this.chunkSize);
    const chunkY = Math.floor(globalY / this.chunkSize);

    const chunk = await this.loadOrGenerateChunk(chunkX, chunkY);

    const localX = ((globalX % this.chunkSize) + this.chunkSize) % this.chunkSize;
    const localY = ((globalY % this.chunkSize) + this.chunkSize) % this.chunkSize;

    if (chunk[localY] && chunk[localY][localX]) {
      return chunk[localY][localX];
    }
    return null;
  }

  async loadOrGenerateChunk(chunkX: number, chunkY: number): Promise<CellData[][]> {
    const key = this.getChunkKey(chunkX, chunkY);

    if (this.chunkMap.has(key)) {
      return this.chunkMap.get(key)!;
    }

    console.log(`Generating chunk at ${chunkX}, ${chunkY}`);

    // Generate a new chunk
    const newChunk = this.worldMapService.generateChunk(
      chunkX * this.chunkSize,
      chunkY * this.chunkSize,
      this.chunkSize,
      this.chunkSize
    );

    this.chunkMap.set(key, newChunk);
    return newChunk;
  }
}
