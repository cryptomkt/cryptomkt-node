export interface WSCandle {
  t: number;
  o: string;
  c: string;
  h: string;
  l: string;
  v: string;
  q: string;
}

export type MiniTicker = WSCandle;