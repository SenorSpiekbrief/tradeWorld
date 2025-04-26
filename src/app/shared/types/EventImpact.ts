import { ID } from "./ID";

export interface EventImpact {
    moraleChange?: number; // Crew morale impact
    commodityImpact?: Record<string, number>; // Changes to inventory
    fleetImpact?: {
      fleetId: ID;
      damage: number; // Percent damage
    };
  }