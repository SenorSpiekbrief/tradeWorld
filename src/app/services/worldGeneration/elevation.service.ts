import { Injectable } from "@angular/core";
import { SeedService } from "./seed.service";

@Injectable({ providedIn: 'root' })
export class ElevationService {

  constructor(private seedService: SeedService) {}

  getElevation(x: number, y: number): number {
  const noise = this.seedService.getNoise();

  // === 1. Large-scale continent shaping ===
  const continentShape = noise(x * 0.001, y * 0.002);
  const continentMask = Math.pow(continentShape * 0.5 + 0.5, 2.0);

  // === 2. Tectonic features ===
  const tectonic = Math.abs(noise(x * 0.015, y * 0.015));
  const tectonicInfluence = Math.pow(tectonic, 3);

  // === 3. Mid and high-frequency details ===
  const mid = noise(x * 0.01, y * 0.01) * 0.5 + 0.5;
  const high = noise(x * 0.05, y * 0.05) * 0.5 + 0.5;

  // === 4. Subtle terrain grain for coastline jaggedness ===
  const grain = noise(x * 0.08, y * 0.08) * 0.5 + 0.5; // ~12–13 cells
  const grainInfluence = (grain - 0.5) * 0.08; // small bumpiness around coastlines

  // === 5. Combine base elevation ===
  let elevation =
    continentMask * 0.5 +
    tectonicInfluence * 0.3 +
    mid * 0.15 +
    high * 0.05 +
    grainInfluence;

  // === 6. Shoreline shaping ===
  elevation = Math.max(0, Math.min(1, elevation)); // clamp before peak shaping
  elevation = Math.pow(elevation, 1.5); // steeper slope near sea level

  // === 7. Peak sharpening ===
  if (elevation > 0.85) {
    const peakNoise = noise(x * 0.1, y * 0.1) * 0.5 + 0.5;
    elevation += Math.pow((elevation - 0.85), 2.5) * 0.3 * peakNoise;
  }

  // Final clamp
  return Math.min(1, Math.max(0, elevation));
}

  
}
