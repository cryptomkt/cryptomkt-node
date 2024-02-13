export interface Balance {
  currency: string;
  available: string;
  reserved: string;
  reservedMargin?: string;
}
