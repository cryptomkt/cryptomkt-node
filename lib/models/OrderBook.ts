export interface WSOrderBook {
  timestamp: number;
  sequence: number;
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
}

export interface WSOrderBookRaw {
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
  timestamp: number;
  bestAsk: string;
  bestAskQuantity: string;
  bestBid: string;
  bestBidQuantity: string;
}

export interface OrderBookTopRaw {
  /**
   * timestamp
   */
  t: number;
  /**
   * best ask
   */
  a: string;
  /**
   * best ask quantity
   */
  A: string;
  /**
   * best bid
   */
  b: string;
  /**
   * best bid quantity
   */
  B: string;
}

export interface PriceRate {
  timestamp: number,
  rate: string
}
export interface PriceRateRaw {
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
