import { Injectable } from '@angular/core';
import { Settlement } from '../shared/types/Settlement';
import { Route } from '../shared/types/Route';

@Injectable({ providedIn: 'root' })
export class WorldSessionService {
  private startingChunk: { x: number; y: number } | null = null;
  private startingTile: { x: number; y: number } | null = null;
  private settlements: Settlement[] = [];
  private routes: Route[] = [];

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
  // === Routes Management ===
  setRoutes(routes: Route[]): void {
    this.routes = routes;
  }

  getRoutes(): Route[] {
    return this.routes;
  }
  getPlayerPosition(): { x: number; y: number } | null {
    //const player = this.currentPlayer;
    //if (!player) return null;
    return this.settlements[0].location;
  }
  // === Reset (if needed)
  clearSession(): void {
    this.startingChunk = null;
    this.settlements = [];
    this.routes = [];
  }
}
