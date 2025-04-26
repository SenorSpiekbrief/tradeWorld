import { Convoy } from "./Convoy";
import { Estate } from "./Estate";
import { Fleet } from "./Fleet";
import { ID } from "./ID";
import { Inventory } from "./Inventory";
import { Ledger } from "./Ledger";
import { Ship } from "./Ship";

export interface Company {
    companyId: ID;
    name: string;
    ships: Ship[];
    fleets: Fleet[];
    convoys: Convoy[];
    estates: Estate[];
    inventory: Inventory;
    ledger: Ledger;
  }