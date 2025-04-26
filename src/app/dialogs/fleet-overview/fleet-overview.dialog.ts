import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

interface Ship {
  name: string;
  type: string;
  cargo: number;
  speed: number;
}

interface Fleet {
  name: string;
  ships: Ship[];
}

@Component({
  selector: 'app-fleet-overview',
  standalone:true,
  imports:[CommonModule],
  templateUrl: './fleet-overview.dialog.html',
  styleUrls: ['./fleet-overview.dialog.scss']
})
export class FleetOverviewDialog {
  fleets: Fleet[] = [
    { name: 'Trade Convoy', ships: [
      { name: 'Merchant One', type: 'Cargo', cargo: 500, speed: 20 },
      { name: 'Merchant Two', type: 'Cargo', cargo: 450, speed: 18 }
    ]},
    { name: 'Battle Squadron', ships: [
      { name: 'Destroyer', type: 'Warship', cargo: 100, speed: 40 },
      { name: 'Frigate', type: 'Warship', cargo: 120, speed: 35 }
    ]}
  ];

  selectedFleet: Fleet | null = null;
  viewingShips = false;
  selectedFleetForDetails: Fleet | null = null;

  constructor(public dialogRef: MatDialogRef<FleetOverviewDialog>) {}

  selectFleet(fleet: Fleet): void {
    if (this.selectedFleetForDetails === fleet) {
      this.selectedFleet = fleet;
      this.viewingShips = true;
    } else {
      this.selectedFleetForDetails = fleet;
    }
  }

  backToFleets(): void {
    this.viewingShips = false;
    this.selectedFleet = null;
  }

  close(): void {
    this.dialogRef.close();
  }
}
