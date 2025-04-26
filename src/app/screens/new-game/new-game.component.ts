import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {MatTabsModule} from '@angular/material/tabs';

@Component({
  selector: 'app-new-game',
  standalone:true,
  imports:[MatTabsModule],
  templateUrl: './new-game.component.html',
  styleUrls: ['./new-game.component.scss']
})
export class NewGameComponent {
  constructor(private router: Router) {}

  startGame(): void {
    this.router.navigate(['/loading']);
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}
