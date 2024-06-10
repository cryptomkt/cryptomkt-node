export interface Transaction {
  operationId?: string; // present in websocket transaction subscription notifications
  id: number;
  status: string;
  type: string;
  subtype: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  native: NativeTransaction;
  commitRisk: CommitRisk;
}

export interface NativeTransaction {
  txId: string;
  walletId: string;
  index: number;
  currency: string;
  amount: number;
  fee: number;
  address: string;
  paymentId: string;
  hash: string;
  offchainId: string;
  confirmations: number;
  publicComment: string;
  errorCode: string;
  senders: string[];
  operationType: string;
}

export interface CommitRisk {
  score: number;
  rbf: Boolean;
  lowFee: Boolean;
}
