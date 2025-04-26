import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface Ship {
  name: string;
  type: string;
  cargo: string;
  condition: number;
}

export interface Fleet {
  name: string;
  commander: string;
  ships: Ship[];
  homePort: string;
  status: string;
  logo: string;
}

@Component({
  selector: 'app-fleet-detail',
  standalone:true,
  imports:[CommonModule],
  templateUrl: './fleet-detail.dialog.html',
  styleUrls: ['./fleet-detail.dialog.scss']
})
export class FleetDetailDialog {
  @Input() fleet!: Fleet;

  editFleet() {
    console.log('Editing fleet:', this.fleet.name);
  }

  disbandFleet() {
    console.log('Disbanding fleet:', this.fleet.name);
  }

  close() {
    console.log('Closing fleet details view');
  }
}