import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapControlService {
  // The current zoom level (default 1 means “no zoom”)
  private zoomSubject = new BehaviorSubject<number>(0.4);
  zoom$ = this.zoomSubject.asObservable();

  // The current pan offset in pixels
  private offsetSubject = new BehaviorSubject<{ x: number; y: number }>({ x: 0, y: 0 });
  offset$ = this.offsetSubject.asObservable();

  // Multiply the current zoom level by a factor
  adjustZoom(factor: number): void {
    const currentZoom = this.zoomSubject.getValue();
    this.zoomSubject.next(currentZoom * factor);
  }

  // Optionally, set an absolute zoom level
  setZoom(zoom: number): void {
    this.zoomSubject.next(zoom);
  }

  // Adjust the pan offset by dx, dy
  pan(dx: number, dy: number): void {
    const current = this.offsetSubject.getValue();
    this.offsetSubject.next({ x: current.x + dx, y: current.y + dy });
  }

  // Optionally, set an absolute offset
  setOffset(x: number, y: number): void {
    this.offsetSubject.next({ x, y });
  }
}
