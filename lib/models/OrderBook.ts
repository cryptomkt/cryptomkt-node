export interface WSOrderBook {
  t: number;
  s: number;
  a: OrderBookLevel[];
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

export interface OrderBook {
  timestamp: string;
  ask: OrderBookLevel[];
  bid: OrderBookLevel[];
}
