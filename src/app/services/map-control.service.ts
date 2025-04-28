import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapControlService {
  // The current zoom level (default 1 means “no zoom”)
  private zoomSubject = new BehaviorSubject<number>(0.4);
  private previewOffset: { x: number; y: number } | null = null;
  zoom$ = this.zoomSubject.asObservable();

  // The current pan offset in pixels
  private offsetSubject = new BehaviorSubject<{ x: number; y: number }>({ x: 0, y: 0 });
  offset$ = this.offsetSubject.asObservable();
  adjustZoom(factor: number, centerX: number = window.innerWidth / 2, centerY: number = window.innerHeight / 2): void {
    const oldZoom = this.zoomSubject.getValue();
    const newZoom = oldZoom * factor;
  
    const oldTileSize = this.tileSizeBase * oldZoom;
    const newTileSize = this.tileSizeBase * newZoom;
  
    const currentOffset = this.offsetSubject.getValue();
  
    // Calculate where in world coordinates (in tiles) the screen center currently points
    const worldX = (currentOffset.x + centerX) / oldTileSize;
    const worldY = (currentOffset.y + centerY) / oldTileSize;
  
    // New offset needed to keep the same world tile under screen center
    const newOffsetX = worldX * newTileSize - centerX;
    const newOffsetY = worldY * newTileSize - centerY;
  
    // Apply zoom first
    this.zoomSubject.next(newZoom);
  
    // Then update offset
    this.offsetSubject.next({ x: newOffsetX, y: newOffsetY });
  }
  

  // Optionally, set an absolute zoom level
  setZoom(zoom: number): void {
    this.zoomSubject.next(zoom);
  }

  // Adjust the pan offset by dx, dy
  pan(dx: number, dy: number): void {
    const current = this.offsetSubject.getValue();
    this.offsetSubject.next({ x: current.x + dx, y: current.y + dy });
  }

  // Optionally, set an absolute offset
  setOffset(x: number, y: number): void {
    this.offsetSubject.next({ x, y });
  }

  readonly tileSizeBase = 8; // base tile size in pixels

  setOffsetChunk(chunkX: number, chunkY: number, canvasWidth: number, canvasHeight: number): void {
    const zoom = this.zoomSubject.getValue();
    const tileSize = this.tileSizeBase * zoom;
  
    // Calculate pixel position of top-left of chunk
    const chunkPixelX = chunkX * 512 * tileSize;
    const chunkPixelY = chunkY * 512 * tileSize;
  
    // Center the view: offset = chunk position - half canvas
    const centerOffsetX = chunkPixelX - canvasWidth / 2 + (512 * tileSize) / 2;
    const centerOffsetY = chunkPixelY - canvasHeight / 2 + (512 * tileSize) / 2;
  
    console.log('Setting offset:', centerOffsetX, centerOffsetY, 'for chunk', chunkX, chunkY, 'at zoom', zoom);
  
    this.offsetSubject.next({ x: centerOffsetX, y: centerOffsetY });
  }

  centerOnCell(x: number, y: number): void {
    const zoom = this.zoomSubject.getValue();
    const tileSize = 8 * zoom;
  
    const centerOffsetX = (x * tileSize) - window.innerWidth / 2 + (tileSize / 2);
    const centerOffsetY = (y * tileSize) - (window.innerHeight - 200) / 2 + (tileSize / 2);
  
    this.offsetSubject.next({ x: centerOffsetX, y: centerOffsetY });
  }

previewPan(dx: number, dy: number): void {
  const current = this.offsetSubject.getValue();
  this.previewOffset = { x: current.x - dx, y: current.y - dy };
}

commitPreviewPan(): void {
  if (this.previewOffset) {
    this.offsetSubject.next(this.previewOffset);
    this.previewOffset = null;
  }
}
}
