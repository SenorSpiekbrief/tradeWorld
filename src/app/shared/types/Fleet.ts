import { ID } from "./ID";
import { Position } from "./Position";
import { Ship } from "./Ship";

export interface Fleet {
    fleetId: ID;
    name: string;
    location: Position;
    destination: Position;
    ships: Ship[];
  }