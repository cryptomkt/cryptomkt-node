import { AuthClient } from "./authClient";
import { Balance, Commission, Order, OrderRequest, Report } from "../models";
import {
  CONTINGENCY,
  NOTIFICATION_TYPE,
  ORDER_TYPE,
  SUBSCRIPTION_MODE,
  TIME_IN_FORCE,
} from "../constants";

const reportsKey = "reports";
const balanceKey = "balance";
/**
 * TradingClient connects via websocket to cryptomarket to enable the user to manage orders. uses SHA256 as auth method and authenticates on connection.
 */
export class TradingClient extends AuthClient {
  /**
   * Creates a new spot trading websocket client. It connects and authenticates with the client with the method  {@link connect()}.
   * @param apiKey public API key
   * @param apiSecret secret API key
   * @param window Maximum difference between the send of the request and the moment of request processing in milliseconds.
   * @param requestTimeoutMs Timeout time for requests to the server. No timeout by default
   */
  constructor(apiKey: string, apiSecret: string, window?: number, requestTimeoutMs?: number) {
    super(
      "wss://api.exchange.cryptomkt.com/api/3/ws/trading",
      apiKey,
      apiSecret,
      window,
      requestTimeoutMs,
      {
        // reports
        spot_subscribe: { key: reportsKey, type: NOTIFICATION_TYPE.COMMAND },
        spot_unsubscribe: { key: reportsKey, type: NOTIFICATION_TYPE.COMMAND },
        spot_order: { key: reportsKey, type: NOTIFICATION_TYPE.UPDATE },
        spot_orders: { key: reportsKey, type: NOTIFICATION_TYPE.SNAPSHOT },
        spot_balance_subscribe: { key: balanceKey, type: NOTIFICATION_TYPE.COMMAND },
        spot_balance_unsubscribe: { key: balanceKey, type: NOTIFICATION_TYPE.COMMAND },
        spot_balance: { key: balanceKey, type: NOTIFICATION_TYPE.SNAPSHOT },
      }
    );
  }

  /**
   * Get all active spot orders
   *
   * Orders without executions are deleted after 24 hours
   *
   * https://api.exchange.cryptomkt.com/#get-active-spot-orders
   *
   * @return A promise that resolves with all the spot orders
   *
   */
  async getActiveSpotOrders(): Promise<Report[]> {
    return this.makeRequest<Report[]>({ method: "spot_get_orders" });
  }

  /**
   * Creates a new spot order
   *
   * For fee, for price accuracy and quantity, and for order status information see the api docs at
   * https://api.exchange.cryptomkt.com/#create-new-spot-order
   *
   * https://api.exchange.cryptomkt.com/#place-new-spot-order
   *
   * @param {string} params.symbol Trading symbol
   * @param {string} params.side Either 'buy' or 'sell'
   * @param {string} params.quantity Order quantity
   * @param {string} [params.client_order_id] Optional. If given must be unique within the trading day, including all active orders. If not given, is generated by the server
   * @param {ORDER_TYPE} [params.type] Optional. 'limit', 'market', 'stopLimit', 'stopMarket', 'takeProfitLimit' or 'takeProfitMarket'. Default is 'limit'
   * @param {string} [params.price] Optional. Required for 'limit' and 'stopLimit'. limit price of the order
   * @param {string} [params.stop_price] Optional. Required for 'stopLimit' and 'stopMarket' orders. stop price of the order
   * @param {TIME_IN_FORCE} [params.time_in_force] Optional. 'GTC', 'IOC', 'FOK', 'Day', 'GTD'. Default to 'GTC'
   * @param {string} [params.expire_time] Optional. Required for orders with timeInForce = GDT
   * @param {boolean} [params.strict_validate] Optional. If False, the server rounds half down for tickerSize and quantityIncrement. Example of ETHBTC: tickSize = '0.000001', then price '0.046016' is valid, '0.0460165' is invalid
   * @param {boolean} [params.post_only] Optional. If True, your post_only order causes a match with a pre-existing order as a taker, then the order will be cancelled
   * @param {string} [params.take_rate] Optional. Liquidity taker fee, a fraction of order volume, such as 0.001 (for 0.1% fee). Can only increase the fee. Used for fee markup.
   * @param {string} [params.make_rate] Optional. Liquidity provider fee, a fraction of order volume, such as 0.001 (for 0.1% fee). Can only increase the fee. Used for fee markup.
   * @return A promise that resolves with a report of the new order
   */
  async createSpotOrder(params: {
    symbol: string;
    side: string;
    quantity: string;
    client_order_id?: string;
    type?: ORDER_TYPE;
    price?: string;
    stop_price?: string;
    time_in_Force?: TIME_IN_FORCE;
    expire_time?: string;
    strict_Validate?: boolean;
    postOnly?: boolean;
    takeRate?: string;
    makeRate?: string;
  }): Promise<Report> {
    return this.makeRequest<Report>({
      method: "spot_new_order",
      params,
    });
  }

