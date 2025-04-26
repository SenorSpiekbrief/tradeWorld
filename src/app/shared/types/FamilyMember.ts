import { FamilyRole } from "../enums/FamilyRole";
import { Trait } from "../enums/PersonTrait";
import { ID } from "./ID";
import { Inventory } from "./Inventory";

export interface FamilyMember {
    memberId: ID;
    name: string;
    role: FamilyRole;
    traits: Trait[];
    inventory: Inventory;
  }