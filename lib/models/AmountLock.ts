export interface AmountLock {
  id: number;
  currency: string;
  amount: string;
  dateEnd: string;
  description: string;
  cancelled: boolean;
  cancelledAt: string;
  cancelDescription: string;
  createdAt: string;
}
