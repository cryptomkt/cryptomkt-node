export interface Report {
  id: number;
  client_order_id: string;
  symbol: string;
  side: string;
  status: string;
  type: string;
  time_in_force: string;
  quantity: number;
  price: number;
  cum_quantity: number;
  post_only: boolean;
  created_at: string;
  updated_at: string;
  stop_price: number;
  original_client_order_id: string;
  trade_id: number;
  trade_quantity: number;
  trade_price: number;
  trade_fee: number;
  trade_taker: boolean;
  report_type: string;
}
