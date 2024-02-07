export interface WSCandle {
  /**
   * timestamp
   */
  t: number;
  /**
   * open price
   */
  o: string;
  /**
   * close price (same as last price)
   */
  c: string;
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
}

export type MiniTicker = WSCandle;