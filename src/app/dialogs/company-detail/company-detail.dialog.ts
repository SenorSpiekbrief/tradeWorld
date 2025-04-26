import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface ProductionItem {
  construction: string;
  production: string;
  consumption: string;
  store: string;
}

export interface Company {
  name: string;
  industry: string;
  value: number;
  founded: Date;
  ceo: string;
  logo: string;
  production: ProductionItem[];
}

@Component({
  selector: 'app-company-detail',
  standalone:true,
  imports:[CommonModule],
  templateUrl: './company-detail.dialog.html',
  styleUrls: ['./company-detail.dialog.scss']
})
export class CompanyDetailDialog {
  @Input() company!: Company;

  editCompany() {
    console.log('Editing company:', this.company.name);
  }

  deleteCompany() {
    console.log('Deleting company:', this.company.name);
  }

  close() {
    console.log('Closing details view');
  }
}