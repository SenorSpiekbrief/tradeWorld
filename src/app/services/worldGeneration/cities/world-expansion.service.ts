import { Injectable } from '@angular/core';
import { Settlement } from '../../../shared/types/Settlement';
import { WorldTileService } from '../../world-tile.service';
import { CityGeneratorService } from './city-generator.service';
import { RouteGeneratorService } from './route-generator.service';
import { TileData } from '../world-map.service';
import { Route } from '../../../shared/types/Route';
import { WorldSessionService } from '../../world-session.service';

@Injectable({ providedIn: 'root' })
export class WorldExpansionService {
  constructor(
    private worldTileService: WorldTileService,
    private cityGeneratorService: CityGeneratorService,
    private routeGeneratorService: RouteGeneratorService,
    private worldSessionService:WorldSessionService,
  ) {}


  async structuredWorldExpansion(
    start: Settlement,
    seedRandom: () => number,
    targetSettlementCount: number = 30
  ): Promise<Settlement[]> {
    const settlements: Settlement[] = [start];
    const routes: Route[] = [];
  
    let frontier: Settlement[] = [start];
  
    while (settlements.length < targetSettlementCount && frontier.length > 0) {
      const current = frontier.shift();
      if (!current) break;
  
      // === 1. Find 2 coastal neighbors for current city
      const coastalNeighbors = await this.findCoastalNeighbors(current, 2, seedRandom);
  
      for (const neighborPoint of coastalNeighbors) {
        const minDistance = 6; // Minimum 6 tiles away
        if (!this.isLocationFarEnough(settlements, neighborPoint.x, neighborPoint.y, minDistance)) {
          console.warn('Coastal candidate too close to existing settlement.');
          continue;
        }
  
        const newCoastalSettlement = await this.cityGeneratorService.createSettlementAt(
          neighborPoint.x,
          neighborPoint.y,
          'coastal',
          seedRandom
        );
        settlements.push(newCoastalSettlement);
  
        const seaPath = await this.routeGeneratorService.findSeaRoute(current, newCoastalSettlement, seedRandom);
        routes.push(this.createRoute(current.id, newCoastalSettlement.id, seaPath, 'sea'));
  
        frontier.push(newCoastalSettlement);
  
        if (settlements.length >= targetSettlementCount) break;
  
        // === 2. 50% chance inland expansion from coastal
        if (seedRandom() < 0.5) {
          const inlandPoint = await this.findInlandNeighbor(newCoastalSettlement, 6, 20, seedRandom);
  
          if (inlandPoint && this.isLocationFarEnough(settlements, inlandPoint.x, inlandPoint.y, minDistance)) {
            const inlandSettlement = await this.cityGeneratorService.createSettlementAt(
              inlandPoint.x,
              inlandPoint.y,
              'inland',
              seedRandom
            );
            settlements.push(inlandSettlement);
  
            const landPath = await this.routeGeneratorService.findLandRoute(newCoastalSettlement, inlandSettlement, seedRandom);
            routes.push(this.createRoute(newCoastalSettlement.id, inlandSettlement.id, landPath, 'land'));
  
            frontier.push(inlandSettlement);
  
            if (settlements.length >= targetSettlementCount) break;
  
            // === 3. 50% chance to chain another inland city
            if (seedRandom() < 0.5) {
              const furtherInlandPoint = await this.findInlandNeighbor(inlandSettlement, 12, 30, seedRandom);
  
              if (furtherInlandPoint && this.isLocationFarEnough(settlements, furtherInlandPoint.x, furtherInlandPoint.y, minDistance)) {
                const furtherInlandSettlement = await this.cityGeneratorService.createSettlementAt(
                  furtherInlandPoint.x,
                  furtherInlandPoint.y,
                  'inland',
                  seedRandom
                );
                settlements.push(furtherInlandSettlement);
  
                const furtherLandPath = await this.routeGeneratorService.findLandRoute(inlandSettlement, furtherInlandSettlement, seedRandom);
                routes.push(this.createRoute(inlandSettlement.id, furtherInlandSettlement.id, furtherLandPath, 'land'));
  
                frontier.push(furtherInlandSettlement);
              }
            }
          }
        }
      }
    }
  
    // === Save to session
    this.worldSessionService.setSettlements(settlements);
    this.worldSessionService.setRoutes(routes);
  
    console.log(`Structured expansion: ${settlements.length} settlements generated.`);
    return settlements;
  }
  
