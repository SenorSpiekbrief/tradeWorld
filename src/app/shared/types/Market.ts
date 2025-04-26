import { GoodsType } from "../enums/GoodsType";
import { Commodity } from "./Commodity";
import { Estate } from "./Estate";
import { ID } from "./ID";
import { Ship } from "./Ship";
import { Structure } from "./Structure";

interface MarketOrder {
    commodity: Commodity;
    price: number;
}
 
interface AuctionItem {
    itemId: ID;
    item: Ship | Structure | Estate ;
}

export interface Market {
    sellOrders: MarketOrder[];
    buyOrders: MarketOrder[];
    auction: AuctionItem[];
  }