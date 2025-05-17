import { WorldDataService } from "../../services/world-data.service";
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { CellData, WorldMapService } from "../../services/worldGeneration/world-map.service";
import { FileSystemService } from "../../services/chunk-filesystem.service";
import { WorldSessionService } from "../../services/world-session.service";
import { MapControlService } from "../../services/map-control.service";
import { SeedService } from "../../services/worldGeneration/seed.service";
import { NpcSeederService } from "../../services/worldGeneration/npc.seeder.service";
import { CitySeederService } from "../../services/worldGeneration/cities/city-seeder.service";
import { CityEstateSeederService } from "../../services/worldGeneration/cities/city-estate-seeder.service";

@Component({
    selector: 'app-loading',
    standalone: true,
    imports: [MatProgressBarModule],
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.scss']
  })
  export class LoadingComponent implements OnInit {
    progress = 0;
    currentStep = '';
    currentMessage = '';
    seed = 'asdf';
  
    constructor(
      private router: Router,
      private seedService: SeedService,
      private worldDataService: WorldDataService,
      private worldMapService: WorldMapService,
      private chunkFileSystemService: FileSystemService,
      private worldSessionService: WorldSessionService,
      private mapControlService: MapControlService,
      private citySeederService: CitySeederService,
      private cityEstateSeederService: CityEstateSeederService,
      private npcSeederService: NpcSeederService
    ) {}
  
    ngOnInit(): void {
      if (!this.chunkFileSystemService.hasDirectory()) {
        this.chunkFileSystemService.requestDirectoryAccess();
        this.router.navigateByUrl('/new-game');
        return;
      }
      this.worldMapService.setSeed(this.seed);
      this.startLoading();
    }
  
    async startLoading(): Promise<void> {
      const loadingSteps = [
        { label: 'Initializing World...', action: () => this.initializeWorld() },
        { label: 'Seeding Settlements...', action: () => this.seedSettlements() },
        { label: 'Seeding Estates...', action: () => this.seedEstates() },
        { label: 'Seeding NPCs...', action: () => this.seedNpcs() },
        { label: 'Storing Initial State...', action: () => this.storeInitialState() },
        { label: 'Generating Player...', action: () => this.setupPlayer() },
        { label: 'Setting Up Market...', action: () => this.setupMarket() },
        { label: 'Finalizing Setup...', action: () => Promise.resolve() },
      ];
  
      for (let i = 0; i < loadingSteps.length; i++) {
        this.currentStep = loadingSteps[i].label;
        this.updateMessage(`Started: ${this.currentStep}`);
        await loadingSteps[i].action();
        this.progress = ((i + 1) / loadingSteps.length) * 100;
        this.updateMessage(`Completed: ${this.currentStep}`);
        await this.sleep(500);
      }
  
      this.router.navigate(['/gameplay']);
    }
  
    updateMessage(message: string) {
      this.currentMessage = message;
      console.log(message); // Optional for debugging
    }
  
    async storeInitialState() {
      this.updateMessage('Saving world state...');
      // Your logic here
    }
  
    async seedNpcs() {
      this.updateMessage('Generating NPC characters...');
      // Your logic here
    }
  
    async seedEstates() {
      this.updateMessage('Creating city estates...');
      // Your logic here
    }
  
    async seedSettlements() {
      this.updateMessage('Seeding settlements across the world...');
      // Your logic here
    }
  
    private async initializeWorld(): Promise<void> {
      const minX = -5000000;
      const maxX = 5000000;
      const minY = -5000000;
      const maxY = 5000000;
  
      for (let tries = 0; tries < 100; tries++) {
        const chunkX = this.randomInt(minX, maxX);
        const chunkY = this.randomInt(minY, maxY);
  
        this.updateMessage(`Generating chunk at (${chunkX}, ${chunkY})`);
  
        const chunk = await this.chunkFileSystemService.loadOrSaveChunkBinary(
          () => this.worldMapService.generateChunk(chunkX * 512, chunkY * 512, 512, 512),
          chunkX,
          chunkY
        );
  
        const { mildPercent, oceanPercent } = this.analyzeChunkBiomes(chunk);
  
        if (mildPercent >= 12 && oceanPercent >= 20) {
          this.updateMessage(`Selected starting chunk at (${chunkX}, ${chunkY})`);
          this.worldSessionService.setStartingChunk(chunkX, chunkY);
          this.mapControlService.setOffsetChunk(chunkX, chunkY, 2000, 1000);
          const settlements = await this.citySeederService.seedConnectedWorld(
            chunk,
            this.seedService.getSeededRandom(),
            chunkX,
            chunkY,
            25
          );
  
          for (const settlement of settlements) {
            settlement.estates = this.cityEstateSeederService.seedEstatesAroundSettlement(
              settlement,
              chunk,
              this.seedService.getSeededRandom()
            );
            settlement.npcs = this.npcSeederService.generateSettlementPopulation(
              settlement,
              this.seedService.getSeededRandom()
            );
          }
  
          await this.worldDataService.saveGameState(chunkX, chunkY, {
            id: `${chunkX}_${chunkY}`,
            chunk: `${chunkX}_${chunkY}`,
            settlements,
            units: [],
            players: []
          });
  
          this.worldSessionService.setSettlements(settlements);
          return;
        }
      }
  
      throw new Error('Failed to find a suitable starting chunk.');
    }
  
    private randomInt(min: number, max: number): number {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  
    private analyzeChunkBiomes(chunk: CellData[][]): { mildPercent: number; oceanPercent: number } {
      let total = 0, mild = 0, ocean = 0;
  
      for (const row of chunk) {
        for (const tile of row) {
          total++;
          if (['grassland', 'woodlands', 'forest'].includes(tile.biome)) mild++;
          if (tile.biome === 'ocean') ocean++;
        }
      }
  
      return {
        mildPercent: (mild / total) * 100,
        oceanPercent: (ocean / total) * 100,
      };
    }
  
    async setupPlayer() {
      this.updateMessage('Setting up player environment...');
      // Your logic here
    }
  
    async setupMarket() {
      this.updateMessage('Initializing market system...');
      // Your logic here
    }
  
    private sleep(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
  