  private createRoute(
    fromId: string,
    toId: string,
    path: { x: number; y: number }[],
    type: 'sea' | 'land'
  ): Route {
    return {
      fromSettlementId: fromId,
      toSettlementId: toId,
      path,
      distance: path.length,
      type
    };
  }
  async generateSeaRouteBetween(
    from: Settlement,
    to: Settlement,
    seedRandom: () => number
  ): Promise<{ x: number; y: number }[]> {
    return this.routeGeneratorService.findSeaRoute(from, to, seedRandom);
  }
  
  async generateLandRouteBetween(
    from: Settlement,
    to: Settlement,
    seedRandom: () => number
  ): Promise<{ x: number; y: number }[]> {
    return this.routeGeneratorService.findLandRoute(from, to, seedRandom);
  }
  
  async findInlandNeighbor(
    from: Settlement,
    minDist: number,
    maxDist: number,
    seedRandom: () => number
  ): Promise<{ x: number; y: number } | null> {
    const maxAttempts = 100;
  
    const validLandBiomes = ['grassland', 'forest', 'woodland', 'taiga', 'tundra', 'desert', 'mountain', 'rock', 'alpine'];
  
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const angle = seedRandom() * Math.PI * 2;
      const dist = minDist + seedRandom() * (maxDist - minDist);
      const dx = Math.round(Math.cos(angle) * dist);
      const dy = Math.round(Math.sin(angle) * dist);
  
      const x = from.x + dx;
      const y = from.y + dy;
  
      const tile = await this.worldTileService.getTile(x, y);
      if (!tile) continue;
  
      if (validLandBiomes.includes(tile.biome)) {
        return { x, y };
      }
    }
  
    return null;
  }
  
  
  async findCoastalNeighbors(
    start: Settlement,
    count: number,
    seedRandom: () => number
  ): Promise<{ x: number; y: number }[]> {
    const candidates: { x: number; y: number }[] = [];
    const searchRadius = 80;
  
    for (let attempts = 0; attempts < 1000 && candidates.length < count; attempts++) {
      const angle = seedRandom() * Math.PI * 2;
      const dist = 12 + seedRandom() * (searchRadius - 12);
      const dx = Math.round(Math.cos(angle) * dist);
      const dy = Math.round(Math.sin(angle) * dist);
  
      const x = start.x + dx;
      const y = start.y + dy;
  
      const tile = await this.worldTileService.getTile(x, y);
      if (!tile) continue;
  
      // 🎯 Critical fix:
      const isBeach = tile.biome === 'beach';
      if (!isBeach) continue;
  
      // 🎯 Make sure adjacent to true ocean or water
      let hasOceanWaterAdjacent = false;
      for (const [adx, ady] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const adjTile = await this.worldTileService.getTile(x + adx, y + ady);
        if (adjTile && (adjTile.biome === 'ocean' || adjTile.biome === 'water')) {
          hasOceanWaterAdjacent = true;
          break;
        }
      }
  
      if (!hasOceanWaterAdjacent) continue;
  
      candidates.push({ x, y });
    }
  
    return candidates;
  }
  
  private isLocationFarEnough(
    settlements: Settlement[],
    candidateX: number,
    candidateY: number,
    minDistance: number
  ): boolean {
    for (const city of settlements) {
      const dx = city.x - candidateX;
      const dy = city.y - candidateY;
      const distance = Math.sqrt(dx * dx + dy * dy);
  
      if (distance < minDistance) {
        return false;
      }
    }
    return true;
  }
  
}
