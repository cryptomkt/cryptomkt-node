export interface Symbol {
  type:string;
  base_currency:string;
  quote_currency:string;
  status:string;
  quantity_increment:string;
  tick_size:string;
  take_rate:string;
  make_rate:string;
  fee_currency:string;
  margin_trading:boolean;
  max_initial_leverage:string;
}