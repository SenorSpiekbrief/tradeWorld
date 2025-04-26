import { Transaction } from "./Transaction";

export interface Ledger {
    transactions: Transaction[];
    balance: number; // Current company balance
  }
  