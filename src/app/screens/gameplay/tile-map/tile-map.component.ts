import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { TilemapRendererService } from '../../../services/tilemap-renderer.service';
import { CellData } from '../../../services/worldGeneration/world-map.service';

@Component({
  selector: 'app-tilemap',
  template: `<div #viewport style="width: 800px; height: 600px;"></div>`,
})
export class TilemapComponent implements AfterViewInit {
  @ViewChild('viewport', { static: true }) viewportRef!: ElementRef;

  constructor(private tilemapRenderer: TilemapRendererService) {}

  async ngAfterViewInit() {
    await this.tilemapRenderer.initialize(this.viewportRef);

    const getCellAt = (x: number, y: number): CellData | null => {
      // your chunkProvider logic here!
      return null;
    };

    const tileSize = 32;
    const tilesPerCellX = 2;
    const tilesPerCellY = 2;

    const app = this.tilemapRenderer.getApp();

    app.ticker.add(() => {
      const centerWorldX = 0; // replace with player position
      const centerWorldY = 0;
      const viewportWidth = app.screen.width;
      const viewportHeight = app.screen.height;

      this.tilemapRenderer.renderViewport(
        getCellAt,
        centerWorldX,
        centerWorldY,
        viewportWidth,
        viewportHeight,
        tileSize,
        tilesPerCellX,
        tilesPerCellY
      );
    });
  }
}
