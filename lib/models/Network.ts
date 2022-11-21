export interface Network {
  network: string;
  protocol: string;
  default: boolean;
  payin_enabled: boolean;
  payout_enabled: boolean;
  precision_payout: string;
  payout_fee: string;
  payout_is_payment_id: boolean;
  payin_payment_id: boolean;
  payin_confirmations: number;
  address_regrex: string;
  payment_id_regex: string;
  low_processing_time: string;
  high_processing_time: string;
  avg_processing_time: string;
}
