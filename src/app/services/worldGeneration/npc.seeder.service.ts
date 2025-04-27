import { Injectable } from '@angular/core';
import { Settlement } from '../models/Settlement';
import { FamilyMember } from '../models/FamilyMember';
import { Inventory } from '../models/Inventory';
import { Trait } from '../enums/PersonTrait';
import { FamilyRole } from '../enums/FamilyRole';
import { ID } from '../models/ID';

@Injectable({ providedIn: 'root' })
export class NpcSeederService {
  constructor() {}

  generateSettlementPopulation(settlement: Settlement, seedRandom: () => number): FamilyMember[] {
    const family: FamilyMember[] = [];

    // Step 1: Create a leader
    const leader = this.createFamilyMember('Leader', FamilyRole.Head, seedRandom);
    family.push(leader);

    // Step 2: Add spouse (optional)
    if (seedRandom() < 0.8) { // 80% chance
      family.push(this.createFamilyMember('Spouse', FamilyRole.Matriarch, seedRandom));
    }

    // Step 3: Add heirs (1-3 children)
    const heirCount = 1 + Math.floor(seedRandom() * 3);
    for (let i = 0; i < heirCount; i++) {
      family.push(this.createFamilyMember('Child', FamilyRole.Heir, seedRandom));
    }

    // Step 4: Add specialists (champion, steward, merchant, etc.)
    const specialistRoles: FamilyRole[] = [
      FamilyRole.Advisor,
      FamilyRole.Chronicler,
      FamilyRole.Seneschal,
      FamilyRole.Physician,
      FamilyRole.Champion,
      FamilyRole.Emissary,
      FamilyRole.Alchemist
    ];

    for (const role of specialistRoles) {
      if (seedRandom() < 0.4) { // ~40% chance each
        family.push(this.createFamilyMember('Specialist', role, seedRandom));
      }
    }

    console.log(`Generated ${family.length} family members for settlement ${settlement.name}.`);

    return family;
  }

  private createFamilyMember(label: string, role: FamilyRole, rand: () => number): FamilyMember {
    return {
      memberId: this.generateSimpleID(),
      name: this.generateRandomName(rand),
      role: role,
      traits: this.generateRandomTraits(rand),
      inventory: this.generateStartingInventory(rand),
    };
  }

  private generateRandomTraits(rand: () => number): Trait[] {
    const allTraits = Object.values(Trait);
    const count = 2 + Math.floor(rand() * 4); // 2-5 traits
    const traits: Set<Trait> = new Set();

    while (traits.size < count) {
      const pick = allTraits[Math.floor(rand() * allTraits.length)];
      traits.add(pick);
    }

    return Array.from(traits);
  }

  private generateStartingInventory(rand: () => number): Inventory {
    return {
      equipment: {}, // empty for now
      assets: {
        wallet: {
          thalers: Math.floor(rand() * 100),
          gold: Math.floor(rand() * 5),
          dollars: Math.floor(rand() * 200),
          guilders: Math.floor(rand() * 20),
          florins: Math.floor(rand() * 10),
        },
        commodities: [], // expandable later
        estates: [] // expandable later
      }
    };
  }

  private generateRandomName(rand: () => number): string {
    const firstNames = ['Robert', 'Amelia', 'Edward', 'Fiona', 'Gerald', 'Helena', 'Marcus', 'Sophia', 'Tobias', 'Isolde'];
    const lastNames = ['Shorelight', 'Wavecrest', 'Harborstone', 'Eastvale', 'Stormborn', 'Silvercoast', 'Tidewalker', 'Sunward'];

    const first = firstNames[Math.floor(rand() * firstNames.length)];
    const last = lastNames[Math.floor(rand() * lastNames.length)];

    return `${first} ${last}`;
  }

  private generateSimpleID(): ID {
    return Math.random().toString(36).substring(2, 10) as ID;
  }
}
