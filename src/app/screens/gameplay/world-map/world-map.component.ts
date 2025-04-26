import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Input } from '@angular/core';
import { MapControlService } from '../../../services/map-control.service';
import { WorldMapService, TileData } from '../../../services/worldGeneration/world-map.service';
import { RiverService } from '../../../services/worldGeneration/river.service';
import { FileSystemService } from '../../../services/filesystem.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-world-map',
  template: `<button (click)="saveVisibleChunk()">Save Current Chunk</button><div ><canvas #mapCanvas></canvas></div>`,
  styles: [`canvas { width: 100vw; height: calc(100vh - 200px); display: block; }`]
})
export class WorldMapComponent implements OnInit, AfterViewInit {
  @ViewChild('mapCanvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  @Input() seed: string = 'What would you say if I sang out of tune? Would you stand up and walk out on me?';
  private zoom: number = 0.00001;
  private readonly chunkTileSize = 512; // 512 tiles wide and high
  private readonly tileSizeBase = 8;    // base pixel size per tile before zoom
  private offset = { x: 0, y: 0 };

  constructor(
    private router: Router,
    private mapControlService: MapControlService,
    private worldMapService: WorldMapService,
    private riverService: RiverService,
    private chunkFileSystemService: FileSystemService
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
  
    const startChunkX = Math.floor(startTileX / this.chunkTileSize);
    const startChunkY = Math.floor(startTileY / this.chunkTileSize);
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    for (let cy = startChunkY; cy <= startChunkY + Math.ceil(rows / this.chunkTileSize); cy++) {
      for (let cx = startChunkX; cx <= startChunkX + Math.ceil(cols / this.chunkTileSize); cx++) {
        
        // 1. Load or generate the chunk
        const chunk = await this.chunkFileSystemService.loadOrSaveChunkBinary(() => {
          return this.worldMapService.generateChunk(
            cx * this.chunkTileSize,
            cy * this.chunkTileSize,
            this.chunkTileSize,
            this.chunkTileSize
          );
        }, cx, cy,'maps');
  
        // 2. Draw this chunk
        for (let ty = 0; ty < this.chunkTileSize; ty++) {
          for (let tx = 0; tx < this.chunkTileSize; tx++) {
            const tile = chunk[ty]?.[tx];
            if (!tile) continue;
  
            const globalTileX = cx * this.chunkTileSize + tx;
            const globalTileY = cy * this.chunkTileSize + ty;
  
            const screenX = globalTileX * tileSize - this.offset.x;
            const screenY = globalTileY * tileSize - this.offset.y;
  
            if (screenX + tileSize < 0 || screenY + tileSize < 0 ||
                screenX > canvas.width || screenY > canvas.height) {
              continue; // Offscreen, skip
            }
  
            ctx.fillStyle = this.getTileColor(tile);
            ctx.fillRect(screenX, screenY, tileSize, tileSize);
          }
        }
      }
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
}
