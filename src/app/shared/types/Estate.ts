import { EstateType } from "../enums/EstateType";
import { ID } from "./ID";
import { Market } from "./Market";
import { Position } from "./Position";
import { Structure } from "./Structure";

export interface Estate {
    id: ID;
    name: string;
    location: Position;
    type: EstateType;
    market: Market;
    structures: Structure[];
    upgrades: string[]; // Array of upgrade names
  }