export interface WSTicker {
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
