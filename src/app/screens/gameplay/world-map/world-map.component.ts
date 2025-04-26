import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Input } from '@angular/core';
import { MapControlService } from '../../../services/map-control.service';
import { TileData, WorldMapService } from '../../../services/worldGeneration/world-map.service';
import { RiverService } from '../../../services/worldGeneration/river.service';

@Component({
  selector: 'app-world-map',
  template: `<canvas #mapCanvas></canvas>`,
  styles: [`
    canvas {
      width: 100vw;
      height: calc(100vh - 200px);
      display: block;
    }
  `]
})
export class WorldMapComponent implements OnInit, AfterViewInit {
  @ViewChild('mapCanvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  @Input() seed: string = 'erwaseenseenkoningkriajkjhkjk123456asdfsdf90897rwtre3era77fdssqw43212341341234asdasfdsaffdsfaff7aas77';
  private zoom: number = 1;
  private offset: { x: number; y: number } = { x: 0, y: 0 };

  constructor(
    private mapControlService: MapControlService,
    private worldMapService: WorldMapService,
    private riverService: RiverService
  ) {}

  ngOnInit(): void {
    this.worldMapService.setSeed(this.seed);

    this.mapControlService.zoom$.subscribe((zoom: number) => {
      this.zoom = zoom;
      this.drawMap();
    });

    this.mapControlService.offset$.subscribe((offset: { x: number; y: number; }) => {
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

private drawMap(): void {
  const canvas = this.canvas.nativeElement;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const tileSize = 8 * this.zoom;
  const cols = Math.ceil(canvas.width / tileSize);
  const rows = Math.ceil(canvas.height / tileSize);

  const startX = Math.floor(this.offset.x / tileSize);
  const startY = Math.floor(this.offset.y / tileSize);

  const chunk = this.worldMapService.generateChunk(startX, startY, cols, rows);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  this.riverService.generateRivers(chunk, startX, startY, cols, rows);

  // === Base terrain layer ===
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const tile = chunk[y][x];
      ctx.fillStyle = this.getTileColor(tile);
      ctx.fillRect(
        x * tileSize - (this.offset.x % tileSize),
        y * tileSize - (this.offset.y % tileSize),
        tileSize,
        tileSize
      );
    }
  }

  // === Feature layer (overlays) ===
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      const tile = chunk[y][x];
      const neighbors = [
        chunk[y - 1][x],
        chunk[y + 1][x],
        chunk[y][x - 1],
        chunk[y][x + 1]
      ];

      const screenX = x * tileSize - (this.offset.x % tileSize);
      const screenY = y * tileSize - (this.offset.y % tileSize);

      // 🏔️ Mountain peak highlight
      if (tile.elevation > 0.4 && neighbors.every(n => n.elevation < tile.elevation)) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(screenX, screenY, tileSize, tileSize);
      }

      // 🧊 Icebergs (very cold + wet + near ocean)
      if (tile.temperature < 0.05 && tile.moisture > 0.6 && tile.elevation < 0.15) {
        ctx.fillStyle = 'rgba(220, 250, 255, 0.8)';
        ctx.fillRect(screenX, screenY, tileSize, tileSize);
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
    const e = tile.elevation;

    // Choose your shading style:
    // Option A: Blend with white (lighter with elevation)
    const mixWith = [255, 255, 255];
    const t = e * 0.4; // how strong the lightening is
    const blended = [
      Math.round(r * (1 - t) + mixWith[0] * t),
      Math.round(g * (1 - t) + mixWith[1] * t),
      Math.round(b * (1 - t) + mixWith[2] * t)
    ];

    // Option B (alternative): Darken with elevation
    // const t = 1 - (e * 0.4);
    // const blended = [Math.round(r * t), Math.round(g * t), Math.round(b * t)];

    return `rgb(${blended[0]}, ${blended[1]}, ${blended[2]})`;
  }

  // fallback: grayscale elevation
  const e = Math.floor(tile.elevation * 255);
  return `rgb(${e},${e},${e})`;
}

}
