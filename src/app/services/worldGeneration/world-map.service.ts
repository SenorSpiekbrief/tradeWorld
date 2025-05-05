import { Injectable } from "@angular/core";
import { SeedService } from "./seed.service";
import { ElevationService } from "./elevation.service";
import { ClimateService } from "./climate.service";
import { BiomeService } from "./biome.service";
import { LandmarkService } from "./landmark.service";
import { Inventory } from "../../shared/types/Inventory";
import { ID } from "../../shared/types/ID";


  /** CELL = 512 × 512 tiles */
  export interface CellData {
    id?: ID;
    elevation: number;
    moisture: number;
    temperature: number;
    biome: string;
  
    tiles?: Tile[][][]; // [layer][tileY][tileX]
  
    features?: CellFeature[]; // dynamic feature definitions
  }
  export interface CellFeature {
    type: string; // 'road', 'river', 'rail'
    connections: Direction[]; // simplified
    data?: Record<string, any>; // optional metadata
  }
  export type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
  export interface Tile {
    sprite:string;
    inventory?:Inventory; //for chests
    linkedTileData?:Tile; //for doors
  }

  /** CHUNK = 512 × 512 cells */
  export interface ChunkData {
    cells: CellData[][];
    isSaved: boolean;               // for save-on-exit
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
  
    generateChunk(xStart: number, yStart: number, width: number, height: number): CellData[][] {
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
        const chunk: CellData[][] = [];
        for (let y = 0; y < height; y++) {
          const row: CellData[] = [];
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
  