import { Injectable } from '@angular/core';
import { Settlement } from '../../../shared/types/Settlement';

type WeightedAmbition = {
  id: string;
  weights: {
    hamlet?: number;
    village?: number;
    town?: number;
    city?: number;
    capital?: number;
    fortress?: number;
  };
  condition?: (settlement: Settlement) => boolean;
};

@Injectable({ providedIn: 'root' })
export class CityAmbitionService {
  private ambitions: WeightedAmbition[] = [
    { id: 'increase_population', weights: { hamlet: 5, village: 8, town: 7, city: 4, capital: 3 } },
    { id: 'expand_house_of_worship', weights: { hamlet: 2, village: 3, town: 6, city: 7, capital: 8 } },
    { id: 'secure_resource_supply', weights: { hamlet: 4, village: 6, town: 7, city: 6, capital: 5 } },
    { id: 'found_new_settlement', weights: { hamlet: 1, village: 2, town: 5, city: 7, capital: 8 } },
    { id: 'build_fortifications', weights: { hamlet: 1, village: 2, town: 4, city: 5, capital: 7, fortress: 10 } },
    { id: 'expand_market', weights: { hamlet: 2, village: 5, town: 8, city: 9, capital: 9 } },
    { id: 'discover_ruins', weights: { hamlet: 3, village: 4, town: 5, city: 4, capital: 3 } },
    { id: 'build_monument', weights: { city: 5, capital: 9 } },
    { id: 'organize_festival', weights: { town: 6, city: 7, capital: 8 } },
    { id: 'improve_diplomacy', weights: { town: 4, city: 6, capital: 9 } },

    // Example of a conditional ambition
    {
      id: 'build_harbor',
      weights: { town: 4, city: 6 },
      condition: (settlement) =>
        settlement.specializations.includes('fish') ||
        settlement.specializations.includes('salt') ||
        settlement.specializations.includes('stockfish')
    }
  ];

  constructor() {}

  generateAmbitionsForSettlement(
    settlement: Settlement,
    seedRandom: () => number
  ): string[] {
    const ambitionCount = this.determineAmbitionCount(settlement, seedRandom);

    const weightedPool: { id: string; weight: number }[] = [];

    for (const ambition of this.ambitions) {
      const weight = ambition.weights[settlement.type as keyof WeightedAmbition['weights']] || 0;

      if (weight > 0) {
        if (!ambition.condition || ambition.condition(settlement)) {
          weightedPool.push({ id: ambition.id, weight });
        }
      }
    }

    const picks: Set<string> = new Set();

    while (picks.size < ambitionCount && weightedPool.length > 0) {
      const totalWeight = weightedPool.reduce((sum, a) => sum + a.weight, 0);
      let roll = seedRandom() * totalWeight;

      for (const option of weightedPool) {
        if (roll < option.weight) {
          picks.add(option.id);
          break;
        }
        roll -= option.weight;
      }
    }

    return Array.from(picks);
  }

  private determineAmbitionCount(
    settlement: Settlement,
    seedRandom: () => number
  ): number {
    switch (settlement.type) {
      case 'hamlet': return 1;
      case 'village': return 2;
      case 'town': return 3;
      case 'city': return 4 + Math.floor(seedRandom() * 2); // 4-5 ambitions
      case 'capital': return 5 + Math.floor(seedRandom() * 2); // 5-6 ambitions
      case 'fortress': return 3;
      default: return 2;
    }
  }
}
