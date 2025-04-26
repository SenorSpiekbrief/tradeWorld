import { EventType } from "../enums/EventType";
import { TravelEventType } from "../enums/TravelEventType";
import { ID } from "./ID";
import { Timestamp } from "./Timstamp";

export interface GameEvent {
    eventId: ID;
    eventType: EventType;
    details: EventDetails;
  }

type EventDetails =
  | FleetMovementDetails
  | TradeDetails
  | TravelEventDetails;

export interface FleetMovementDetails {
  fleetId: ID;
  from: string;
  to: string;
  departureTime: Timestamp;
}

export interface TradeDetails {
  fleetId: ID;
  city: string;
  goods: Record<string, number>; // e.g., { "grain": 50, "cloth": -20 }
  totalValue: number;
}

export interface TravelEventDetails {
  eventName: TravelEventType;
  description: string;
  impact: EventImpact;
}

export interface EventImpact {
    moraleChange?: number; // Crew morale impact
    commodityImpact?: Record<string, number>; // Changes to inventory
    fleetImpact?: {
      fleetId: ID;
      damage: number; // Percent damage
    };
  }