export interface Transaction {
  operation_id?: string; // present in websocket transaction subscription notifications
  id: number;
  status: string;
  type: string;
  subtype: string;
  created_at: string;
  updated_at: string;
  native: NativeTransaction;
  commit_risk: CommitRisk;
}

export interface NativeTransaction {
  tx_id: string;
  wallet_id: string;
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
  error_code: string;
  senders: string[];
  operation_type: string;
}

export interface CommitRisk {
  score: number;
  rbf: Boolean;
  low_fee: Boolean;
}
