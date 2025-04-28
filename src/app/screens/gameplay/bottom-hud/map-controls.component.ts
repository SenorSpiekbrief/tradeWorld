import { Component, HostListener } from "@angular/core";
import { MapControlService } from "../../../services/map-control.service";
import { WorldSessionService } from "../../../services/world-session.service";

@Component({
    selector: 'app-map-controls',
    template: `
      <div class="circle-controls">
        <button class="move up" (click)="pan('north')">↑</button>
        <button class="move left" (click)="pan('west')">←</button>
        <button class="move home" (click)="centerHome()">🏰</button>
        <button class="move right" (click)="pan('east')">→</button>
        <button class="move down" (click)="pan('south')">↓</button>
  
        <div class="zoom-controls">
          <button (click)="zoomIn()">+</button>
          <button (click)="zoomOut()">-</button>
        </div>
      </div>
    `,
    styles: [`
      .circle-controls {
        position: absolute;
        top: 10px;
        left: 10px;
        width: 100px;
        height: 100px;
        background: radial-gradient(circle at center, #c2b280 0%, #8b7d5c 100%);
        border-radius: 50%;
        display: grid;
        place-items: center;
        grid-template-areas: 
          ". up ."
          "left home right"
          ". down .";
        gap: 8px;
        padding: 5px;
        border: 4px solid #5a4b32;
        box-shadow: 0 0 15px rgba(0,0,0,0.5);
      }
  
      button.move {
        width: 25px;
        height: 25px;
        border-radius: 50%;
        background: #decba4;
        border: 2px solid #5a4b32;
        font-weight: bold;
        font-size: 12px;
      }
  
      .move.up { grid-area: up; }
      .move.down { grid-area: down; }
      .move.left { grid-area: left; }
      .move.right { grid-area: right; }
      .move.home { grid-area: home; background: #bfa77a; font-size: 10px; }
  
      .zoom-controls {
        position: absolute;
        bottom: -10px;
        right: 10px;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
  
      .zoom-controls button {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #c0b283;
        border: 2px solid #5a4b32;
        font-weight: bold;
      }
    `]
  })
export class MapControlsComponent {
  private zoomFactor = 1.2;
  private panStep = 100; // In pixels (adjust depending on zoom level)

  constructor(
    private mapControlService: MapControlService,
    private worldSessionService: WorldSessionService
  ) {}

  zoomIn() {
    this.mapControlService.adjustZoom(this.zoomFactor);
  }

  zoomOut() {
    this.mapControlService.adjustZoom(1 / this.zoomFactor);
  }

  pan(direction: string) {
    const offsets: any = { 
      north: { x: 0, y: -this.panStep }, 
      south: { x: 0, y: this.panStep },
      west: { x: -this.panStep, y: 0 }, 
      east: { x: this.panStep, y: 0 } 
    };
    this.mapControlService.pan(offsets[direction].x, offsets[direction].y);
  }

  centerHome() {
    const playerPosition = this.worldSessionService.getPlayerPosition();
    if (playerPosition) {
      this.mapControlService.centerOnCell(playerPosition.x, playerPosition.y);
    } else {
      console.warn('No player position available.');
    }
  }

  // === KEYBOARD LISTENERS ===
  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
      this.pan('north');
    }
    if (event.key === 'ArrowDown') {
      this.pan('south');
    }
    if (event.key === 'ArrowLeft') {
      this.pan('west');
    }
    if (event.key === 'ArrowRight') {
      this.pan('east');
    }
    if (event.key.toLowerCase() === 'h') {
      this.centerHome();
    }
  }
}
