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
    seed = 'asdf'
    constructor(private router: Router, 
        private seedService: SeedService,
        private worldDataService: WorldDataService,
        private worldMapService: WorldMapService,
        private chunkFileSystemService: FileSystemService,
        private worldSessionService: WorldSessionService,
    private mapControlService: MapControlService,
private citySeederService: CitySeederService,
private npcSeederService: NpcSeederService) {}
  
    ngOnInit(): void {
      if (!this.chunkFileSystemService.hasDirectory()) {
        this.chunkFileSystemService.requestDirectoryAccess();
        //alert('Please select a folder to continue.');
        this.router.navigateByUrl('/new-game');
      }
      this.startLoading();
      this.worldMapService.setSeed(this.seed);
    }
  
    async startLoading(): Promise<void> {
      const loadingSteps = [
        { label: 'Initializing World...', action: () => this.initializeWorld() },
        { label: 'Generating Player...', action: () => this.setupPlayer() },
        { label: 'Setting Up Market...', action: () => this.setupMarket() },
        { label: 'Finalizing Setup...', action: () => Promise.resolve() }
      ];
  
      for (let i = 0; i < loadingSteps.length; i++) {
        this.currentStep = loadingSteps[i].label;
        await loadingSteps[i].action();
        this.progress = ((i + 1) / loadingSteps.length) * 100;
        await this.sleep(500);
      }
  
      this.router.navigate(['/gameplay']);
    }
  
    private async initializeWorld(): Promise<void> {
        const minX = -5000000; // Customize
        const maxX = 5000000;
        const minY = -5000000;
        const maxY = 5000000;
      
        let tries = 0;
        const maxTries = 100; // To prevent infinite loops
      
        while (tries < maxTries) {
          const chunkX = this.randomInt(minX, maxX);
          const chunkY = this.randomInt(minY, maxY);
  
          const myGenerator = () => this.worldMapService.generateChunk(chunkX, chunkY, 512, 512);

          const chunk = await this.chunkFileSystemService.loadOrSaveChunkBinary(myGenerator, chunkX, chunkY);
          await this.worldDataService.loadOrGenerateTerrain(chunkX, chunkY, () => {
            return this.worldMapService.generateChunk(chunkX * 512, chunkY * 512, 512, 512);
          });
      
          const { mildPercent, oceanPercent } = this.analyzeChunkBiomes(chunk);
      
          console.log(`Chunk (${chunkX},${chunkY}): Grassland ${mildPercent.toFixed(2)}%, Ocean ${oceanPercent.toFixed(2)}%`);
      
          if (mildPercent >= 12 && oceanPercent >= 20) {
            console.log(`Selected starting chunk at (${chunkX}, ${chunkY})`);
            this.worldSessionService.setStartingChunk(chunkX, chunkY);
            this.mapControlService.setOffsetChunk(chunkX,chunkY,2000,1000);
            (window as any).startingChunk = { x: chunkX, y: chunkY };
            const settlements = await this.citySeederService.seedConnectedWorld(
                chunk,
                this.seedService.getSeededRandom(),
                chunkX, chunkY,25
              );
      
              // Step 4: Save settlements into game state
              await this.worldDataService.saveGameState(chunkX, chunkY, {
                  id: chunkX+"_"+chunkX,
                  chunk: chunkX+"_"+chunkX,
                  settlements: settlements,
                  units: [],
                  players: []
              });
      
              // Step 5: Also store settlements in session memory if needed
              this.worldSessionService.setSettlements(settlements);

              for (const settlement of settlements) {
                const npcs = this.npcSeederService.generateSettlementPopulation(settlement, this.seedService.getSeededRandom());
                // You can either:
                // - save npcs in world state
                // - attach them to the settlement (e.g., settlement.npcs = npcs)
              }
            return;
          }
      
          tries++;
        }
      
        throw new Error('Failed to find a good starting chunk after many tries.');
      }
      private randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      private analyzeChunkBiomes(chunk: CellData[][]): { mildPercent: number; oceanPercent: number } {
        let total = 0;
        let mild = 0;
        let ocean = 0;
      
        for (const row of chunk) {
          for (const tile of row) {
            total++;
            if (tile.biome === 'grassland' || tile.biome === 'woodlands' || tile.biome === 'forest') mild++;
            if (tile.biome === 'ocean') ocean++;
          }
        }
      
        return {
          mildPercent: (mild / total) * 100,
          oceanPercent: (ocean / total) * 100
        };
      }
      
  
    private async setupPlayer(): Promise<void> {
      // Initialize starting settlements
    }
  
    private async setupMarket(): Promise<void> {
      // Create initial resource pools
    }
  
    private sleep(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
  