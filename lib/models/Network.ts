export interface Network {
  network: string;
  protocol: string;
  default: boolean;
  payinEnabled: boolean;
  payoutEnabled: boolean;
  precisionPayout: string;
  payoutFee: string;
  payoutIsPaymentId: boolean;
  payinPaymentId: boolean;
  payinConfirmations: number;
  addressRegrex: string;
  paymentIdRegex: string;
  lowProcessingTime: string;
  highProcessingTime: string;
  avgProcessingTime: string;
  code: string;
  networkName: string;
  isEnsAvailable: boolean;
  crypto_paymentIdName: string;
  cryptoExplorer: string;
  contractAddress: string;
  isMultichain: boolean;
  assetId: Map<string, string>;
}
