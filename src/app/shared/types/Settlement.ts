import { SettlementType } from "../enums/SettlementType";
import { Estate } from "./Estate";
import { FamilyMember } from "./FamilyMember";
import { ID } from "./ID";
import { Inventory } from "./Inventory";
import { Market } from "./Market";
import { Position } from "./Position";
import { Structure } from "./Structure";

export interface Population {
    total: number;
    workforce: number;
    middle:number;
    upper:number;
    elite:number;
    children: number;
    elderly: number;
    infirm: number;
  }
  
 export interface Settlement {
    id: ID;
    name: string;
    type: SettlementType;
    location: Position;
    estates: Estate[]; // Array of Estate IDs
    structures?: Structure[]; // Array of Structure IDs
    population: Population;
    npcs?: FamilyMember[];
    market: Market;
    inventory: Inventory;
    x: number;
    y: number;
    specializations: string[];
    rule: Feudal | Hanse;
  }
  export interface Feudal {
    leader: ID,
    subjects:Feudal[],
  }
  export interface Hanse {
    councilMembers: ID[],
    comittees:Hanse[],
  }