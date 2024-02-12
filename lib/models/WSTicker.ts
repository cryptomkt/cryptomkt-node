export interface WSTicker {
  timestamp: number;
  bestAsk: string;
  bestAskQuantity: string;
  bestBid: string;
  bestBidQuantity: string;
  closePrice: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  baseVolume: string;
  quoteVolume: string;
  priceChange: string;
  PriceChangePercent: string;
  lastTradeId: number;
}

export interface WSTickerRaw {
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
  /**
   * close price (same as last price)
   */
  c: string;
  /**
   * open price
   */
  o: string;
  /**
   * high price
   */
  h: string;
  /**
   * low price
   */
  l: string;
  /**
   * base asset volume
   */
  v: string;
  /**
   * quote asset volume
   */
  q: string;
  /**
   * price change
   */
  p: string;
  /**
   * price change percent
   */
  P: string;
  /**
   * last trade identifier
   */
  L: number;
}
