import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';

export interface City {
  name: string;
  population: number;
  wealth: number;
}

@Component({
  selector: 'app-city-overview-dialog',
  standalone:true,
  imports:[CommonModule, MatTableModule],
  templateUrl: './city-overview.dialog.html',
  styleUrls: ['./city-overview.dialog.scss']
})
export class CityOverviewDialog {
  cities: City[];

  constructor(
    public dialogRef: MatDialogRef<CityOverviewDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { cities: City[] }
  ) {
    this.cities = data.cities;
  }

  manageCity(city: City) {
    console.log('Managing city:', city.name);
  }

  createCity() {
    console.log('Creating a new city');
  }

  close() {
    this.dialogRef.close();
  }
}