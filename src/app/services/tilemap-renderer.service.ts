import { Injectable, ElementRef } from '@angular/core';
import { Application } from '@pixi/app';
import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import { Texture } from '@pixi/core';
import { Assets } from '@pixi/assets';
import { CellData, Tile } from './worldGeneration/world-map.service';

@Injectable({ providedIn: 'root' })
export class TilemapRendererService {
  private app!: Application;
  private layerContainers: Container[] = [];
  private textures: Record<string, Texture> = {};

  async initialize(viewport: ElementRef, layerCount: number = 4): Promise<void> {
    //@ts-expect-error
    this.app = await Application.create({
      width: viewport.nativeElement.clientWidth,
      height: viewport.nativeElement.clientHeight,
      backgroundColor: 0x000000,
      view: viewport.nativeElement.querySelector('canvas') ?? undefined,
    });

    for (let i = 0; i < layerCount; i++) {
      const container = new Container();
      container.zIndex = i;
      this.layerContainers.push(container);
      this.app.stage.addChild(container);
    }
    this.app.stage.sortableChildren = true;

    // ✅ load spritesheet using Assets instead of loader
    const sheet = await Assets.load('assets/tilesheet.json');
    this.textures = sheet.textures;
  }

  getApp(): Application {
    return this.app;
  }


  renderViewport(
    chunkProvider: (x: number, y: number) => CellData | null,
    centerWorldX: number,
    centerWorldY: number,
    viewportWidth: number,
    viewportHeight: number,
    tileSize: number,
    tilesPerCellX: number,
    tilesPerCellY: number
  ) {
    const cellPixelWidth = tileSize * tilesPerCellX;
    const cellPixelHeight = tileSize * tilesPerCellY;

    const firstCellX = Math.floor((centerWorldX - viewportWidth / 2) / cellPixelWidth);
    const firstCellY = Math.floor((centerWorldY - viewportHeight / 2) / cellPixelHeight);
    const visibleCellsX = Math.ceil(viewportWidth / cellPixelWidth) + 2;
    const visibleCellsY = Math.ceil(viewportHeight / cellPixelHeight) + 2;

    this.layerContainers.forEach(layer => layer.removeChildren());

    for (let cy = firstCellY; cy < firstCellY + visibleCellsY; cy++) {
      for (let cx = firstCellX; cx < firstCellX + visibleCellsX; cx++) {
        const cell = chunkProvider(cx, cy);
        if (!cell) continue;

        for (let layerIdx = 0; layerIdx < cell.tiles!.length; layerIdx++) {
            const tileGrid: Tile[][] = cell.tiles![layerIdx];
            for (let ty = 0; ty < tileGrid.length; ty++) {
              for (let tx = 0; tx < tileGrid[ty].length; tx++) {
                const tile = tileGrid[ty][tx];
                if (!tile.sprite) continue;
                const texture = this.textures[tile.sprite];
                if (!texture) continue;
                const sprite = new Sprite(texture);
              const worldX = cx * cellPixelWidth + tx * tileSize;
              const worldY = cy * cellPixelHeight + ty * tileSize;
              const screenX = worldX - centerWorldX + viewportWidth / 2;
              const screenY = worldY - centerWorldY + viewportHeight / 2;

              sprite.x = screenX;
              sprite.y = screenY;
              sprite.width = tileSize;
              sprite.height = tileSize;

              this.layerContainers[layerIdx].addChild(sprite);
            }
          }
        }
      }
    }
  }
}