  /**
   * creates a list of spot orders
   *
   * Types or contingency:
   *
   * - CONTINGENCY.ALL_OR_NONE (CONTINGENCY.AON)
   * - CONTINGENCY.ONE_CANCEL_OTHER (CONTINGENCY.OCO)
   * - CONTINGENCY.ONE_TRIGGER_ONE_CANCEL_OTHER (CONTINGENCY.OTOCO)
   *
   * Restriction in the number of orders:
   *
   * - An AON list must have 2 or 3 orders
   * - An OCO list must have 2 or 3 orders
   * - An OTOCO must have 3 or 4 orders
   *
   * Symbol restrictions:
   *
   * - For an AON order list, the symbol code of orders must be unique for each order in the list.
   * - For an OCO order list, there are no symbol code restrictions.
   * - For an OTOCO order list, the symbol code of orders must be the same for all orders in the list (placing orders in different order books is not supported).
   *
   * ORDER_TYPE restrictions:
   * - For an AON order list, orders must be ORDER_TYPE.LIMIT or ORDER_TYPE.Market
   * - For an OCO order list, orders must be ORDER_TYPE.LIMIT, ORDER_TYPE.STOP_LIMIT, ORDER_TYPE.STOP_MARKET, ORDER_TYPE.TAKE_PROFIT_LIMIT or ORDER_TYPE.TAKE_PROFIT_MARKET.
   * - An OCO order list cannot include more than one limit order (the same
   * applies to secondary orders in an OTOCO order list).
   * - For an OTOCO order list, the first order must be ORDER_TYPE.LIMIT, ORDER_TYPE.MARKET, ORDER_TYPE.STOP_LIMIT, ORDER_TYPE.STOP_MARKET, ORDER_TYPE.TAKE_PROFIT_LIMIT or ORDER_TYPE.TAKE_PROFIT_MARKET.
   * - For an OTOCO order list, the secondary orders have the same restrictions as an OCO order
   * - Default is ORDER_TYPE.Limit
   *
   * https://api.exchange.cryptomkt.com/#create-new-spot-order-list-2
   *
   * @param {string} params.order_list_id Order list identifier. If omitted, it will be generated by the system upon order list creation. Must be equal to client_order_id of the first order in the request.
   * @param {string} params.contingency_type Order list type.
   * @param {OrderRequest[]} params.orders Orders in the list.
   * @return A promise that resolves with a list all reports created
   */
  async createNewSpotOrderList(params: {
    order_list_id: string;
    contingency_type: CONTINGENCY;
    orders: OrderRequest[];
  }): Promise<Report[]> {
    return this.makeListRequest<Report>({
      method: "spot_new_order_list",
      params,
      responseCount: params.orders.length,
    });
  }

  /**
   * cancels a spot order
   *
   * https://api.exchange.cryptomkt.com/#cancel-spot-order-2
   *
   * @param {string} client_order_id the client order id of the order to cancel
   * @return A promise that resolves with a report of the canceled order
   */
  async cancelSpotOrder(client_order_id: string): Promise<Report> {
    return this.makeRequest<Report>({
      method: "spot_cancel_order",
      params: { client_order_id },
    });
  }

  /**
   * changes the parameters of an existing order, quantity or price
   *
   * https://api.exchange.cryptomkt.com/#cancel-replace-spot-order
   *
   * @param {string} params.client_order_id the client order id of the order to change
   * @param {string} params.new_client_order_id the new client order id for the modified order. must be unique within the trading day
   * @param {string} params.quantity new order quantity
   * @param {string} params.price new order price
   * @param {boolean} [params.strictValidate]  price and quantity will be checked for the incrementation with tick size and quantity step. See symbol's tick_size and quantity_increment
   * @return A promise that resolves with a report of the modified order
   */
  async replaceSpotOrder(params: {
    client_order_id: string;
    new_client_order_id: string;
    quantity: string;
    price: string;
    strictValidate?: Boolean;
  }): Promise<Report> {
    return this.makeRequest<Report>({
      method: "spot_replace_order",
      params,
    });
  }

  /**
   * cancel all active spot orders and returns the ones that could not be canceled
   *
   * https://api.exchange.cryptomkt.com/#cancel-spot-orders
   *
   * @return A promise that resolves with a list of report of the canceled orders
   */
  async cancelSpotOrders(): Promise<Report[]> {
    return this.makeRequest<Report[]>({ method: "spot_cancel_orders" });
  }

