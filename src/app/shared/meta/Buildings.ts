import { Injectable } from "@angular/core";
import { GoodsType } from "../enums/GoodsType";
import { StructureType } from "../enums/StructureType";
import { StructureAction } from "../enums/StructureActions";
import { StructureEffect } from "../enums/StructureEffect";



interface Effect {
    name: string;
    consumption: Record<string, number>;
    results: Record<string, number>
}

interface Process {
    name: string;
    input:Record<string,number>;
    output:Record<string,number>;
    time: number;
}

interface Building {
    name: string;
    actions: StructureAction[];
    recipe: { 
        ingredients: Record<string, number>;
        time: number;
    },
    effects: Effect[],
    production: Process[]
}

@Injectable({ providedIn: 'root' })
export class Buildings {
  private meta: { [key in StructureType]: Building } = {
      [StructureType.Bank]: {
          name: 'Bank',
          actions: [
            StructureAction.ManageLoans,
            StructureAction.ManageBonds,
            StructureAction.ManageAccounts,
        ],
          recipe: {
              ingredients: {
                  [GoodsType.Wood]: 1000,
                  [GoodsType.Brick]: 1000,
                  [GoodsType.Steel]: 200,
                  [GoodsType.MetalGoods]: 200,
                  [GoodsType.Paper]: 500,
              },
              time: 500,
          },
          effects:[{
              name: "Increased Prosperity",
              consumption: {
                [GoodsType.Paper]:8
              },
              results: {
                [StructureEffect.ProsperityMultiplier]:1.2,
              }
          }],
          production: []
      },
      [StructureType.House]: {
        name: 'House',
        actions: [
          StructureAction.LeaseProperty,
          StructureAction.SellProperty,
      ],
        recipe: {
            ingredients: {
                [GoodsType.Wood]: 100,
                [GoodsType.Brick]: 100,
                [GoodsType.MetalGoods]: 20,
                [GoodsType.Cloth]: 50,
            },
            time: 50,
        },
        effects:[{
            name: "Modest Housing",
            consumption: {
              [GoodsType.Wood]:0.1,
              [GoodsType.Brick]:0.1,
            },
            results: {
              [StructureEffect.HousingIncrease]:10,
            }
        }],
        production: []
    },
      [StructureType.Hut]: {
        name: 'Hut',
        actions: [],
        recipe: {
            ingredients: {
                [GoodsType.Wood]: 50,
            },
            time: 5,
        },
        effects:[{
            name: "Poor Housing",
            consumption: {},
            results: {
              [StructureEffect.HousingIncrease]:2,
            }
        }],
        production: []
    },
      [StructureType.Well]: undefined,
      [StructureType.Woodcutter]: undefined,
      [StructureType.Windmill]: undefined,
      [StructureType.Barn]: undefined,
      [StructureType.Market]: undefined,
      [StructureType.Warehouse]: undefined,
      [StructureType.Docks]: undefined,
      [StructureType.Harbor]: undefined,
      [StructureType.Tavern]: undefined,
      [StructureType.Church]: undefined,
      [StructureType.Cathedral]: undefined,
      [StructureType.TownHall]: undefined,
      [StructureType.Palace]: undefined,
      [StructureType.Barracks]: undefined,
      [StructureType.Tower]: undefined,
      [StructureType.Wall]: undefined,
      [StructureType.MilitaryAcademy]: undefined,
      [StructureType.Lumberyard]: undefined,
      [StructureType.Brickworks]: undefined,
      [StructureType.GrainFarm]: undefined,
      [StructureType.HempFarm]: undefined,
      [StructureType.SheepFarm]: undefined,
      [StructureType.Mine]: undefined,
      [StructureType.Beekeeping]: undefined,
      [StructureType.SaltWorks]: undefined,
      [StructureType.Blacksmith]: undefined,
      [StructureType.Brewery]: undefined,
      [StructureType.Meadery]: undefined,
      [StructureType.Tailor]: undefined,
      [StructureType.Cheesemaker]: undefined,
      [StructureType.Fishery]: undefined,
      [StructureType.Tannery]: undefined,
      [StructureType.Butchery]: undefined,
      [StructureType.Vineyard]: undefined,
      [StructureType.SpiceMarket]: undefined,
      [StructureType.CottonPlantation]: undefined,
      [StructureType.SugarPlantation]: undefined,
      [StructureType.TobaccoPlantation]: undefined,
      [StructureType.GoldMine]: undefined,
      [StructureType.SilverMine]: undefined,
      [StructureType.GemstoneMine]: undefined,
      [StructureType.JewelryWorkshop]: undefined,
      [StructureType.Papermill]: undefined,
      [StructureType.Steelworks]: undefined,
      [StructureType.OilRig]: undefined,
      [StructureType.PitchMaker]: undefined,
      [StructureType.Lighthouse]: undefined,
      [StructureType.Totem]: undefined,
      [StructureType.Hall]: undefined,
      [StructureType.Forge]: undefined
  }
}