import { TransactionType } from "../enums/TransactionType";
import { Commodity } from "./Commodity";
import { ID } from "./ID";
import { Timestamp } from "./Timstamp";

export interface Transaction {
    id: ID;
    type: TransactionType;
    amount: number;
    commodity?: Commodity[]; // If applicable
    timestamp: Timestamp;
  }