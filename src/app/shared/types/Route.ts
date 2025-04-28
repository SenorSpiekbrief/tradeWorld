import { ID } from "./ID";

export interface Route {
    fromSettlementId: ID;
    toSettlementId: ID;
    path: { x: number; y: number }[];
    distance: number;
    type: 'land' | 'sea';
  }
  