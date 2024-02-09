import { SUB_ACCOUNT_STATUS } from "../constants";

export interface SubAccount {
  subAccountId: string;
  email: string;
  status: SUB_ACCOUNT_STATUS;
}
