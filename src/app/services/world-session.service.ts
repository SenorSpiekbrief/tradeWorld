import { Injectable } from '@angular/core';
import { Settlement } from '../shared/types/Settlement';

@Injectable({ providedIn: 'root' })
export class WorldSessionService {
  private startingChunk: { x: number; y: number } | null = null;
  private startingTile: { x: number; y: number } | null = null;
  private settlements: Settlement[] = [];

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
  
  setSettlements(settlements: Settlement[]): void {
    this.settlements = settlements;
  }

  getSettlements(): Settlement[] {
    return this.settlements;
  }

}
