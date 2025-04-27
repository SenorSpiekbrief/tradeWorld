import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Input } from '@angular/core';
import { MapControlService } from '../../../services/map-control.service';
import { WorldMapService, TileData } from '../../../services/worldGeneration/world-map.service';
import { RiverService } from '../../../services/worldGeneration/river.service';
import { FileSystemService } from '../../../services/filesystem.service';
import { Router } from '@angular/router';
import { WorldSessionService } from '../../../services/world-session.service';
import { WorldDataService } from '../../../services/world-data.service';
import { Settlement } from '../../../shared/types/Settlement';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-world-map',
  standalone:true,
  imports:[CommonModule],
  template: `<button (click)="saveVisibleChunk()">Save Current Chunk</button><div ><canvas #mapCanvas></canvas></div><div *ngIf="hoveredSettlement" 
     class="settlement-popup" 
     [style.left.px]="popupX" 
     [style.top.px]="popupY">
  <strong>{{ hoveredSettlement.name }}</strong><br>
  Type: {{ hoveredSettlement.type }}<br>
  Population: {{ hoveredSettlement.population!.total }}
</div>`,
  styles: [`canvas { width: 100vw; height: calc(100vh - 200px); display: block; }.settlement-popup {
  position: absolute;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
  pointer-events: none; /* allows mouse to pass through */
  z-index: 1000;
}`]
})
export class WorldMapComponent implements OnInit, AfterViewInit {
  @ViewChild('mapCanvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  @Input() seed: string = 'What would you say if I sang out of tune? Would you stand up and walk out on me?';
  private zoom: number = 0.00001;
  private readonly chunkTileSize = 512; // 512 tiles wide and high
  private readonly tileSizeBase = 8;    // base pixel size per tile before zoom
  private offset = { x: 0, y: 0 };
  
  hoveredSettlement: Settlement | null = null;
  mouseX: number = 0;
  mouseY: number = 0;
  popupX: number = 0;
  popupY: number = 0;
  
  constructor(
    private router: Router,
    private mapControlService: MapControlService,
    private worldMapService: WorldMapService,
    private riverService: RiverService,
    private chunkFileSystemService: FileSystemService,
    private worldSessionService: WorldSessionService,
    private worldDataService: WorldDataService
  ) {}

  ngOnInit(): void {
    if (!this.chunkFileSystemService.hasDirectory()) {
        //this.chunkFileSystemService.requestDirectoryAccess();
        alert('Please select a folder to continue.');
        this.router.navigateByUrl('/new-game');
      }
    //this.worldMapService.setSeed(this.seed);

    this.mapControlService.zoom$.subscribe((zoom: number) => {
      this.zoom = zoom;
      this.drawMap();
    });

    this.mapControlService.offset$.subscribe(offset => {
      this.offset = offset;
      this.drawMap();
    });
  }

  ngAfterViewInit(): void {
    this.canvas.nativeElement.addEventListener('mousemove', (event) => {
        const rect = this.canvas.nativeElement.getBoundingClientRect();
        this.mouseX = event.clientX - rect.left;
        this.mouseY = event.clientY - rect.top;
        this.updateHoveredSettlement();
      });

    const canvasEl = this.canvas.nativeElement;
    canvasEl.width = window.innerWidth;
    canvasEl.height = window.innerHeight - 200;
    this.drawMap();
  }
  async saveVisibleChunk(): Promise<void> {
    const canvas = this.canvas.nativeElement;
    const tileSize = 8 * this.zoom;
    const cols = Math.ceil(canvas.width / tileSize);
    const rows = Math.ceil(canvas.height / tileSize);
  
    const startX = Math.floor(this.offset.x / tileSize);
    const startY = Math.floor(this.offset.y / tileSize);
  
    const chunk = this.worldMapService.generateChunk(startX, startY, cols, rows);
    //this.riverService.generateRivers(chunk, startX, startY, cols, rows);
  
    await this.chunkFileSystemService.saveChunkAsPNG(chunk, 'elevation', startX, startY);
    await this.chunkFileSystemService.saveChunkAsPNG(chunk, 'biome', startX, startY);
    await this.chunkFileSystemService.loadOrSaveChunkJSON(this.worldMapService.generateChunk, startX, startY);
  }

  private async drawMap(): Promise<void> {
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    const tileSize = this.tileSizeBase * this.zoom;
    const cols = Math.ceil(canvas.width / tileSize);
    const rows = Math.ceil(canvas.height / tileSize);
  
    const startTileX = Math.floor(this.offset.x / tileSize);
    const startTileY = Math.floor(this.offset.y / tileSize);
  
    const startChunkX = Math.floor(startTileX / 512);
    const startChunkY = Math.floor(startTileY / 512);
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // 1. Draw the terrain
    for (let cy = startChunkY; cy <= startChunkY + Math.ceil(rows / 512); cy++) {
      for (let cx = startChunkX; cx <= startChunkX + Math.ceil(cols / 512); cx++) {
        const chunk = await this.worldDataService.loadOrGenerateTerrain(cx, cy, () => {
          return this.worldMapService.generateChunk(cx * 512, cy * 512, 512, 512);
        });
  
        for (let y = 0; y < 512; y++) {
          for (let x = 0; x < 512; x++) {
            const tile = chunk[y][x];
            if (!tile) continue;
  
            const globalTileX = cx * 512 + x;
            const globalTileY = cy * 512 + y;
  
            const screenX = globalTileX * tileSize - this.offset.x;
            const screenY = globalTileY * tileSize - this.offset.y;
  
            if (screenX + tileSize < 0 || screenY + tileSize < 0 ||
                screenX > canvas.width || screenY > canvas.height) {
              continue;
            }
  
            ctx.fillStyle = this.getTileColor(tile);
            ctx.fillRect(screenX, screenY, tileSize, tileSize);
          }
        }
      }
    }
  
    // 2. Draw the settlements (overlay on top)
    const settlements = this.worldSessionService.getSettlements();
    console.log(settlements,' are settlements');
    if (settlements) {
      ctx.fillStyle = '#FF0000'; // 🔴 Bright red (or you could use '#800080' purple)
  
      for (const settlement of settlements) {
        const screenX = settlement.x * tileSize - this.offset.x;
        const screenY = settlement.y * tileSize - this.offset.y;
  
        if (screenX + tileSize < 0 || screenY + tileSize < 0 ||
            screenX > canvas.width || screenY > canvas.height) {
          continue;
        }
        console.log(settlement.name)
        // Small dot or square (smaller than tile size)
        ctx.fillRect(screenX, screenY, tileSize * 2, tileSize * 2);
      }
    }
    if (this.hoveredSettlement) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(this.mouseX + 10, this.mouseY + 10, 150, 60);
      
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.fillText(`Name: ${this.hoveredSettlement.name}`, this.mouseX + 15, this.mouseY + 25);
        ctx.fillText(`Type: ${this.hoveredSettlement.type}`, this.mouseX + 15, this.mouseY + 40);
        ctx.fillText(`Pop: ${this.hoveredSettlement.population.total}`, this.mouseX + 15, this.mouseY + 55);
      }
  }
  

