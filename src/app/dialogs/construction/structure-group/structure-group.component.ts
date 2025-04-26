import { Component, Input } from '@angular/core';
import { ConstructionService, Structure, StructureGroup } from '../../../services/construction-dialog.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-structure-group',
  standalone:true,
  imports:[CommonModule],
  templateUrl: './structure-group.component.html',
  styleUrls: ['./structure-group.component.scss']
})
export class StructureGroupComponent {
  @Input() group!: StructureGroup;
  expanded: boolean = false;

  constructor(private constructionService: ConstructionService) {}

  toggleExpand(): void {
    this.expanded = !this.expanded;
  }

  selectStructure(structure: any): void {
    this.constructionService.setSelectedStructure(structure);
  }
}
