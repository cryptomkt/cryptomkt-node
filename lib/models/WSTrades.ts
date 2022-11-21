import { SIDE } from "../constants";

export interface WSTrade {
  t: number;
  i: number;
  p: string;
  q: string;
  s: SIDE;
}