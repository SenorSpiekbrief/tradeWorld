import { Company } from "./Company";
import { FamilyMember } from "./FamilyMember";
import { GameEvent } from "./GameEvent";
import { ID } from "./ID";
import { Inventory } from "./Inventory";

export interface PlayerState {
    playerId: ID;
    name:string;
    lastHash: string;
    events: GameEvent[];
    family: FamilyMember[];
    inventory: Inventory;
    companies: Company[];
  }