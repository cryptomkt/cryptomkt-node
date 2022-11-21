import {
  CONTINGENCY,
  ORDER_STATUS,
  ORDER_TYPE,
  SIDE,
  TIME_IN_FORCE,
} from "../constants";

export interface Order {
  id: number;
  client_order_id: string;
  symbol: string;
  side: SIDE;
  status: ORDER_STATUS;
  type: ORDER_TYPE;
  time_in_force: TIME_IN_FORCE;
  quantity: string;
  price: string;
  quantity_cumulative: string;
  created_at: string;
  updated_at: string;
  expire_time: string;
  stop_price: string;
  post_only: boolean;
  trades: string;
  original_client_order_id: string;
  order_list_id: string;
  contingency_type: CONTINGENCY;
}

export interface OrderRequest {
  symbol: string;
  side: SIDE;
  quantity: string;
  client_order_id?: string;
  type?: ORDER_TYPE;
  time_in_force?: TIME_IN_FORCE;
  price?: string;
  stop_price?: string;
  expire_time?: string;
  strict_validate?: boolean;
  post_only?: boolean;
  take_rate?: string;
  make_rate?: string;
}
