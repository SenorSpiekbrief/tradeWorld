import { Injectable } from '@angular/core';
import { SettlementType } from '../../../shared/enums/SettlementType';
import { StructureType } from '../../../shared/enums/StructureType';
import { ID } from '../../../shared/types/ID';
import { Inventory } from '../../../shared/types/Inventory';
import { Position } from '../../../shared/types/Position';
import { Settlement } from '../../../shared/types/Settlement';
import { CultureService } from './culture/culture.service';

@Injectable({ providedIn: 'root' })
export class CityGeneratorService {
  constructor() {}

  createSettlementAt(x: number, y: number, type: 'coastal' | 'inland', seedRandom: () => number,culture?:CultureService): Settlement {
    const settlementType = this.pickSettlementType(type, seedRandom);
    const settlement = this.createBasicSettlement(x, y, settlementType, seedRandom);

    this.applyTemplate(settlement, settlementType, seedRandom);

    console.log(`Created ${settlement.type} at (${x}, ${y})`);

    return settlement;
  }

  private createBasicSettlement(x: number, y: number, type: SettlementType, rand: () => number): Settlement {
    return {
      id: this.generateID(x, y),
      name: this.generateSettlementName(rand),
      type,
      location: { x, y } as Position,
      x,
      y,
      population: this.generatePopulation(rand, type),
      specializations: this.pickSpecializations(rand, type),
      estates: [],
      structures: [],
      inventory: this.generateStartingInventory(rand),
      market: {
          sellOrders: [],
          buyOrders: [],
          auction: []
      },
      rule: { leader: this.generateSimpleID(), subjects: [] },
    };
  }

  private pickSettlementType(kind: 'coastal' | 'inland', rand: () => number): SettlementType {
    if (kind === 'coastal') {
      const roll = rand();
      if (roll < 0.2) return SettlementType.City;
      if (roll < 0.5) return SettlementType.Town;
      return SettlementType.Village;
    } else {
      const roll = rand();
      if (roll < 0.5) return SettlementType.Village;
      return SettlementType.Hamlet;
    }
  }

  private applyTemplate(settlement: Settlement, type: SettlementType, rand: () => number): void {
    switch (type) {
      case SettlementType.City:
        this.addStructures(settlement, [StructureType.TownHall, StructureType.Harbor, StructureType.Market, StructureType.Warehouse]);
        break;
      case SettlementType.Town:
        this.addStructures(settlement, [StructureType.Market, StructureType.Docks, StructureType.Tavern]);
        break;
      case SettlementType.Village:
        this.addStructures(settlement, [StructureType.Well, StructureType.GrainFarm, StructureType.Woodcutter]);
        break;
      case SettlementType.Hamlet:
        this.addStructures(settlement, [StructureType.Hut, StructureType.Well]);
        break;
      default:
        console.warn(`Unknown template for settlement type ${type}`);
        break;
    }
  }

  private addStructures(settlement: Settlement, structures: StructureType[]): void {
    for (const structureType of structures) {
      settlement.structures!.push({
          id: this.generateSimpleID(),
          type: structureType,
          name: '',
          durability: 0,
          location: {
              settlementId: undefined,
              estateId: undefined,
              position: {
                  x: 0,
                  y: 0
              }
          },
          inventory: {
              equipment: {},
              assets: {
                  wallet: {
                      thalers: 0,
                      gold: 0,
                      dollars: 0,
                      guilders: 0,
                      florins: 0
                  },
                  commodities: undefined,
                  estates: undefined
              }
          },
          actions: []
      });
    }
  }

  private generatePopulation(rand: () => number, type: SettlementType): any {
    const base = {
      [SettlementType.Hamlet]: 40 + Math.floor(rand() * 60),
      [SettlementType.Village]: 100 + Math.floor(rand() * 200),
      [SettlementType.Town]: 400 + Math.floor(rand() * 600),
      [SettlementType.TradeHub]: 1000 + Math.floor(rand() * 4000),
      [SettlementType.AncientRuins]: 1000 + Math.floor(rand() * 4000),
      [SettlementType.Capital]: 1000 + Math.floor(rand() * 4000),
      [SettlementType.FloatingCity]: 1000 + Math.floor(rand() * 4000),
      [SettlementType.Fortress]: 1000 + Math.floor(rand() * 4000),
      [SettlementType.Lighthouse]: 1 + Math.floor(rand() * 2),
      [SettlementType.City]: 1000 + Math.floor(rand() * 4000),
      [SettlementType.PhasingCity]: 1000 + Math.floor(rand() * 4000),
      [SettlementType.Ruins]: 1000 + Math.floor(rand() * 4000),
      [SettlementType.TradingPost]: 1000 + Math.floor(rand() * 4000),
      [SettlementType.Tribe]: 1000 + Math.floor(rand() * 4000),
      [SettlementType.Metropolis]: 1000 + Math.floor(rand() * 4000),
      [SettlementType.UndergroundCity]: 1000 + Math.floor(rand() * 4000),      
    }[type] || 50;

    return {
      total: base,
      workforce: Math.ceil(base * 0.4),
      middle: Math.floor(base * 0.15),
      upper: Math.floor(base * 0.04),
      elite: Math.floor(base * 0.01),
      children: Math.floor(base * 0.25),
      elderly: Math.floor(base * 0.1),
      infirm: Math.floor(base * 0.05),
    };
  }

  private pickSpecializations(rand: () => number, type: SettlementType): string[] {
    const options = ['grain', 'timber', 'wool', 'fish', 'salt', 'iron', 'honey', 'spices'];
    const count = (type === SettlementType.City) ? 3 : (type === SettlementType.Town) ? 2 : 1;
    const picks: Set<string> = new Set();

    while (picks.size < count) {
      const pick = options[Math.floor(rand() * options.length)];
      picks.add(pick);
    }

    return Array.from(picks);
  }

  private generateStartingInventory(rand: () => number): Inventory {
    return {
      equipment: {},
      assets: {
        wallet: {
          thalers: Math.floor(rand() * 500),
          gold: Math.floor(rand() * 10),
          dollars: Math.floor(rand() * 1000),
          guilders: Math.floor(rand() * 30),
          florins: Math.floor(rand() * 20),
        },
        commodities: [],
        estates: [],
      }
    };
  }

  private generateSettlementName(rand: () => number): string {

    //TODO: nameServiceDI
    const roots = ['Port', 'Lake', 'Stone', 'Bay', 'Shore', 'Cliff', 'North', 'South', 'East', 'West'];
    const suffixes = ['ton', 'ville', 'stead', 'burg', 'mouth', 'ford', 'haven', 'holm'];
    return `${roots[Math.floor(rand() * roots.length)]}${suffixes[Math.floor(rand() * suffixes.length)]}`;
  }

  private generateSimpleID(): ID {
    return Math.random().toString(36).substring(2, 10) as ID;
  }

  private generateID(x: number, y: number): ID {
    return `settlement_${x}_${y}` as ID;
  }
}
