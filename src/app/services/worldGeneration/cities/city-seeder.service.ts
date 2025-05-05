import { Injectable } from "@angular/core";
import { Settlement } from "../../../shared/types/Settlement";
import { WorldSessionService } from "../../world-session.service";
import { CellData } from "../world-map.service";
import { WorldExpansionService } from "./world-expansion.service";
import { LocationService } from "./location.service";
import { CityGeneratorService } from "./city-generator.service";
import { Route } from "../../../shared/types/Route";

@Injectable({ providedIn: 'root' })
export class CitySeederService {
  constructor(
    private worldSessionService: WorldSessionService,
    private worldExpansionService: WorldExpansionService,
    private locationService: LocationService,
    private cityGeneratorService: CityGeneratorService
  ) {}

  async seedConnectedWorld(
    chunk: CellData[][],
    seedRandom: () => number,
    chunkX: number,
    chunkY: number,
    iterations: number = 7
  ): Promise<Settlement[]> {
    const settlements: Settlement[] = [];
    const routes: Route[] = [];

    // === 1. Find a starting coastal location ===
    const startLoc = this.locationService.findCoastalLocations(chunk, seedRandom, 1)[0];
    if (!startLoc) {
      console.warn("No starting coastal location found!");
      return settlements;
    }

    const globalStartX = chunkX * 512 + startLoc.x;
    const globalStartY = chunkY * 512 + startLoc.y;

    const startSettlement = this.cityGeneratorService.createSettlementAt(
      globalStartX,
      globalStartY,
      'coastal',
      seedRandom
    );
    settlements.push(startSettlement);

    // === 2. Expand the world logically ===
    const newSettlements = await this.worldExpansionService.structuredWorldExpansion(
      startSettlement,
      seedRandom
    );

    settlements.push(...newSettlements);

    // === 3. (Optional) You can generate routes separately here if you want
    // But better: have the WorldExpansionService manage route generation when creating cities.

    // === 4. Save to world session ===
    this.worldSessionService.setSettlements(settlements);
    // NOTE: if you generate routes separately, also call setRoutes(routes)

    console.log(`CitySeederService: Seeded ${settlements.length} settlements.`);
    return settlements;
  }
}
