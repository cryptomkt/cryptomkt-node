import { SUB_ACCOUNT_STATUS } from "../constants";

export interface SubAccount {
  sub_account_id: string;
  email: string;
  status: SUB_ACCOUNT_STATUS;
}
