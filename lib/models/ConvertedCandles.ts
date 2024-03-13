import { Candle } from "./Candle";

export interface ConvertedCandles {
  targetCurrency: string;
  data: { [key: string]: Candle[] };
}
