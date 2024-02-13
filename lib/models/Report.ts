export interface Report {
  id: number;
  clientOrderId: string;
  symbol: string;
  side: string;
  status: string;
  type: string;
  timeInForce: string;
  quantity: number;
  price: number;
  cumQuantity: number;
  postOnly: boolean;
  createdAt: string;
  updatedAt: string;
  stopPrice: number;
  originalClientOrderId: string;
  tradeId: number;
  tradeQuantity: number;
  tradePrice: number;
  tradeFee: number;
  tradeTaker: boolean;
  reportType: string;
}
