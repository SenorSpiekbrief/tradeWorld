import { Injectable } from "@angular/core";
import { SeedService } from "./seed.service";
import { ElevationService } from "./elevation.service";
import { ClimateService } from "./climate.service";
import { BiomeService } from "./biome.service";
import { LandmarkService } from "./landmark.service";

export interface TileData {
    elevation: number;
    moisture: number;
    temperature: number;
    biome: string;
  }
  
  @Injectable({ providedIn: 'root' })
  export class WorldMapService {
    constructor(
      private seed: SeedService,
      private elev: ElevationService,
      private climate: ClimateService,
      private biome: BiomeService,
      private landmarkService: LandmarkService
    ) {}
  
    setSeed(seed: string): void {
      this.seed.setSeed(seed);
    }
  
    generateChunk(xStart: number, yStart: number, width: number, height: number): TileData[][] {
        const elevationMap: number[][] = [];
      
        for (let y = 0; y < height; y++) {
          const row: number[] = [];
          for (let x = 0; x < width; x++) {
            const wx = xStart + x;
            const wy = yStart + y;
            row.push(this.elev.getElevation(wx, wy));
          }
          elevationMap.push(row);
        }
      
        // 🌄 Apply integrated elevation shaping here
        this.landmarkService.applyElevationLandmarks(elevationMap, xStart, yStart);
      
        // Convert elevation map to tile data with climate and biome
        const chunk: TileData[][] = [];
        for (let y = 0; y < height; y++) {
          const row: TileData[] = [];
          for (let x = 0; x < width; x++) {
            const wx = xStart + x;
            const wy = yStart + y;
            const e = elevationMap[y][x];
            const m = this.climate.getMoisture(wx, wy);
            const t = this.climate.getTemperature(wx, wy);
            const b = this.biome.getBiome(e, m, t);
            row.push({ elevation: e, moisture: m, temperature: t, biome: b });
          }
          chunk.push(row);
        }
      
        return chunk;
      }
  }
  