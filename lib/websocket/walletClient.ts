import { AuthClient } from "./authClient";
import { Balance, Transaction } from "../models";
import {
  NOTIFICATION_TYPE,
  SORT,
  SORT_BY,
  TRANSACTION_STATUS,
  TRANSACTION_SUBTYPE,
  TRANSACTION_TYPE,
} from "../constants";

/**
 * WalletClient connects via websocket to cryptomarket to get wallet information of the user. uses SHA256 as auth method and authenticates on connection.
 * @param requestTimeoutMs Timeout time for requests to the server. No timeout by default
 */
export class WalletClient extends AuthClient {
  constructor(apiKey: string, apiSecret: string, window?: number, requestTimeoutMs?: number) {
    const transactionKey = "transaction";
    const balanceKey = "balance";
    super(
      "wss://api.exchange.cryptomkt.com/api/3/ws/wallet",
      apiKey,
      apiSecret,
      window,
      requestTimeoutMs,
      {
        // transaction
        subscribe_transactions: { key: transactionKey, type: NOTIFICATION_TYPE.COMMAND },
        unsubscribe_transactions: { key: transactionKey, type: NOTIFICATION_TYPE.COMMAND },
        transaction_update: { key: transactionKey, type: NOTIFICATION_TYPE.UPDATE },
        // balance
        subscribe_wallet_balances: { key: balanceKey, type: NOTIFICATION_TYPE.COMMAND },
        unsubscribe_wallet_balances: { key: balanceKey, type: NOTIFICATION_TYPE.COMMAND },
        wallet_balances: { key: balanceKey, type: NOTIFICATION_TYPE.SNAPSHOT },
        wallet_balance_update: { key: balanceKey, type: NOTIFICATION_TYPE.UPDATE },
      }
    );
  }

  /**
   * Get the user's wallet balance for all currencies with balance
   *
   * Requires the "Payment information" API key Access Right
   *
   * https://api.exchange.cryptomkt.com/#wallet-balance
   *
   * @return A promise that resolves with a list of wallet balances
   */
  getWalletBalances(): Promise<Balance[]> {
    return this.makeRequest<Balance[]>({ method: "wallet_balances" });
  }

  /**
   * Get the user's wallet balance of a currency
   *
   * Requires the "Payment information" API key Access Right
   *
   * https://api.exchange.cryptomkt.com/#wallet-balance
   *
   * @param {string} currency The currency code to query the balance
   * @return A promise that resolves with the wallet balance of the currency
   */
  async getWalletBalanceOfCurrency(currency: string): Promise<Balance> {
    const response = await this.makeRequest<Balance>({ method: "wallet_balance", params: { currency } });
    return { available: response.available, reserved: response.reserved, currency: currency };
  }

