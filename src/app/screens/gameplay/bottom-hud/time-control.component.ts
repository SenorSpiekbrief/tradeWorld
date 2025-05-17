import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChunkLedgerService } from './chunk-ledger.service';
import { TimeSpeed } from './ledger.models';

@Component({
  selector: 'app-time-control',
  template: `
    <div>
      <button (click)="setDirection(-1)">Reverse</button>
      <button (click)="setDirection(1)">Forward</button>
      <button (click)="setSpeed('SLOW')">Slow</button>
      <button (click)="setSpeed('MEDIUM')">Medium</button>
      <button (click)="setSpeed('FAST')">Fast</button>
      <button (click)="pause()">Pause</button>
    </div>
    <p>Current Date: {{ date }}</p>
  `
})
export class TimeControlComponent implements OnInit, OnDestroy {
  service = new ChunkLedgerService();
  date = '';

  ngOnInit() {
    this.service.start();
    setInterval(() => this.updateDate(), 500);
  }

  updateDate() {
    this.date = this.service.currentTimestamp.format('YYYY-MM-DD');
  }

  setDirection(dir: 1 | -1) {
    this.service.setDirection(dir);
  }

  setSpeed(speed: 'SLOW' | 'MEDIUM' | 'FAST') {
    this.service.setSpeed(TimeSpeed[speed]);
  }

  pause() {
    this.service.stop();
  }

  ngOnDestroy() {
    this.service.stop();
  }
}
