import { Injectable } from '@angular/core';
import { CellData } from './worldGeneration/world-map.service';
import { FileSystemService } from './chunk-filesystem.service';
import { Settlement } from '../shared/types/Settlement';
import { PlayerState } from '../shared/types/PlayerState';
import { ID } from '../shared/types/ID';
import { GameStateFileSystemService } from './game-state-filesystem.service';

export interface GameStateData {
    id: ID;
    chunk:ID;
    settlements: Settlement[];
    units: UnitData[];
    players: PlayerState[];
  }
  
export interface UnitData {
    id: ID;
    type: 'fleet' | 'convoy' | 'explorer';
    x: number;
    y: number;
    owner: ID;
    meta:any;
  }
  
@Injectable({ providedIn: 'root' })
export class WorldDataService {
  constructor(private chunkFileSystemService: FileSystemService,
            private gameStateFileSystemService: GameStateFileSystemService
  ) {}

  // --- TERRAIN (Static Layer) ---

  async loadOrGenerateTerrain(
    chunkX: number,
    chunkY: number,
    generator: () => CellData[][]
  ): Promise<CellData[][]> {
    const terrain = await this.chunkFileSystemService.loadOrSaveChunkBinary(generator, chunkX, chunkY);
    return terrain;
  }

  async saveTerrainChunk(chunk: CellData[][], chunkX: number, chunkY: number): Promise<void> {
    await this.chunkFileSystemService.saveChunkAsBinary(chunk, chunkX,chunkY);
  }

  // --- GAME STATE (Dynamic Layer) ---

  async loadGameState(chunkX: number, chunkY: number): Promise<GameStateData|undefined> {
    return await this.gameStateFileSystemService.loadGameState(`${chunkX}_${chunkY}`) //loadJSON<GameStateData>(chunkX, chunkY, 'state') ?? { settlements: [], units: [] };
  }

  async saveGameState(chunkX: number, chunkY: number, state: GameStateData): Promise<void> {
    await this.gameStateFileSystemService.saveGameState(`${chunkX}_${chunkY}`,state) // .saveChunkAsJSON(state, chunkX, chunkY, 'state');
  }
}
