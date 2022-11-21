export interface PriceHistory {
  currency: string;
  history: PricePoint[];
}

export interface PricePoint {
  timestamp: string;
  open: string;
  close: string;
  min: string;
  max: string;
}