  /**
   * Get the user's spot trading balance for all currencies with balance
   *
   * https://api.exchange.cryptomkt.com/#get-spot-trading-balances
   *
   * @return A promise that resolves with a list of spot trading balances
   */
  async getSpotTradingBalances(): Promise<Balance[]> {
    return this.makeRequest<Balance[]>({ method: "spot_balances" });
  }

  /**
   * Get the user spot trading balance of a currency
   *
   * https://api.exchange.cryptomkt.com/#get-spot-trading-balance-2
   *
   * @param {string} params.currency The currency code to query the balance
   * @return A promise that resolves with the spot trading balance of a currency
   */
  async getSpotTradingBalanceOfCurrency(params: {
    currency: string;
  }): Promise<Balance> {
    return this.makeRequest<Balance>({ method: "spot_balance", params });
  }

  /**
   * Get the personal trading commission rates for all symbols
   *
   * https://api.exchange.cryptomkt.com/#get-spot-fees
   *
   * @return A promise that resolves with a list of commission rates
   */
  async getSpotCommissions(): Promise<Commission[]> {
    return this.makeRequest<Commission[]>({ method: "spot_fees" });
  }

  /**
   * Get the personal trading commission rate of a symbol
   *
   * https://api.exchange.cryptomkt.com/#get-spot-fee
   *
   * @param {string} params.symbol The symbol of the commission rate
   * @return A promise that resolves with the commission rate of a symbol
   */
  async getSpotCommissionOfSymbol(params: {
    symbol: string;
  }): Promise<Commission> {
    return this.makeRequest<Commission>({ method: "spot_fee", params });
  }

  ///////////////////
  // subscriptions //
  ///////////////////

  /**
   * subscribe to a feed of execution reports of the user's orders
   *
   * the first notification is a snapshot of the current orders, further
   * notifications are updates of the user orders
   *
   * https://api.exchange.cryptomkt.com/#subscribe-to-reports
   *
   * @param {function} callback a function that recieves a list of reports, and the type of notification (either SNAPSHOT or UPDATE)
   * @return {Promise<Boolean>} A Promise of the subscription result. True if subscribed
   */
  async subscribeToReports(
    callback: (notification: Report[], type: NOTIFICATION_TYPE) => any
  ): Promise<Boolean> {
    return (
      (await this.sendSubscription({
        method: "spot_subscribe",
        callback: (notification: any, type: NOTIFICATION_TYPE) => {
          if (type === NOTIFICATION_TYPE.SNAPSHOT) {
            callback(notification as Report[], type);
          } else {
            callback([notification as Report], type);
          }
        },
      })) as {
        result: boolean;
      }
    ).result;
  }

  /**
   * stop recieveing the report feed subscription
   *
   * https://api.exchange.cryptomkt.com/#subscribe-to-reports
   *
   * @return {Promise<Boolean>} A Promise of the unsubscription result. True if unsubscribed
   */
  async unsubscribeToReports(): Promise<Boolean> {
    return this.sendUnsubscription({ method: "spot_unsubscribe" });
  }

  /**
   * subscribe to a feed of the user's spot balances
   * 
   * only non-zero values are present
   * 
   * https://api.exchange.cryptomkt.com/#subscribe-to-spot-balances
   * 
   * @param {function} callback A function that recieves notifications with a list of balances
   * @param {string} mode Either 'updates' or 'batches'. Update messages arrive after an update. Batch messages arrive at equal intervals after a first update
   * @return {Promise<Boolean>} A Promise of the subscription result. True if subscribed
   */
  async subscribeToSpotBalance(
    callback: (notification: Balance[]) => any,
    mode: SUBSCRIPTION_MODE,
  ): Promise<Boolean> {
    return (
      (await this.sendSubscription({
        method: "spot_balance_subscribe",
        callback: (notification: any, type) => {
          callback(notification as Balance[]);
        },
        params: { mode },
      })) as {
        result: boolean;
      }
    ).result;
  }


  /**
   * stop recieveing the feed of balances
   * 
   * https://api.exchange.cryptomkt.com/#subscribe-to-spot-balances
   *
   * @return {Promise<Boolean>} A Promise of the unsubscription result. True if unsubscribed
   */
  unsubscribeToSpotBalance(): Promise<Boolean> {
    return this.sendUnsubscription({
      method: "spot_balance_unsubscribe",
      params: {
        mode: SUBSCRIPTION_MODE.UPDATES
      }
    });
  }
}
