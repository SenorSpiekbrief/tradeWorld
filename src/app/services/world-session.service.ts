import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WorldSessionService {
  private startingChunk: { x: number; y: number } | null = null;
  private startingTile: { x: number; y: number } | null = null;

  setStartingChunk(x: number, y: number): void {
    this.startingChunk = { x, y };
  }

  getStartingChunk(): { x: number; y: number } | null {
    return this.startingChunk;
  }

  setStartingTile(x: number, y: number): void {
    this.startingTile = { x, y };
  }

  getStartingTile(): { x: number; y: number } | null {
    return this.startingTile;
  }
}
