import { ID } from "./ID";
import { Position } from "./Position";

export interface Convoy {
    convoyId: ID;
    name: string;
    fleetIds: ID[]; 
    route: Position[];
  }