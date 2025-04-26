import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';

export interface Company {
  name: string;
  industry: string;
  value: number;
}

@Component({
  selector: 'app-company-overview-dialog',
  standalone:true,
  imports:[CommonModule, MatTableModule],
  templateUrl: './company-overview.dialog.html',
  styleUrls: ['./company-overview.dialog.scss']
})
export class CompanyOverviewDialog {
  constructor(
    public dialogRef: MatDialogRef<CompanyOverviewDialog>,
    @Inject(MAT_DIALOG_DATA) public companies: Company[]
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  createCompany(): void {
    // Logic to create a new company
    console.log("Creating a new company...");
  }

  startTradeMission(company: Company): void {
    // Logic to start a trade mission with the selected company
    console.log(`Starting trade mission with ${company.name}...`);
  }
}
