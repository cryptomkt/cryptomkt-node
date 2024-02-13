import { SIDE } from "../constants";

export interface WSTrade {
  timestamp: number;
  id: number;
  price: string;
  quantity: string;
  side: SIDE;
}

export interface WSTradeRaw {
  /**
   * timestamp
   */
  t: number;
  /**
   * trade identifier
   */
  i: number;
  /**
   * price
   */
  p: string;
  /**
   * quantity
   */
  q: string;
  /**
   * side
   */
  s: SIDE;
}