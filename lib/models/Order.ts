import {
  CONTINGENCY,
  ORDER_STATUS,
  ORDER_TYPE,
  SIDE,
  TIME_IN_FORCE,
} from "../constants";

export interface Order {
  id: number;
  clientOrderId: string;
  symbol: string;
  side: SIDE;
  status: ORDER_STATUS;
  type: ORDER_TYPE;
  timeInForce: TIME_IN_FORCE;
  quantity: string;
  price: string;
  quantityCumulative: string;
  createdAt: string;
  updatedAt: string;
  expireTime: string;
  stopPrice: string;
  postOnly: boolean;
  trades: string;
  originalClientOrderId: string;
  orderListId: string;
  contingencyType: CONTINGENCY;
  priceAverage: string;
}

export interface OrderRequest {
  symbol: string;
  side: SIDE;
  quantity: string;
  clientOrderId?: string;
  type?: ORDER_TYPE;
  timeInForce?: TIME_IN_FORCE;
  price?: string;
  stopPrice?: string;
  expireTime?: string;
  strictValidate?: boolean;
  postOnly?: boolean;
  takeRate?: string;
  makeRate?: string;
}
