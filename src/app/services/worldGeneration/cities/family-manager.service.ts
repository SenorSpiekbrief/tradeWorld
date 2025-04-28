import { Injectable } from '@angular/core';
import { Settlement } from '../../../shared/types/Settlement';
import { FamilyMember } from '../../../shared/types/FamilyMember';
import { CityAmbitionService } from './city-ambition.service';
import { TileData } from '../world-map.service';
import { ID } from '../../../shared/types/ID';

interface Family {
  id: ID;
  name: string;
  leader: FamilyMember;
  members: FamilyMember[];
  ambitions: string[];
  controlledEstates: ID[];
}

@Injectable({ providedIn: 'root' })
export class FamilyManagerService {
  private families: Map<ID, Family> = new Map();

  constructor(private cityAmbitionService: CityAmbitionService) {}

  initializeFamiliesForSettlement(
    settlement: Settlement,
    seedRandom: () => number
  ): void {
    const familyCount = this.determineFamilyCount(settlement, seedRandom);

    for (let i = 0; i < familyCount; i++) {
      const family = this.createFamily(seedRandom, settlement.id, i);
      this.families.set(family.id, family);
    }
  }

  private createFamily(seedRandom: () => number, settlementId: ID, index: number): Family {
    const leader = this.createFamilyLeader(seedRandom);

    return {
      id: this.generateFamilyID(settlementId, index),
      name: this.generateFamilyName(seedRandom),
      leader,
      members: [],
      ambitions: this.cityAmbitionService.generateAmbitionsForSettlement({ id: settlementId, type: 'town' } as any, seedRandom),
      controlledEstates: []
    };
  }

  private createFamilyLeader(seedRandom: () => number): FamilyMember {
    return {
      memberId: this.generateSimpleID(),
      name: this.generatePersonName(seedRandom),
      role: 'head',
      traits: [],
      inventory: {
        equipment: {},
        assets: {
          wallet: {
            thalers: 100 + Math.floor(seedRandom() * 400),
            gold: Math.floor(seedRandom() * 10),
            dollars: Math.floor(seedRandom() * 100),
            guilders: Math.floor(seedRandom() * 30),
            florins: Math.floor(seedRandom() * 20)
          },
          commodities: [],
          estates: []
        }
      }
    };
  }

  private determineFamilyCount(settlement: Settlement, seedRandom: () => number): number {
    switch (settlement.type) {
      case 'hamlet': return 1;
      case 'village': return 1 + Math.floor(seedRandom() * 2);
      case 'town': return 2 + Math.floor(seedRandom() * 2);
      case 'city': return 3 + Math.floor(seedRandom() * 3);
      case 'capital': return 5 + Math.floor(seedRandom() * 4);
      default: return 2;
    }
  }

  private generateFamilyID(settlementId: ID, index: number): ID {
    return `fam_${settlementId}_${index}` as ID;
  }

  private generateSimpleID(): ID {
    return Math.random().toString(36).substring(2, 10) as ID;
  }

  private generateFamilyName(seedRandom: () => number): string {
    const roots = ['van', 'de', 'ter', 'den', 'te', 'op'];
    const nouns = ['Water', 'Berg', 'Weide', 'Veen', 'Hout', 'Zee', 'Rots', 'Woud', 'Valk', 'Leeuw'];

    return `${roots[Math.floor(seedRandom() * roots.length)]} ${nouns[Math.floor(seedRandom() * nouns.length)]}`;
  }

  private generatePersonName(seedRandom: () => number): string {
    const firstNames = ['Arend', 'Dirk', 'Willem', 'Hendrik', 'Pieter', 'Maria', 'Anna', 'Katrijn', 'Geertruida'];
    const lastNames = ['van Water', 'de Berg', 'ter Weide', 'den Veen', 'op Hout', 'van de Zee'];

    return `${firstNames[Math.floor(seedRandom() * firstNames.length)]} ${lastNames[Math.floor(seedRandom() * lastNames.length)]}`;
  }

  getFamiliesForSettlement(settlementId: ID): Family[] {
    return Array.from(this.families.values()).filter(f => f.id.startsWith(`fam_${settlementId}`));
  }
}
