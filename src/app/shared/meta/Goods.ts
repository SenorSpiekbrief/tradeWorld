import { Injectable } from "@angular/core";
import { GoodsType } from "../enums/GoodsType";


@Injectable({ providedIn: 'root' })
export class Goods {
  private basePrice: { [key in GoodsType]: number } = {
      [GoodsType.Wood]: 0,
      [GoodsType.Brick]: 0,
      [GoodsType.Grain]: 0,
      [GoodsType.Hemp]: 0,
      [GoodsType.Wool]: 0,
      [GoodsType.RawMetal]: 0,
      [GoodsType.Honey]: 0,
      [GoodsType.Beer]: 0,
      [GoodsType.Salt]: 0,
      [GoodsType.MetalGoods]: 0,
      [GoodsType.Mead]: 0,
      [GoodsType.Cloth]: 0,
      [GoodsType.Stockfish]: 0,
      [GoodsType.Clothing]: 0,
      [GoodsType.Cheese]: 0,
      [GoodsType.Pitch]: 0,
      [GoodsType.Pelts]: 0,
      [GoodsType.Meat]: 0,
      [GoodsType.Wine]: 0,
      [GoodsType.Spices]: 0,
      [GoodsType.Cotton]: 0,
      [GoodsType.Sugar]: 0,
      [GoodsType.Tobacco]: 0,
      [GoodsType.Silver]: 0,
      [GoodsType.Gold]: 0,
      [GoodsType.Gemstones]: 0,
      [GoodsType.Jewelry]: 0,
      [GoodsType.Paper]: 0,
      [GoodsType.Coal]: 0,
      [GoodsType.Steel]: 0,
      [GoodsType.Oil]: 0
  }
}
