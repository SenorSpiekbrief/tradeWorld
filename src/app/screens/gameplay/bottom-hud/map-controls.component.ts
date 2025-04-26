import { Component } from '@angular/core';
import { MapControlService } from '../../../services/map-control.service';

@Component({
  selector: 'app-map-controls',
  template: `
    <div class="controls">
      <button (click)="zoomIn()">+</button>
      <button (click)="zoomOut()">-</button>
      <button (click)="pan('north')">↑</button>
      <button (click)="pan('south')">↓</button>
      <button (click)="pan('west')">←</button>
      <button (click)="pan('east')">→</button>
    </div>
  `,
  styles: [`.controls { position: absolute; top: 10px; left: 10px; }`]
})
export class MapControlsComponent {
  private zoomFactor = 114.4;
  private zoom = 1;
  private panStep = 25;

  constructor(private mapControlService: MapControlService) {}

  zoomIn() {
    this.mapControlService.setZoom(this.zoom = this.zoom * this.zoomFactor);
  }

  zoomOut() {
    this.mapControlService.setZoom(this.zoom = this.zoom / this.zoomFactor);
  }

  pan(direction: string) {
    const offsets: any = { north: { x: 0, y: -this.panStep }, south: { x: 0, y: this.panStep },
                      west: { x: -this.panStep, y: 0 }, east: { x: this.panStep, y: 0 }};
    this.mapControlService.pan(offsets[direction].x, offsets[direction].y);
  }
}
