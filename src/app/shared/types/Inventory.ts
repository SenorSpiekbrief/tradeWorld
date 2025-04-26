import { Commodity } from "./Commodity";
import { Estate } from "./Estate";

interface Wallet {
    thalers: number;
    gold: number;
    dollars: number;
    guilders: number;
    florins: number;
}

export interface Inventory {
    equipment: Record<string, EquipmentItem>;
    assets: {
      wallet: Wallet;
      commodities?: Commodity[];
      estates?: Estate[];
    };
  }