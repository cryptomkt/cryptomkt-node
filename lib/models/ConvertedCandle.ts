import { Candle } from "./Candle";

export interface ConvertedCandlesBySymbol {
  targetCurrency: string;
  data: Candle[];
}
