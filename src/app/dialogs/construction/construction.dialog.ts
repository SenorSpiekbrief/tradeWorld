import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { ConstructionService, StructureGroup } from '../../services/construction-dialog.service';
import { CommonModule } from '@angular/common';
import { StructureGroupComponent } from './structure-group/structure-group.component';

@Component({
  selector: 'app-construction-dialog',
  standalone:true,
  imports:[CommonModule,StructureGroupComponent,MatSelectModule],
  templateUrl: './construction.dialog.html',
  styleUrls: ['./construction.dialog.scss']
})
export class ConstructionDialog {
  groupBy = 'techLevel';
  structureGroup!: StructureGroup;

  constructor(
    public dialogRef: MatDialogRef<ConstructionDialog>,
    private constructionService: ConstructionService
  ) {
    this.updateStructureList();
  }

  updateStructureList(): void {
    this.structureGroup = this.constructionService.getGroupedStructures(this.groupBy);
  }

  close(): void {
    this.dialogRef.close();
  }
}
