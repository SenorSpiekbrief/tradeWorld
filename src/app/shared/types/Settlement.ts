import { Estate } from "./Estate";
import { ID } from "./ID";
import { Inventory } from "./Inventory";
import { Market } from "./Market";
import { Position } from "./Position";
import { Structure } from "./Structure";

interface Population {
    total: number;
    workforce: number;
    children: number;
    elderly: number;
    infirm: number;
  }
  
 export interface Settlement {
    id: ID;
    name: string;
    location: Position;
    estates: Estate[]; // Array of Estate IDs
    structures: Structure[]; // Array of Structure IDs
    population: Population;
    market: Market;
    inventory: Inventory;
  }