import { Network } from "./Network";

export interface Currency {
  fullName: string;
  crypto: boolean;
  payinEnabled: boolean;
  payoutEnabled: boolean;
  transferEnabled: boolean;
  precisionTransfer: string;
  sign: string;
  cryptoPaymentIdName: string;
  cryptoExplorer: string;
  accountTopOrder: number;
  qrPrefix: string;
  delisted: boolean;
  contractAddress: string;
  networks: Network[];
}

