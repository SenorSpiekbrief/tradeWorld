import dayjs, { Dayjs } from 'dayjs';

export enum TimeSpeed {
  SLOW = 3000,
  MEDIUM = 1500,
  FAST = 750
}

export interface ResourceDelta {
  [resourceOrCoinId: string]: number; // sum must be zero
}

export interface BalancedAction {
  description: string;
  resourceDelta: ResourceDelta;
  apply: () => void;
  reverse: () => void;
}

export interface LedgerEntry {
  timestamp: Dayjs;
  actions: BalancedAction[];
  hash: string;
}
