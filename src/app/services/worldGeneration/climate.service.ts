import { Injectable } from "@angular/core";
import { SeedService } from "./seed.service";


@Injectable({ providedIn: 'root' })
export class ClimateService {
  constructor(private seedService: SeedService) {}

  getMoisture(x: number, y: number): number {
    const noise = this.seedService.getNoise();

    const base = noise(x * 0.01, y * 0.01) * 0.5 + 0.5;

    const grain = (noise(x * 0.08, y * 0.08) - 0.5) * 0.1;

    const elevationFactor = (noise(x * 0.005, y * 0.005) * 0.4 + 0.6);

    const windEffect = this.getWindInfluence(x, y);

    let moisture = (base + grain) * elevationFactor * windEffect;

    // Adjust moisture distribution to favor moderate biomes
    moisture = Math.pow(moisture, 0.8);

    return Math.min(1, Math.max(0, moisture));
  }

  getTemperature(x: number, y: number): number {
    const noise = this.seedService.getNoise();

    const windEffect = this.getWindInfluence(x, y);
    const moisture = this.getMoisture(x, y);

    const base =
      (0.4 * noise(x * 0.0005, y * 0.0005) +
      0.3 * noise(x * 0.001, y * 0.001) +
      0.3 * noise(x * 0.002, y * 0.002));

    const grain = (noise(x * 0.07, y * 0.07) - 0.5) * 0.1;

    const latitudeFactor = Math.cos(y * 0.002 * Math.PI);

    const elevationCooling = 1 - (noise(x * 0.005, y * 0.005) * 0.3);

    let temperature = (base + grain) * 0.5 +
                      (latitudeFactor * 0.4 + windEffect * 0.1) * elevationCooling -
                      (moisture * 0.05);

    // Slightly compress extremes to boost moderate temperature biomes
    temperature = 0.2 + temperature * 0.6;

    return Math.min(1, Math.max(0, temperature));
  }

  getWindInfluence(x: number, y: number): number {
    const noise = this.seedService.getNoise();

    const globalWind = Math.sin((y / 1000) * Math.PI * 2);
    const localVariation = (noise(x * 0.003, y * 0.003) - 0.5) * 0.2;

    return 0.7 + 0.25 * globalWind + localVariation;
  }
}
