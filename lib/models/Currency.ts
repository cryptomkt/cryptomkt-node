import { Network } from "./Network";

export interface Currency {
  full_name: string;
  crypto: boolean;
  payin_enabled: boolean;
  payout_enabled: boolean;
  transfer_enabled: boolean;
  precision_transfer: string;
  sign: string;
  crypto_payment_id_name: string;
  crypto_explorer: string;
  account_top_order: number;
  qr_prefix: string;
  delisted: boolean;
  contract_address: string;
  networks: Network[];
}

