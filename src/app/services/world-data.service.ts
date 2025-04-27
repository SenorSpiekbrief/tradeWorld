import { Injectable } from '@angular/core';
import { TileData } from './worldGeneration/world-map.service';
import { FileSystemService } from './filesystem.service';
import { Settlement } from '../shared/types/Settlement';
interface GameStateData {
    settlements: Settlement[];
    units: UnitData[];
  }
  
  interface SettlementData {
    id: string;
    x: number;
    y: number;
    type: 'city' | 'village' | 'outpost';
    owner: string;
    population: number;
  }
  
  interface UnitData {
    id: string;
    type: 'fleet' | 'convoy' | 'explorer';
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    owner: string;
  }
  
@Injectable({ providedIn: 'root' })
export class WorldDataService {
  constructor(private chunkFileSystemService: FileSystemService) {}

  // --- TERRAIN (Static Layer) ---

  async loadOrGenerateTerrain(
    chunkX: number,
    chunkY: number,
    generator: () => TileData[][]
  ): Promise<TileData[][]> {
    const terrain = await this.chunkFileSystemService.loadOrSaveChunkBinary(generator, chunkX, chunkY, 'maps');
    return terrain;
  }

  async saveTerrainChunk(chunk: TileData[][], chunkX: number, chunkY: number): Promise<void> {
    await this.chunkFileSystemService.saveChunkAsBinary(chunk, chunkX, chunkY, 'maps');
  }

  // --- GAME STATE (Dynamic Layer) ---

  async loadGameState(chunkX: number, chunkY: number): Promise<GameStateData> {
    return await this.chunkFileSystemService.loadJSON<GameStateData>(chunkX, chunkY, 'state') ?? { settlements: [], units: [] };
  }

  async saveGameState(chunkX: number, chunkY: number, state: GameStateData): Promise<void> {
    await this.chunkFileSystemService.saveJSON(state, chunkX, chunkY, 'state');
  }
}
