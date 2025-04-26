import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface Asset {
  type: string;
  name: string;
  value: number;
}

export interface Player {
  name: string;
  title: string;
  rank: string;
  wealth: number;
  reputation: number;
  avatar: string;
  assets: Asset[];
}

@Component({
  selector: 'app-player-overview',
  standalone:true,
  imports:[CommonModule],
  templateUrl: './player-overview.dialog.html',
  styleUrls: ['./player-overview.dialog.scss']
})
export class PlayerOverviewDialog {
  @Input() player!: Player;

  editPlayer() {
    console.log('Editing player:', this.player.name);
  }

  logout() {
    console.log('Logging out player:', this.player.name);
  }

  close() {
    console.log('Closing player overview');
  }
}