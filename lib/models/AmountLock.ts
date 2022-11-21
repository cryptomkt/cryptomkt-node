export interface AmountLock {
  id: number;
  currency: string;
  amount: string;
  date_end: string;
  description: string;
  cancelled: boolean;
  cancelled_at: string;
  cancel_description: string;
  created_at: string;
}
