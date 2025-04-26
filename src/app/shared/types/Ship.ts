import { ShipStatus } from "../enums/ShipStatus";
import { ShipType } from "../enums/ShipType";
import { Crew } from "./Crew";
import { ID } from "./ID";
import { Inventory } from "./Inventory";

export interface Ship {
    id: ID;
    name: string;
    durability: number;
    type: ShipType;
    capacity: number;
    status: ShipStatus;
    crew: Crew;
    inventory:Inventory;
  }