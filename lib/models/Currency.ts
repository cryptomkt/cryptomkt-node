import { Network } from "./Network";

export interface Currency {
  full_name: string;
  crypto: boolean;
  payin_enabled: boolean;
  payout_enabled: boolean;
  transfer_enabled: boolean;
  precision_transfer: string;
  networks: Network[];
}