  private biomeColors: Record<string, [number, number, number]> = {
    beach: [165, 250, 160],              // Light sandy tan
    desert: [217, 201, 175],             // Light sand
    woodland: [32, 160, 16],             // Dark olive green
    taiga: [168, 240, 175],              // Pale cold green
    tundra: [216, 240, 207],             // Light frosty mint
    rainforest: [0, 117, 94],            // Deep jungle green
    grassland: [58, 205, 50],            // Bright natural green
    forest: [58, 139, 50],               // Dense forest green
    mountain: [136, 136, 136],           // Standard mountain gray
    rock: [180, 180, 180],               // Pale rocky gray (summits)
    alpine: [190, 210, 220],             // Gray-blue alpine (barren highlands)
    'alpine grassland': [143, 188, 143], // Sage green meadow
    water: [30, 144, 255],               // Bright blue (shallow water)
    ocean: [0, 0, 128]                   // Deep navy blue
  };

  private getTileColor(tile: TileData): string {
    const baseColor = this.biomeColors[tile.biome];
    if (baseColor) {
      const [r, g, b] = baseColor;
      const t = tile.elevation * 0.4;
      const mixWith = [255, 255, 255];
      const blended = [
        Math.round(r * (1 - t) + mixWith[0] * t),
        Math.round(g * (1 - t) + mixWith[1] * t),
        Math.round(b * (1 - t) + mixWith[2] * t)
      ];
      return `rgb(${blended[0]}, ${blended[1]}, ${blended[2]})`;
    }
    const e = Math.floor(tile.elevation * 255);
    return `rgb(${e},${e},${e})`;
  }
  private updateHoveredSettlement(): void {
    const tileSize = this.tileSizeBase * this.zoom;
    const settlements = this.worldSessionService.getSettlements();
    if (!settlements) return;
  
    const worldMouseX = (this.mouseX + this.offset.x) / tileSize;
    const worldMouseY = (this.mouseY + this.offset.y) / tileSize;
  
    let closest: Settlement | null = null;
    let minDist = 2.0; // tiles
  
    for (const settlement of settlements) {
      const dx = settlement.x - worldMouseX;
      const dy = settlement.y - worldMouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
  
      if (dist < minDist) {
        closest = settlement;
        minDist = dist;
      }
    }
  
    this.hoveredSettlement = closest;
  
    if (closest) {
      this.popupX = this.mouseX + 15;
      this.popupY = this.mouseY + 15;
    }
  }
}
