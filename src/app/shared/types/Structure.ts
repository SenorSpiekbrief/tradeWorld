import { StructureAction } from "../enums/StructureActions";
import { StructureType } from "../enums/StructureType";
import { ID } from "./ID";
import { Inventory } from "./Inventory";
import { Position } from "./Position";

export interface Structure {
    id: ID;
    name: string;
    durability: number;
    type: StructureType;
    location: { settlementId?: string; estateId?: string, position: Position }; 
    inventory: Inventory;
    actions: StructureAction[];
  }