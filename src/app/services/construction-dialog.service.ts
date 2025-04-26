import { Injectable } from '@angular/core';
import { ID } from '../shared/types/ID';

export interface Structure {
  id:ID,
  name: string;
  category: string;
  techLevel: number;
  materials: string[];
  cost: number;
  children?:  (StructureGroup | Structure)[];
}

export interface StructureGroup {
  name: string;
  children?: (StructureGroup | Structure)[];
}

@Injectable({
  providedIn: 'root',
})
export class ConstructionService {
  private selectedStructure: Structure | null = null;

  private structures: Structure[] = [
    { id:'0', name: 'Bakery', category: 'Food', techLevel: 1, materials: ['Wood', 'Stone'], cost: 500 },
    { id:'0',name: 'Blacksmith', category: 'Metalworking', techLevel: 2, materials: ['Iron', 'Coal'], cost: 1000 },
    { id:'0',name: 'Lumber Mill', category: 'Wood Processing', techLevel: 1, materials: ['Wood'], cost: 700 },
    { id:'0',name: 'Market', category: 'Commerce', techLevel: 1, materials: ['Wood', 'Stone'], cost: 800 }
  ];

  getGroupedStructures(groupBy: string): StructureGroup {
    const root: StructureGroup = { name: 'All Structures', children: [] };

    const addToGroup = (group: StructureGroup, structure: Structure, key: string) => {
      let subgroup = group.children!.find(
        (child) => 'name' in child && child.name === key
      ) as StructureGroup;
      
      if (!subgroup) {
        subgroup = { name: key, children: [] };
        group.children!.push(subgroup);
      }
      subgroup.children!.push(structure);
    };

    this.structures.forEach((structure) => {
      switch (groupBy) {
        case 'production-horizontal':
        case 'production-vertical':
          addToGroup(root, structure, structure.category);
          break;
        case 'techLevel':
          addToGroup(root, structure, `Tech Level ${structure.techLevel}`);
          break;
        case 'materials':
          structure.materials.forEach((material) => addToGroup(root, structure, material));
          break;
        case 'cost':
          const costRange = structure.cost < 800 ? 'Low Cost' : 'High Cost';
          addToGroup(root, structure, costRange);
          break;
        default:
          root.children!.push(structure);
      }
    });

    return root;
  }

  setSelectedStructure(structure: Structure): void {
    this.selectedStructure = structure;
  }

  getSelectedStructure(): Structure | null {
    return this.selectedStructure;
  }
}
