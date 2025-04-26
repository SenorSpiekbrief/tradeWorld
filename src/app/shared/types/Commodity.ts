import { GoodsType } from "../enums/GoodsType";

export interface Commodity {
    quantity: number;
    valuePerUnit: number;
    type:GoodsType;
  }