import { Injectable } from "@angular/core";
import { SeedService } from "./seed.service";

@Injectable({ providedIn: 'root' })
export class ElevationService {

  constructor(private seedService: SeedService) {}

  getElevation(x: number, y: number): number {
    const noise = this.seedService.getNoise();

    const continentMask = Math.pow(noise(x * 0.001, y * 0.002) * 0.5 + 0.5, 2.0);
    const tectonicInfluence = Math.pow(Math.abs(noise(x * 0.015, y * 0.015)), 3);
    const mid = noise(x * 0.01, y * 0.01) * 0.5 + 0.5;
    const high = noise(x * 0.05, y * 0.05) * 0.5 + 0.5;
    const grainInfluence = (noise(x * 0.08, y * 0.08) * 0.5);

    let elevation = continentMask * 0.5
                  + tectonicInfluence * 0.3
                  + mid * 0.15
                  + high * 0.05
                  + (grainInfluence - 0.25) * 0.16;

    elevation = Math.pow(Math.min(1, Math.max(0, elevation)), 1.5);

    if (elevation > 0.85) {
      elevation += Math.pow(elevation - 0.85, 2.5) * 0.3 * (noise(x * 0.1, y * 0.1) * 0.5 + 0.5);
    }

    return Math.min(1, Math.max(0, elevation));
  }
}
