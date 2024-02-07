import { SIDE } from "../constants";

export interface WSTrade {
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