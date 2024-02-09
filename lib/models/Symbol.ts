export interface Symbol {
  type:string;
  baseCurrency:string;
  quoteCurrency:string;
  status:string;
  quantityIncrement:string;
  tickSize:string;
  takeRate:string;
  makeRate:string;
  feeCurrency:string;
  marginTrading:boolean;
  maxInitialLeverage:string;
}