  /**
   * Get the transaction history of the account
   *
   * Important:
   *
   *  - The list of supported transaction types may be expanded in future versions
   *
   *  - Some transaction subtypes are reserved for future use and do not purport to provide any functionality on the platform
   *
   *  - The list of supported transaction subtypes may be expanded in future versions
   *
   * Requires the "Payment information" API key Access Right
   *
   * https://api.exchange.cryptomkt.com/#get-transactions-history
   *
   * @param {string[]} [params.tx_ids] Optional. List of transaction identifiers to query
   * @param {TRANSACTION_TYPE[]} [params.transaction_types] Optional. List of types to query. valid types are: 'DEPOSIT', 'WITHDRAW', 'TRANSFER' and 'SWAP'
   * @param {TRANSACTION_SUBTYPE[]} [params.transaction_subtyes] Optional. List of subtypes to query. valid subtypes are: 'UNCLASSIFIED', 'BLOCKCHAIN', 'AIRDROP', 'AFFILIATE', 'STAKING', 'BUY_CRYPTO', 'OFFCHAIN', 'FIAT', 'SUB_ACCOUNT', 'WALLET_TO_SPOT', 'SPOT_TO_WALLET', 'WALLET_TO_DERIVATIVES', 'DERIVATIVES_TO_WALLET', 'CHAIN_SWITCH_FROM', 'CHAIN_SWITCH_TO' and 'INSTANT_EXCHANGE'
   * @param {TRANSACTION_STATUS[]} [params.transaction_statuses] Optional. List of statuses to query. valid subtypes are: 'CREATED', 'PENDING', 'FAILED', 'SUCCESS' and 'ROLLED_BACK'
   * @param {string} [params.from] Optional. Interval initial value when ordering by 'created_at'. As Datetime
   * @param {string} [params.till] Optional. Interval end value when ordering by 'created_at'. As Datetime
   * @param {string} [params.id_from] Optional. Interval initial value when ordering by id. Min is 0
   * @param {string} [params.id_till] Optional. Interval end value when ordering by id. Min is 0
   * @param {SORT_BY} [params.order_by] Optional. sorting parameter.'created_at' or 'id'. Default is 'created_at'
   * @param {SORT} [params.sort] Optional. Sort direction. 'ASC' or 'DESC'. Default is 'DESC'
   * @param {number} [params.limit] Optional. Transactions per query. Defaul is 100. Max is 1000
   * @param {number} [params.offset] Optional. Default is 0. Max is 100000
   * @return A promise that resolves with a list of transactions
   */
  getTransactions(params: {
    tx_ids?: number[];
    types?: TRANSACTION_TYPE[];
    subtypes?: TRANSACTION_SUBTYPE[];
    statuses?: TRANSACTION_STATUS[];
    currencies?: string[];
    from?: string;
    till?: string;
    id_from?: number;
    id_till?: number;
    order_by?: SORT_BY;
    sort?: SORT;
    limit?: number;
    offset?: number;
  }): Promise<Transaction[]> {
    const clean_params: any = { ...params }
    clean_params.currencies = params.currencies?.join(", ")
    return this.makeRequest<Transaction[]>({
      method: "get_transactions",
      params: clean_params
    });
  }

  ///////////////////
  // subscriptions //
  ///////////////////

  /**
   * A transaction notification occurs each time a transaction has been changed, such as creating a transaction, updating the pending state (e.g., the hash assigned) or completing a transaction
   *
   * https://api.exchange.cryptomkt.com/#subscribe-to-transactions
   *
   * @param {function} callback a function that recieves notifications with a list of transactions, and the type of notification (only UPDATE)
   * @return {Promise<Boolean>} A Promise of the subscription result. True if subscribed
   */
  async subscribeToTransactions(
    callback: (notification: Transaction, type: NOTIFICATION_TYPE) => any
  ): Promise<Boolean> {
    const subscriptionResult = await this.sendSubscription({
      method: "subscribe_transactions",
      callback: (notification: any, type: NOTIFICATION_TYPE) => callback(notification as Transaction, type),
    });
    return (subscriptionResult as { result: boolean }).result;
  }

  /**
   * unsubscribe to the transaction feed.
   *
   * https://api.exchange.cryptomkt.com/#subscription-to-the-transactions
   *
   * @return {Promise<Boolean>} A Promise of the unsubscription result. True if unsubscribed
   */
  unsubscribeToTransactions(): Promise<Boolean> {
    return this.sendUnsubscription({
      method: "unsubscribe_transactions",
    });
  }

  /**
   * Subscribe to a feed of the balances of the account balances
   *
   * the first notification has a snapshot of the wallet. further notifications
   * are updates of the wallet
   *
   * https://api.exchange.cryptomkt.com/#subscription-to-the-balance
   *
   * @param {function} callback A function that recieves notifications with a list of balances, and the type of notification (either SNAPSHOT or UPDATE)
   * @return {Promise<Boolean>} A Promise of the subscription result. True if subscribed
   */
  async subscribeToBalance(
    callback: (notification: Balance[], type: NOTIFICATION_TYPE) => any
  ): Promise<Boolean> {
    return (
      (await this.sendSubscription({
        method: "subscribe_wallet_balances",
        callback: (notification: any, type) => {
          if (type === NOTIFICATION_TYPE.SNAPSHOT) {
            callback(notification as Balance[], type);
          } else {
            callback([notification as Balance], type);
          }
        },
      })) as {
        result: boolean;
      }
    ).result;
  }

  /**
   * unsubscribe to the balance feed.
   *
   * https://api.exchange.cryptomkt.com/#subscription-to-the-balance
   *
   * @return {Promise<Boolean>} A Promise of the unsubscription result. True if unsubscribed
   */
  unsubscribeToBalance(): Promise<Boolean> {
    return this.sendUnsubscription({
      method: "unsubscribe_wallet_balances",
    });
  }
}
