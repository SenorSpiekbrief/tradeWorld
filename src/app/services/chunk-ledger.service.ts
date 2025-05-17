import dayjs, { Dayjs } from 'dayjs';
import * as CryptoJS from 'crypto-js';
import { LedgerEntry, BalancedAction, TimeSpeed } from './ledger.models';

export class ChunkLedgerService {
  ledgerEntries: LedgerEntry[] = [];
  currentTimestamp: Dayjs = dayjs();
  timer: any;
  currentSpeed: TimeSpeed = TimeSpeed.MEDIUM;
  direction: 1 | -1 = 1;

  start() {
    this.stop();
    this.timer = setInterval(() => this.tickDay(), this.currentSpeed);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }

  setSpeed(speed: TimeSpeed) {
    this.currentSpeed = speed;
    this.start();
  }

  setDirection(direction: 1 | -1) {
    this.direction = direction;
    this.start();
  }

  private tickDay() {
    if (this.direction === 1) {
      this.forwardDay();
    } else {
      this.reverseDay();
    }
  }

  private forwardDay() {
    const actions = this.planDailyActions();
    const entry: LedgerEntry = {
      timestamp: this.currentTimestamp.add(1, 'day'),
      actions,
      hash: ''
    };

    if (!this.validateActions(actions)) {
      console.error('Imbalanced actions detected!');
      return;
    }

    actions.forEach(a => a.apply());
    entry.hash = this.calculateHash(entry);
    this.ledgerEntries.push(entry);
    this.currentTimestamp = entry.timestamp;

    console.log('Forward:', entry.timestamp.format(), 'Hash:', entry.hash);
  }

  private reverseDay() {
    if (!this.ledgerEntries.length) {
      console.warn('No ledger entries to reverse.');
      return;
    }

    const entry = this.ledgerEntries.pop();

    if (this.calculateHash(entry) !== entry.hash) {
      console.error('Hash mismatch! Integrity compromised.');
      return;
    }

    entry.actions.slice().reverse().forEach(a => a.reverse());
    this.currentTimestamp = entry.timestamp.subtract(1, 'day');

    console.log('Reversed:', this.currentTimestamp.format(), 'Verified Hash:', entry.hash);
  }

  private validateActions(actions: BalancedAction[]): boolean {
    return actions.every(action =>
      Object.values(action.resourceDelta).reduce((acc, val) => acc + val, 0) === 0
    );
  }

  private calculateHash(entry: LedgerEntry): string {
    const actionString = entry.actions
      .map(a => `${a.description}:${JSON.stringify(a.resourceDelta)}`)
      .join('|');

    const entryString = `${entry.timestamp.toISOString()}|${actionString}`;
    return CryptoJS.SHA256(entryString).toString();
  }

  private planDailyActions(): BalancedAction[] {
    // Example action with balanced resourceDelta
    return [{
      description: 'NPC buys 100 grain from City for 50 coins',
      resourceDelta: {
        npcGrain: 100,
        npcCoins: -50,
        cityGrain: -100,
        cityCoins: 50
      },
      apply: () => console.log('NPC trade executed'),
      reverse: () => console.log('NPC trade reversed'),
    }];
  }
}
