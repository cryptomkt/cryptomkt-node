export interface Transaction {
  id: number;
  status: string;
  type: string;
  subtype: string;
  created_at: string;
  updated_at: string;
  native: NativeTransaction;
  primetrust: any;
  meta: MetaTransaction;
}

export interface NativeTransaction {
  tx_id: string;
  index: number;
  currency: string;
  amount: number;
  fee: number;
  address: string;
  payment_id: string;
  hash: string;
  offchain_id: string;
  confirmations: number;
  public_comment: string;
  senders: string[];
}

export interface MetaTransaction {
  fiat_to_crypto: JSON;
  id: number;
  provider_name: string;
  order_type: string;
  source_currency: string;
  target_currency: string;
  wallet_address: string;
  tx_hash: string;
  target_amount: string;
  source_amount: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  payment_method_type: string;
}
