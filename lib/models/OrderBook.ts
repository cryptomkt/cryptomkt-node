export interface WSOrderBook {
  /**
   * timetsmap
   */
  t: number;
  /**
   * sequence number
   */
  s: number;
  /**
   * asks
   */
  a: OrderBookLevel[];
  /**
   * bids
   */
  b: OrderBookLevel[];
}

export type OrderBookLevel = [price: number, amount: number];

export interface OrderBookTop {
  t: number;
  a: string;
  A: string;
  b: string;
  B: string;
}

export interface PriceRate {
  /**
   * timestamp
   */
  t: number,
  /**
   * rate
   */
  r: string
}

export interface OrderBook {
  timestamp: string;
  ask: OrderBookLevel[];
  bid: OrderBookLevel[];
}
