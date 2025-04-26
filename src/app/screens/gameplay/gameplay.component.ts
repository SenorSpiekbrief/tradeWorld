import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import { BottomHudComponent } from './bottom-hud/bottom-hud.component';
import { WorldMapComponent } from './world-map/world-map.component';

@Component({
  selector: 'app-gameplay',
  standalone:true,
  imports:[MatIconModule, MatMenuModule,BottomHudComponent, WorldMapComponent],
  templateUrl: './gameplay.component.html',
  styleUrls: ['./gameplay.component.scss']
})
export class GameplayComponent {
  currentTime: string = 'Year 1000, Spring';
  
  updateTime(speed: number): void {
    // Simulated time control logic
    this.currentTime = `Year 1000, Speed x${speed}`;
  }
}
