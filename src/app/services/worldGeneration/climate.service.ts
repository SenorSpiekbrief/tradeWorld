import { Injectable } from "@angular/core";
import { SeedService } from "./seed.service";

@Injectable({ providedIn: 'root' })
export class ClimateService {
  constructor(private seedService: SeedService) {}

  getMoisture(x: number, y: number): number {
    const noise = this.seedService.getNoise();

    const base = noise(x * 0.01, y * 0.01) * 0.5 + 0.5;

    // Add subtle grain (~8-12 cell frequency)
    const grain = (noise(x * 0.08, y * 0.08) - 0.5) * 0.1;

    const windEffect = this.getWindInfluence(x, y);

    return Math.min(1, Math.max(0, (base + grain) * windEffect));
  }

  getTemperature(x: number, y: number): number {
    const noise = this.seedService.getNoise();

    const windEffect = this.getWindInfluence(x, y);
    const moisture = this.getMoisture(x, y);

    const base =
      (0.5 * noise(x * 0.0005, y * 0.0005) +
      0.25 * noise(x * 0.001, y * 0.001) +
      0.5 * noise(x * 0.002, y * 0.002));

    // Subtle grain (~8–12 cells) for temperature variation
    const grain = (noise(x * 0.07, y * 0.07) - 0.5) * 0.05;

    const latBanding =
      1 - Math.abs(Math.sin(y * 0.002 * Math.PI)) *
      ((windEffect * 1.6) - ((moisture / 2) - 0.2)) + 0.5;

    const temp = base * 0.6 + latBanding * 0.4 + grain;

    return Math.min(1, Math.max(0, temp));
  }

  getWindInfluence(x: number, y: number): number {
    const angle = Math.sin((y / 1000) * Math.PI * 2);
    return 0.7 + 0.3 * angle; // Simulated banding wind
  }
}
