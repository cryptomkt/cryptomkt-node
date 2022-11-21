import CryptoJS from "crypto-js";
import fetch from "node-fetch";
import {
  CryptomarketSDKException,
  CryptomarketAPIException,
} from "./exceptions";
import { URL, URLSearchParams } from "url";
import {
  ACCOUNT,
  CONTINGENCY,
  IDENTIFY_BY,
  ORDER_TYPE,
  PERIOD,
  SIDE,
  SORT,
  SORT_BY,
  TIME_IN_FORCE,
  TRANSACTION_STATUS,
  TRANSACTION_SUBTYPE,
  TRANSACTION_TYPE,
  TRANSFER_TYPE,
  USE_OFFCHAIN,
} from "./constants";
import {
  ACLSettings,
  Address,
  AmountLock,
  Balance,
  Candle,
  Commission,
  Currency,
  Order,
  OrderBook,
  OrderRequest,
  Price,
  PriceHistory,
  PublicTrade,
  SubAccount,
  SubAccountBalance,
  Ticker,
  Trade,
  Transaction,
} from "./models";

const apiUrl = "https://api.exchange.cryptomkt.com";
const apiVersion = "/api/3/";

const methodGet = "GET";
const methodPut = "PUT";
const methodPatch = "PATCH";
const methodPost = "POST";
const methodDelete = "DELETE";

export class Client {
  apiKey: string;
  apiSecret: string;
  window: number | null;

  constructor(apiKey: string, apiSecret: string, window: number | null = null) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.window = window;
  }

  async publicGet(endpoint: string, params: any) {
    return this.makeRequest(methodGet, endpoint, params, true);
  }

  async get(endpoint: string, params: any | null = null) {
    return this.makeRequest(methodGet, endpoint, params);
  }

  async patch(endpoint: string, params: any) {
    return this.makeRequest(methodPatch, endpoint, params);
  }

  async post(endpoint: string, params: any) {
    return this.makeRequest(methodPost, endpoint, params);
  }

  async delete(endpoint: string, params: any | null = null) {
    return this.makeRequest(methodDelete, endpoint, params);
  }

  async put(endpoint: string, params: any | null = null) {
    return this.makeRequest(methodPut, endpoint, params);
  }

  async makeRequest(
    method: string,
    endpoint: string,
    params: any,
    publc: boolean = false
  ) {
    let url = new URL(apiUrl + apiVersion + endpoint);
    for (let key in params) {
      if (params[key] == null) {
        delete params[key];
      }
    }
    let rawQuery = new URLSearchParams(params);
    rawQuery.sort();
    let query = rawQuery.toString();

    // build fetch options
    let opts: any = {
      method: method,
      headers: {
        "User-Agent": "cryptomarket/node",
        "Content-type": "application/x-www-form-urlencoded",
      },
    };
    // add auth header if not public endpoint
    if (!publc)
      opts.headers["Authorization"] = this.buildCredential(method, url, query);

    // include query params to call
    if (method === methodGet || method === methodPut) url.search = query;
    else opts.body = query;

    // make request
    let response: { json: () => any; ok: boolean; status: any };
    try {
      response = await fetch(url, opts);
    } catch (e) {
      throw new CryptomarketSDKException("Failed request to server", e);
    }
    let jsonResponse: any;
    try {
      jsonResponse = await response.json();
    } catch (e) {
      throw new CryptomarketSDKException(
        `Failed to parse response: ${response}`,
        e
      );
    }
    if (!response.ok) {
      throw new CryptomarketAPIException(
        jsonResponse["error"],
        response.status
      );
    }
    return jsonResponse;
  }

  /**
   *
   * @param {URL} url
   * @returns
   */
  buildCredential(httpMethod: string, url: URL, query: string) {
    let timestamp = Math.floor(Date.now()).toString();
    let msg = httpMethod + url.pathname;
    if (query) {
      if (httpMethod === methodGet) msg += "?";
      msg += query;
    }
    msg += timestamp;
    if (this.window) {
      msg += this.window;
    }
    let signature = CryptoJS.HmacSHA256(msg, this.apiSecret).toString();
    let signed = this.apiKey + ":" + signature + ":" + timestamp;
    if (this.window) {
      signed += ":" + this.window;
    }
    return `HS256 ${Buffer.from(signed).toString("base64")}`;
  }

  //////////////////
  // PUBLIC CALLS //
  //////////////////

  /**
   * Get a list of all currencies or specified currencies
   *
   * Requires no API key Access Rights.
   *
   * https://api.exchange.cryptomkt.com/#currencies
   *
   * @param {string[]} [currencies] Optional. A list of currencies ids
   *
   * @return A list of available currencies
   */
  getCurrencies(currencies?: string[]): Promise<{ [key: string]: Currency[] }> {
    return this.get("public/currency/", { currencies });
  }

  /**
   * Get the data of a currency
   *
   * Requires no API key Access Rights.
   *
   * https://api.exchange.cryptomkt.com/#currencies
   *
   * @param {string} currency A currency id
   * @return A currency
   */
  getCurrency(currency: string): Promise<Currency> {
    return this.get(`public/currency/${currency}`);
  }

  /**
   * Get a list of all symbols or for specified symbols
   *
   * A symbol is the combination of the base currency (first one) and quote currency (second one)
   *
   * Requires no API key Access Rights.
   *
   * https://api.exchange.cryptomkt.com/#symbols
   *
   * @param {string[]} [symbols] Optional. A list of symbol ids
   *
   * @return A list of symbols traded on the exchange
   */
  getSymbols(symbols?: string[]): Promise<{ [key: string]: Symbol[] }> {
    return this.get("public/symbol/", { symbols });
  }

  /**
   * Get a symbol by its id
   *
   * A symbol is the combination of the base currency (first one) and quote currency (second one)
   *
   * Requires no API key Access Rights.
   *
   * https://api.exchange.cryptomkt.com/#symbols
   *
   * @param {string} symbol A symbol id
   *
   * @return A symbol traded on the exchange
   */
  getSymbol(symbol: string): Promise<Symbol> {
    return this.get(`public/symbol/${symbol}`);
  }

  /**
   * Get tickers for all symbols or for specified symbols
   *
   * Requires no API key Access Rights.
   *
   * https://api.exchange.cryptomkt.com/#tickers
   *
   * @param {string[]} [symbols] Optional. A list of symbol ids
   *
   * @returns An object/dict with symbols ids as keys.
   */
  getTickers(symbols?: string[]): Promise<{ [key: string]: Ticker[] }> {
    return this.get("public/ticker/", { symbols });
  }

  /**
   * Get the ticker of a symbol
   *
   * Requires no API key Access Rights.
   *
   * https://api.exchange.cryptomkt.com/#tickers
   *
   * @param {string} symbol A symbol id
   *
   * @returns A ticker of a symbol
   */
  getTicker(symbol: string): Promise<Ticker> {
    return this.get(`public/ticker/${symbol}`);
  }

  /**
   * Get quotation prices of currencies
   *
   * Requires no API key Access Rights.
   *
   * https://api.exchange.cryptomkt.com/#prices
   *
   * @param {object} params
   * @param {string} params.to - Target currenct code.
   * @param {string} [params.from] - Optional. Source currency code.
   *
   * @returns An object/dict of quotation prices of currencies, indexed by source currency code.
   */
  getPrices(params: {
    to: string;
    from?: string;
  }): Promise<{ [key: string]: Price[] }> {
    return this.get(`public/price/rate`, params);
  }

  /**
   * Get quotation prices history
   *
   * Requires no API key Access Rights.
   *
   * https://api.exchange.cryptomkt.com/#prices
   *
   * @param {object} [params]
   * @param {string} [params.from] Optional. Source currency code.
   * @param {string} [params.to] Target currenct code.
   * @param {string} [params.until] Optional. Last value of the queried interval
   * @param {string} [params.since] Optional. Initial value of the queried interval
   * @param {number} [params.limit] Optional. Prices per currency pair. Defaul is 1. Min is 1. Max is 1000
   * @param {PERIOD} [params.period] Optional. A valid tick interval. 'M1' (one minute), 'M3', 'M5', 'M15', 'M30', 'H1' (one hour), 'H4', 'D1' (one day), 'D7', '1M' (one month). Default is 'M30'
   * @param {SORT} [params.sort] Optional. Sort direction. 'ASC' or 'DESC'. Default is 'DESC'
   *
   * @returns An object/dict of quotation prices of currencies, indexed by source currency code.
   */
  getPricesHistory(params?: {
    from?: string;
    to?: string;
    until?: string;
    since?: string;
    limit?: number;
    period?: PERIOD;
    sort?: SORT;
  }): Promise<{ [key: string]: PriceHistory }> {
    return this.get(`public/price/history`, params);
  }

  /**
   * Get ticker's last prices for all symbols or for the specified symbol
   *
   * Requires no API key Access Rights.
   *
   * https://api.exchange.cryptomkt.com/#prices
   *
   * @param {string[]} [symbols] Optional. A list of symbol ids
   * @returns An object/dict of ticker prices of currencies, indexed by symbol.
   */
  getTickerLastPrices(symbols?: string[]): Promise<{ [key: string]: Ticker }> {
    return this.get(`public/price/ticker`, { symbols });
  }

  /**
   * Get ticker's last prices of a symbol
   *
   * Requires no API key Access Rights.
   *
   * https://api.exchange.cryptomkt.com/#prices
   *
   * @param {string} symbol A symbol id.
   * @returns The ticker's last price of a symbol.
   */
  getTickerLastPriceOfSymbol(symbol: string): Promise<Ticker> {
    return this.get(`public/price/ticker/${symbol}`);
  }

  /**
   * Get trades for all symbols or for specified symbols
   *
   * 'from' param and 'till' param must have the same format, both id or both timestamp
   *
   * Requires no API key Access Rights.
   *
   * https://api.exchange.cryptomkt.com/#trades
   *
   * @param {object} [params]
   * @param {string[]} [params.symbols] Optional. A list of symbol ids
   * @param {SORT_BY} [params.by] Optional. Sorting parameter. 'id' or 'timestamp'. Default is 'timestamp'
   * @param {SORT} [params.sort] Optional. Sort direction. 'ASC' or 'DESC'. Default is 'DESC'
   * @param {string} [params.from] Optional. Initial value of the queried interval
   * @param {string} [params.till] Optional. Last value of the queried interval
   * @param {number} [params.limit] Optional. Trades per query. Defaul is 10. Min is 1, Max is 1000
   *
   * @return An object/dict with a list of trades for each symbol of the query. Indexed by symbol.
   */
  getTrades(params?: {
    symbols?: string[];
    by?: SORT_BY;
    sort?: SORT;
    from?: string;
    till?: string;
    limit?: number;
  }): Promise<{ [key: string]: PublicTrade[] }> {
    return this.get("public/trades", params);
  }

  /**
   * Get trades of a symbol
   *
   * 'from' param and 'till' param must have the same format, both id or both timestamp
   *
   * Requires no API key Access Rights.
   *
   * https://api.exchange.cryptomkt.com/#trades
   *
   * @param {string} symbol A symbol id
   * @param {object} params
   * @param {SORT} [params.sort] Optional. Sort direction. 'ASC' or 'DESC'. Default is 'DESC'
   * @param {SORT_BY} [params.by] Optional. Sorting parameter. 'id' or 'timestamp'. Default is 'timestamp
   * @param {string} [params.from] Optional. Initial value of the queried interval
   * @param {string} [params.till] Optional. Last value of the queried interval
   * @param {number} [params.limit] Optional. Trades per query. Defaul is 100. Min is 1. Max is 1000
   * @param {number} [params.offset] Optional. Default is 0. Min is 0. Max is 100000
   *
   * @return A list of trades of the symbol
   */
  getTradesOfSymbol(
    symbol: string,
    params?: {
      sort?: SORT;
      by?: SORT_BY;
      from?: string;
      till?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    return this.get(`public/trades/${symbol}`, params);
  }

  /**
   * Get orderbooks for all symbols or for the specified symbols
   *
   * An Order Book is an electronic list of buy and sell orders for a specific symbol, structured by price level
   *
   * Requires no API key Access Rights.
   *
   * https://api.exchange.cryptomkt.com/#order-books
   *
   * @param {object} [params]
   * @param {string[]} [params.symbols] Optional. A list of symbol ids
   * @param {number} [params.depth] Optional. Order Book depth. Default value is 100. Set to 0 to view the full Order Book.
   *
   * @return An object/dict with the order book for each queried symbol. indexed by symbol.
   */
  getOrderBooks(params?: {
    symbols?: string[];
    depth?: number;
  }): Promise<{ [key: string]: OrderBook }> {
    return this.get("public/orderbook/", params);
  }

  /**
   * Get order book of a symbol
   *
   * An Order Book is an electronic list of buy and sell orders for a specific symbol, structured by price level
   *
   * Requires no API key Access Rights.
   *
   * https://api.exchange.cryptomkt.com/#order-books
   *
   * @param {string} symbol The symbol id
   * @param {number} [.depth] Optional. Order Book depth. Default value is 100. Set to 0 to view the full Order Book.
   *
   * @return The order book of the symbol
   */
  getOrderBookOfSymbol(symbol: string, depth?: number): Promise<OrderBook> {
    return this.get(`public/orderbook/${symbol}`, { depth });
  }

  /**
   * Get order book of a symbol with the desired volume for market depth search.
   *
   * An Order Book is an electronic list of buy and sell orders for a specific symbol, structured by price level
   *
   * Requires no API key Access Rights.
   *
   * https://api.exchange.cryptomkt.com/#order-books
   *
   * @param {object} params
   * @param {string} params.symbol The symbol id
   * @param {number} [params.volume] Desired volume for market depth search
   *
   * @return The order book of the symbol
   */
  getOrderBookVolume({
    symbol,
    volume,
  }: {
    symbol: string;
    volume?: number;
  }): Promise<OrderBook> {
    return this.get(`public/orderbook/${symbol}`, { volume });
  }

  /**
   * Get candles for all symbols or for specified symbols
   *
   * Candels are used for OHLC representation
   *
   *  The result contains candles with non-zero volume only (no trades = no candles).
   *
   * Requires no API key Access Rights.
   *
   * https://api.exchange.cryptomkt.com/#candles
   *
   * @param {object} [params]
   * @param {string[]} [params.symbols] Optional. A list of symbol ids
   * @param {PERIOD} [params.period] Optional. A valid tick interval. 'M1' (one minute), 'M3', 'M5', 'M15', 'M30', 'H1' (one hour), 'H4', 'D1' (one day), 'D7', '1M' (one month). Default is 'M30'
   * @param {SORT} [params.sort] Optional. Sort direction. 'ASC' or 'DESC'. Default is 'DESC'
   * @param {string} [params.from] Optional. Initial value of the queried interval. As Datetime
   * @param {string} [params.till] Optional. Last value of the queried interval. As Datetime
   * @param {number} [params.limit] Optional. Candles per query. Defaul is 10. Min is 1. Max is 1000
   *
   * @return An object/dict with a list of candles for each symbol of the query. indexed by symbol.
   */
  getCandles(params?: {
    symbols?: string[];
    period?: PERIOD;
    sort?: SORT;
    from?: string;
    till?: string;
    limit?: number;
  }): Promise<{ [key: string]: Candle[] }> {
    return this.get("public/candles/", params);
  }

  /**
   * Get candles for a symbol
   *
   * Candels are used for OHLC representation
   *
   *  The result contains candles with non-zero volume only (no trades = no candles).
   *
   * Requires no API key Access Rights.
   *
   * https://api.exchange.cryptomkt.com/#candles
   *
   * @param {string} symbol A symbol id
   * @param {object} [params]
   * @param {PERIOD} [params.period] Optional. A valid tick interval. 'M1' (one minute), 'M3', 'M5', 'M15', 'M30', 'H1' (one hour), 'H4', 'D1' (one day), 'D7', '1M' (one month). Default is 'M30'
   * @param {SORT} [params.sort] Optional. Sort direction. 'ASC' or 'DESC'. Default is 'DESC'
   * @param {string} [params.from] Optional. Initial value of the queried interval
   * @param {string} [params.till] Optional. Last value of the queried interval
   * @param {number} [params.limit] Optional. Candles per query. Defaul is 100. Max is 1000
   * @param {number} [params.offset] Optional. Default is 0. Min is 0. Max is 100000
   *
   * @return A list of candles of a symbol
   */
  getCandlesOfSymbol(
    symbol: string,
    params?: {
      period?: PERIOD;
      sort?: SORT;
      from?: string;
      till?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<Candle[]> {
    return this.get(`public/candles/${symbol}`, params);
  }

  /////////////////////////
  // AUTHENTICATED CALLS //
  /////////////////////////

  /////////////
  // TRADING //
  /////////////

  /**
   * Get the user's spot trading balance for all currencies with balance.
   *
   * Requires the "Orderbook, History, Trading balance" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#get-spot-trading-balance
   *
   * @return A list of spot balances.
   */
  getSpotTradingBalances(): Promise<Balance[]> {
    return this.get("spot/balance");
  }

  /**
   * Get the user spot trading balance of a currency
   *
   * Requires the "Orderbook, History, Trading balance" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#get-spot-trading-balance
   *
   * @param {string} currency The currency code to query the balance
   *
   * @return the spot trading balance of a currency.
   */
  async getSpotTradingBalanceOfCurrency(currency: string): Promise<Balance> {
    const balance = await this.get(`spot/balance/${currency}`);
    balance.currency = currency;
    return balance;
  }

  /**
   * Get the user's active spot orders
   *
   * Requires the "Place/cancel orders" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#get-all-active-spot-orders
   *
   * @param {string} symbol Optional. A symbol for filtering the active spot orders
   *
   * @return A list of orders
   */
  getAllActiveSpotOrders(symbol?: string): Promise<Order[]> {
    return this.get("spot/order", { symbol });
  }

  /**
   * Get an active spot order by its client order id
   *
   * Requires the "Place/cancel orders" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#get-active-spot-orders
   *
   * @param {string} client_order_id The clientOrderId of the order
   *
   * @return An order of the account
   */
  getActiveSpotOrder(client_order_id: string): Promise<Order> {
    return this.get(`spot/order/${client_order_id}`);
  }

  /**
   * Creates a new spot order
   *
   * Requires the "Place/cancel orders" API key Access Right.
   *
   * For fee, price accuracy and quantity, and for order status information see the docs.
   *
   * https://api.exchange.cryptomkt.com/#create-new-spot-order
   *
   * @param {object} params
   * @param {string} params.symbol Trading symbol
   * @param {SIDE} params.side 'buy' or 'sell'
   * @param {string} params.quantity Order quantity
   * @param {string} [params.client_order_id] Optional. If given must be unique within the trading day, including all active orders. If not given, is generated by the server
   * @param {ORDER_TYPE} [params.type] Optional. 'limit', 'market', 'stopLimit', 'stopMarket', 'takeProfitLimit' or 'takeProfitMarket'. Default is 'limit'
   * @param {TIME_IN_FORCE} [params.time_in_force] Optional. 'GTC', 'IOC', 'FOK', 'Day', 'GTD'. Default to 'GTC'
   * @param {string} [params.price] Required for 'limit' and 'stopLimit'. limit price of the order
   * @param {string} [params.stop_price] Required for 'stopLimit' and 'stopMarket' orders. stop price of the order
   * @param {string} [params.expire_time] Required for orders with timeInForce = GDT
   * @param {boolean} [params.strict_validate] Optional. If False, the server rounds half down for tickerSize and quantityIncrement. Example of ETHBTC: tickSize = '0.000001', then price '0.046016' is valid, '0.0460165' is invalid
   * @param {boolean} [params.post_only] Optional. If True, your post_only order causes a match with a pre-existing order as a taker, then the order will be cancelled
   * @param {string} [params.take_rate] Optional. Liquidity taker fee, a fraction of order volume, such as 0.001 (for 0.1% fee). Can only increase the fee. Used for fee markup.
   * @param {string} [params.make_rate] Optional. Liquidity provider fee, a fraction of order volume, such as 0.001 (for 0.1% fee). Can only increase the fee. Used for fee markup.
   *
   * @return A new spot order
   */
  createNewSpotOrder(params: {
    symbol: string;
    side: SIDE;
    quantity: string;
    client_order_id?: string;
    type?: ORDER_TYPE;
    time_in_force?: TIME_IN_FORCE;
    price?: string;
    stop_price?: string;
    expire_time?: string;
    strict_validate?: boolean;
    post_only?: boolean;
    take_rate?: string;
    make_rate?: string;
  }): Promise<Order> {
    return this.post("spot/order", params);
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
   * @return A promise that resolves with a list of reports of the created orders
   */
  async createNewSpotOrderList(params: {
    order_list_id: string;
    contingency_type: CONTINGENCY;
    orders: OrderRequest[];
  }): Promise<Order[]> {
    return this.post("spot/order/list", params);
  }

  /**
   * Replaces a spot order
   *
   * Requires the "Place/cancel orders" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#replace-spot-order
   *
   * @param {string} client_order_id  client_order_id of the old order
   * @param {object} params Parameters
   * @param {string} params.new_client_order_id client_order_id for the new order.
   * @param {string} params.quantity Order quantity.
   * @param {string} [params.price] Required if order type is limit, stopLimit, or takeProfitLimit. Order price.
   * @param {boolean} [params.strict_validate] Optional. Price and quantity will be checked for incrementation within the symbol’s tick size and quantity step. See the symbol's tick_size and quantity_increment.
   *
   * @returns the new spot order
   */
  replaceSpotOrder(
    client_order_id: string,
    params: {
      new_client_order_id: string;
      quantity: string;
      price?: string;
      strictValidate?: boolean;
    }
  ): Promise<Order> {
    return this.patch(`spot/order/${client_order_id}`, params);
  }

  /**
   * Cancel all active spot orders, or all active orders for a specified symbol
   *
   * Requires the "Place/cancel orders" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#cancel-all-spot-orders
   *
   * @returns A list with the canceled orders
   */
  cancelAllSpotOrders(): Promise<Order[]> {
    return this.delete("spot/order");
  }

  /**
   * Cancel the order with clientOrderId
   *
   * Requires authentication
   *
   * https://api.exchange.cryptomkt.com/#cancel-spot-order
   *
   * @param {string} client_order_id the client_order_id of the order to cancel
   *
   * @return The canceled order
   */
  cancelSpotOrder(client_order_id: string): Promise<Order> {
    return this.delete(`spot/order/${client_order_id}`);
  }

  /**
   * Get the personal trading commission rates for all symbols
   *
   * Requires the "Place/cancel orders" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#get-all-trading-commission
   *
   * @return A list of commission rates
   */
  getAllTradingCommissions(): Promise<Commission[]> {
    return this.get(`spot/fee`);
  }

  /**
   * Get the personal trading commission rate for a symbol
   *
   * Requires the "Place/cancel orders" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#get-trading-commission
   *
   * @param {string} symbol The symbol of the commission rate
   *
   * @return The commission rate of a symbol
   */
  async getTradingCommission(symbol: string): Promise<Commission> {
    const commission = await this.get(`spot/fee/${symbol}`);
    commission.symbol = symbol;
    return commission;
  }

  //////////////////////////
  // SPOT TRADING HISTORY //
  //////////////////////////

  /**
   * Get all the spot orders
   *
   * Orders without executions are deleted after 24 hours
   *
   * Requires the "Orderbook, History, Trading balance" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#spot-orders-history
   *
   * @param {object} [params]
   * @param {string} [params.symbol] Optional. Filter orders by symbol
   * @param {SORT_BY} [params.by] Optional. Sorting type. 'timestamp' or 'id'. Default is 'timestamp'
   * @param {SORT} [params.sort] Optional. Sort direction. 'ASC' or 'DESC'. Default is 'DESC'
   * @param {string} [params.from] Optional. Initial value of the queried interval.
   * @param {string} [params.till] Optional. Last value of the queried interval
   * @param {number} [params.limit] Optional. Trades per query. Defaul is 100. Max is 1000
   * @param {number} [params.offset] Optional. Default is 0. Min is 0. Max is 100000
   *
   * @return A list of orders
   */
  getSpotOrdersHistory(params?: {
    symbol?: string;
    by?: SORT_BY;
    sort?: SORT;
    from?: string;
    till?: string;
    limit?: number;
    offset?: number;
  }): Promise<Order[]> {
    return this.get("spot/history/order", params);
  }

  /**
   * Get the user's spot trading history
   *
   * Requires the "Orderbook, History, Trading balance" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#spot-trades-history
   *
   * @param {object} [params]
   * @param {string} [params.order_id] Optional. Order unique identifier as assigned by the exchange
   * @param {string} [params.symbol] Optional. Filter trades by symbol
   * @param {SORT} [params.sort] Optional. Sort direction. 'ASC' or 'DESC'. Default is 'DESC'
   * @param {SORT_BY} [params.by] Optional. Sorting type.'timestamp' or 'id'. Default is 'id'
   * @param {string} [params.from] Optional. Initial value of the queried interval.
   * @param {string} [params.till] Optional. Last value of the queried interval.
   * @param {number} [params.limit] Optional. Trades per query. Defaul is 100. Max is 1000
   * @param {number} [params.offset] Optional. Default is 0. Max is 100000
   * @return A list of trades
   */
  getSpotTradesHistory(params?: {
    order_id?: string;
    symbol?: string;
    sort?: SORT;
    by?: SORT_BY;
    from?: string;
    till?: string;
    limit?: number;
    offset?: number;
  }): Promise<Trade[]> {
    return this.get("spot/history/trade", params);
  }

  ///////////////////////
  // WALLET MANAGEMENT //
  ///////////////////////

  /**
   * Get the user's wallet balances, except zero balances.
   *
   * Requires the "Payment information" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#wallet-balance
   *
   * @return A list of wallet balances
   */
  getWalletBalance(): Promise<Balance[]> {
    return this.get("wallet/balance");
  }

  /**
   * Get the user's wallet balance of a currency
   *
   * Requires the "Payment information" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#wallet-balance
   *
   * @param {string} currency Currency to get the balance
   *
   * @return The wallet balance of the currency
   */
  async getWalletBalanceOfCurrency(currency: string): Promise<Balance> {
    let balance = await this.get(`wallet/balance/${currency}`);
    balance.currency = currency;
    return balance;
  }

  /**
   * Get the current addresses of the user
   *
   * Requires the "Payment information" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#deposit-crypto-address
   *
   * @return A list of currency addresses
   */
  getDepositCryptoAddresses(): Promise<Address[]> {
    return this.get(`wallet/crypto/address`);
  }

  /**
   * Get the current address of a currency
   *
   * Requires the "Payment information" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#deposit-crypto-address
   *
   * @param {string} currency currency to get the address
   *
   * @return the currency address
   */
  async getDepositCryptoAddressOfCurrency(currency: string): Promise<Address> {
    const addressList = await this.get(`wallet/crypto/address`, { currency });
    return addressList[0];
  }

  /**
   * Creates a new address for the currency
   *
   * Requires the "Payment information" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#deposit-crypto-address
   *
   * @param {string} currency currency to create a new address
   *
   * @return The created address for the currency
   */
  createDepositCryptoAddress(currency: string): Promise<Address> {
    return this.post(`wallet/crypto/address`, { currency });
  }

  /**
   * Get the last 10 unique addresses used for deposit, by currency
   *
   *  Addresses used a long time ago may be omitted, even if they are among the last 10 unique addresses
   *
   * Requires the "Payment information" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#last-10-deposit-crypto-address
   *
   * @param {string} currency currency to get the list of addresses
   *
   * @return A list of addresses
   */
  getLast10DepositCryptoAddresses(currency: string): Promise<Address[]> {
    return this.get(`wallet/crypto/address/recent-deposit`, { currency });
  }

  /**
   * Get the last 10 unique addresses used for withdrawals, by currency
   *
   *  Addresses used a long time ago may be omitted, even if they are among the last 10 unique addresses
   *
   * Requires the "Payment information" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#last-10-withdrawal-crypto-addresses
   *
   * @param {string} currency currency to get the list of addresses
   *
   * @return A list of addresses
   */
  getLast10WithdrawalCryptoAddresses(currency: string): Promise<Address[]> {
    return this.get(`wallet/crypto/address/recent-withdraw`, { currency });
  }

  /**
   * Withdraw cryptocurrency
   *
   * Please take note that changing security settings affects withdrawals:
   *  - It is impossible to withdraw funds without enabling the two-factor authentication (2FA)
   *  - Password reset blocks withdrawals for 72 hours
   *  - Each time a new address is added to the whitelist, it takes 48 hours before that address becomes active for withdrawal
   *
   * Successful response to the request does not necessarily mean the resulting transaction got executed immediately. It has to be processed first and may eventually be rolled back.
   *
   * To see whether a transaction has been finalized, call {@link getTransaction}
   *
   * Requires the "Withdraw cryptocurrencies" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#withdraw-crypto
   *
   * @param {object} params
   * @param {string} params.currency currency code of the crypto to withdraw
   * @param {string} params.amount the amount to be sent to the specified address
   * @param {string} params.address the address identifier
   * @param {string} [params.payment_id] Optional.
   * @param {boolean} [params.include_fee] Optional. If true then the total spent amount includes fees. Default false
   * @param {boolean} [params.auto_commit] Optional. If false then you should commit or rollback transaction in an hour. Used in two phase commit schema. Default true
   * @param {USE_OFFCHAIN} [params.use_offchain] Whether the withdrawal may be committed offchain. 'never', 'optionally', 'required'
Accepted values: never, optionally, required
   * @param {string} [params.public_comment] Optional. Maximum length is 255.
   *
   * @return The transaction id, asigned by the exchange
   */
  async withdrawCrypto(params: {
    currency: string;
    amount: string;
    address: string;
    paymend_id?: string;
    include_fee?: boolean;
    auto_commit?: boolean;
    use_offchain?: USE_OFFCHAIN;
    public_comment?: string;
  }): Promise<string> {
    const response = await this.post("wallet/crypto/withdraw", params);
    return response["id"];
  }

  /**
   * Commit a withdrawal
   *
   * Requires the "Withdraw cryptocurrencies" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#withdraw-crypto-commit-or-rollback
   *
   * @param {string} id the withdrawal transaction identifier
   *
   * @return The transaction result. true if the commit is successful
   */
  async withdrawCryptoCommit(id: string): Promise<boolean> {
    const response = await this.put(`wallet/crypto/withdraw/${id}`);
    return response["result"];
  }

  /**
   * Rollback a withdrawal
   *
   * Requires the "Withdraw cryptocurrencies" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#withdraw-crypto-commit-or-rollback
   *
   * @param {string} id the withdrawal transaction identifier
   *
   * @return The transaction result. true if the rollback is successful
   */
  async withdrawCryptoRollback(id: string): Promise<boolean> {
    const response = await this.delete(`wallet/crypto/withdraw/${id}`);
    return response["result"];
  }

  /**
   * Get an estimate of the withdrawal fee
   *
   * Requires the "Payment information" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#estimate-withdraw-fee
   *
   * @param {object} params
   * @param {string} params.currency the currency code for withdraw
   * @param {string} params.amount the expected withdraw amount
   *
   * @return The expected fee
   */
  async getEstimateWithdrawFee(params: {
    currency: string;
    amount: string;
  }): Promise<string> {
    const response = await this.get("wallet/crypto/fee/estimate", params);
    return response["fee"];
  }

  /**
   * Converts between currencies
   *
   * Successful response to the request does not necessarily mean the resulting transaction got executed immediately. It has to be processed first and may eventually be rolled back.
   *
   * To see whether a transaction has been finalized, call {@link getTransaction}
   *
   * Requires the "Payment information" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#convert-between-currencies
   *
   * @param {object} params
   * @param {string} params.from_currency currency code of origin
   * @param {string} params.to_currency currency code of destiny
   * @param {string} params.amount the amount to be sent
   *
   * @return A list of transaction identifiers of the convertion
   */
  async convertBetweenCurrencies(params: {
    from_currency: string;
    to_currency: string;
    amount: string;
  }): Promise<string[]> {
    const response = await this.post("wallet/convert", params);
    return response["result"];
  }

  /**
   * Check if an address is from this account
   *
   * Requires the "Payment information" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#check-if-crypto-address-belongs-to-current-account
   *
   * @param {string} address The address to check
   *
   * @return True if it is from the current account
   */
  async checkIfCryptoAddressBelongsToCurrentAccount(
    address: string
  ): Promise<boolean> {
    const response = await this.get(`wallet/crypto/address/check-mine`, {
      address,
    });
    return response["result"];
  }

  /**
   * Transfer funds between account types.
   *
   * Requires the "Payment information" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#transfer-between-wallet-and-exchange
   *
   * @param {object} params
   * @param {string} params.currency Currency code for transfering
   * @param {number} params.amount Amount to be transfered
   * @param {ACCOUNT} params.source Transfer source account type. "wallet" or  "spot". Must not be the same as destination
   * @param {ACCOUNT} params.destination Transfer destination account type.
Accepted values: wallet, spot. Must not be the same as source
   *
   * @return the transaction identifier of the transfer
   */
  async transferBetweenWalletAndExchange(params: {
    currency: string;
    amount: number;
    source: ACCOUNT;
    destination: ACCOUNT;
  }): Promise<string> {
    const response = await this.post("wallet/transfer", params);
    return response["id"];
  }

  /**
   * Transfer funds to another user
   *
   * Requires the "Withdraw cryptocurrencies" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#transfer-money-to-another-user
   *
   * @param {object} params
   * @param {string} params.currency currency code
   * @param {number} params.amount amount to be transfered between balances
   * @param {IDENTIFY_BY} params.by type of identifier. 'email' or 'username'
   * @param {string} params.identifier the email or the username of the recieving user
   *
   * @return The transaction identifier of the transfer
   */
  async transferMoneyToAnotherUser(params: {
    currency: string;
    amount: number;
    by: IDENTIFY_BY;
    identifier: string;
  }): Promise<string> {
    const response = await this.post("wallet/internal/withdraw", params);
    return response["result"];
  }

  /**
   * Get transactions of the account
   *
   * Important:
   *  - The list of supported transaction types may be expanded in future versions.
   *  - Some transaction subtypes are reserved for future use and do not purport to provide any functionality on the platform.
   *  - The list of supported transaction subtypes may be expanded in future versions.
   *
   * Requires the "Payment information" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#get-transactions-history
   *
   *
   * @param {object} [params]
   * @param {string[]} [params.tx_ids] Optional. List of transaction identifiers to query
   * @param {TRANSACTION_TYPE[]} [params.types] Optional. List of types to query. valid types are: 'DEPOSIT', 'WITHDRAW', 'TRANSFER' and 'SWAP'
   * @param {TRANSACTION_SUBTYPE[]} [params.subtypes] Optional. List of subtypes to query. valid subtypes are: 'UNCLASSIFIED', 'BLOCKCHAIN', 'AIRDROP', 'AFFILIATE', 'STAKING', 'BUY_CRYPTO', 'OFFCHAIN', 'FIAT', 'SUB_ACCOUNT', 'WALLET_TO_SPOT', 'SPOT_TO_WALLET', 'WALLET_TO_DERIVATIVES', 'DERIVATIVES_TO_WALLET', 'CHAIN_SWITCH_FROM', 'CHAIN_SWITCH_TO' and 'INSTANT_EXCHANGE'
   * @param {TRANSACTION_STATUS[]} [params.statuses] Optional. List of statuses to query. valid subtypes are: 'CREATED', 'PENDING', 'FAILED', 'SUCCESS' and 'ROLLED_BACK'
   * @param {SORT_BY} [params.order_by] Optional. Defines the sorting type.'created_at' or 'id'. Default is 'created_at'
   * @param {string} [params.from] Optional. Interval initial value when ordering by 'created_at'. As Datetime
   * @param {string} [params.till] Optional. Interval end value when ordering by 'created_at'. As Datetime
   * @param {string} [params.id_from] Optional. Interval initial value when ordering by id. Min is 0
   * @param {string} [params.id_till] Optional. Interval end value when ordering by id. Min is 0
   * @param {string} [params.sort] Optional. Sort direction. 'ASC' or 'DESC'. Default is 'DESC'.
   * @param {number} [params.limit] Optional. Transactions per query. Defaul is 100. Max is 1000
   * @param {number} [params.offset] Optional. Default is 0. Max is 100000
   *
   * @return A list of transactions
   */
  getTransactionHistory(params?: {
    tx_ids?: string[];
    types?: TRANSACTION_TYPE[];
    subtypes?: TRANSACTION_SUBTYPE[];
    statuses?: TRANSACTION_STATUS[];
    order_by: SORT_BY;
    from: string;
    till?: string;
    id_from?: string;
    id_till?: string;
    sort?: string;
    limit?: number;
    offset?: number;
  }): Promise<Transaction[]> {
    return this.get("wallet/transactions", params);
  }

  /**
   * Get the transactions of the account by its identifier
   *
   * Requires the "Payment information" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#get-transactions-history
   *
   * @param {string} id The identifier of the transaction
   *
   * @return The transaction with the given id
   */
  getTransaction(id: string): Promise<Transaction> {
    return this.get(`wallet/transactions/${id}`);
  }

  /**
   * get the status of the offchain
   *
   * Requires the "Payment information" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#check-if-offchain-is-available
   *
   * @param {object} params
   * @param {string} params.currency currency code
   * @param {string} params.address address identifier
   * @param {string} [params.payment_id] Optional
   *
   * @return True if the offchain is available
   */
  async checkIfOffchainIsAvailable(params: {
    currency: string;
    address: string;
    payment_id?: string;
  }): Promise<boolean> {
    const response = await this.post(
      `wallet/crypto/check-offchain-available`,
      params
    );
    return response["result"];
  }

  /**
   * Get the list of amount locks
   *
   * Requires the "Payment information" API key Access Right.
   *
   * https://api.exchange.cryptomkt.com/#get-amount-locks
   *
   * @param {object} [params]
   * @param {string} [params.currency] Optional. Currency code
   * @param {boolean} [params.active] Optional. value showing whether the lock is active
   * @param {number} [params.limit] Optional. Dafault is 100. Min is 0. Max is 1000
   * @param {number} [params.offset] Optional. Default is 0. Min is 0
   * @param {Datetime} [params.from] Optional. Interval initial value
   * @param {Datetime} [params.till] Optional. Interval end value
   *
   * @return A list of locks
   */
  getAmountLocks(params?: {
    currency: string;
    active?: boolean;
    limit?: number;
    offset?: number;
    from?: string;
    till?: string;
  }): Promise<AmountLock[]> {
    return this.get("wallet/amount-locks", params);
  }

  //////////////////
  // SUB ACCOUNTS //
  //////////////////

  /**
   * Returns list of sub-accounts per a super account.
   *
   * Requires no API key Access Rights.
   *
   * https://api.exchange.cryptomkt.com/#get-sub-accounts-list
   *
   * @return A list of subaccounts
   */
  async getSubAccountList(): Promise<SubAccount[]> {
    const response = await this.get("sub-account");
    return response["result"];
  }

  /**
   * Freezes sub-accounts listed. It implies that the Sub-accounts frozen wouldn't be able to:
   * - login
   * - withdraw funds
   * - trade
   * - complete pending orders
   * - use API keys
   *
   * For any sub-account listed, all orders will be canceled and all funds will be transferred form the Trading balance.
   *
   * Requires no API key Access Rights
   *
   * https://api.exchange.cryptomkt.com/#freeze-sub-account
   *
   * @param {string[]} sub_account_ids A list of sub-account IDs to freeze
   *
   * @return true if the freeze was successful
   */
  async freezeSubAccounts(sub_account_ids: string[]): Promise<boolean> {
    const response = await this.post("sub-account/freeze", { sub_account_ids });
    return response["result"];
  }

  /**
   * Activates sub-accounts listed. It would make sub-accounts active after being frozen
   *
   * Requires no API key Access Rights
   *
   * https://api.exchange.cryptomkt.com/#activate-sub-account
   *
   * @param {string[]} sub_account_ids A list of account IDs to activate
   *
   * @return true if the activation was successful
   */
  async activateSubAccounts(sub_account_ids: string[]): Promise<boolean> {
    const response = await this.post("sub-account/activate", {
      sub_account_ids,
    });
    return response["result"];
  }

  /**
   * Transfers funds from the super-account to a sub-account or from a sub-account to the super-account
   *
   * Requires the "Withdraw cryptocurrencies" API key Access Right
   *
   * https://api.exchange.cryptomkt.com/#transfer-funds
   *
   * @param {object} params Parameters
   * @param {number} params.sub_account_id The account ID of the account to transfer from or to
   * @param {number} params.amount the amount of currency to transfer
   * @param {string} params.currency the currency to transfer
   * @param {TRANSFER_TYPE} params.type the type of transfer. TransferType.TO_SUB_ACCOUNT or TransferType.FROM_SUB_ACCOUNT
   *
   * @return The transaction ID of the tranfer
   */
  async transferFunds(params: {
    sub_account_id: number;
    amount: number;
    currency: string;
    type: TRANSFER_TYPE;
  }): Promise<string> {
    const response = await this.post("sub-account/transfer", params);
    return response["response"];
  }

  /**
   * Returns a list of withdrawal settings for sub-accounts listed
   *
   * Requires the "Payment information" API key Access Right
   *
   * https://api.exchange.cryptomkt.com/#get-acl-settings
   *
   * @param {string[]} sub_account_ids The list of sub-account IDs of the sub-accounts to get the ACL settings. The subAccountID filed is ignored.
   *
   * @return A list of withdraw settings for sub-accounts listed
   */
  async getACLSettings(sub_account_ids: string[]): Promise<ACLSettings[]> {
    const response = await this.get("sub-account/acl", { sub_account_ids });
    return response["result"];
  }

  /**
   * Disables or enables withdrawals for a sub-account
   *
   * Requires the "Payment information" API key Access Right
   *
   * https://api.exchange.cryptomkt.com/#change-acl-settings
   *
   * @param {object} params Parameters
   * @param {string[]} params.sub_account_ids The list of sub-account IDs to change the ACL settings
   * @param {boolean} [params.deposit_address_generation_enabled] value indicaiting permission for deposits
   * @param {boolean} [params.withdraw_enabled] value indicating permission for withdrawals
   * @param {string} [params.description] Textual description.
   * @param {string} [params.created_at] ACL creation time
   * @param {string} [params.updated_at] ACL update time
   * @return The list of the updated withdraw settings of the changed sub-account
   */
  async changeACLSettings(params: {
    sub_account_ids: string[];
    deposit_address_generation_enabled?: boolean;
    withdraw_enabled?: boolean;
    description?: string;
    created_at?: string;
    updated_at?: string;
  }): Promise<ACLSettings[]> {
    const response = await this.post("sub-account/acl", params);
    return response["result"];
  }

  /**
   * Returns non-zero balance values for a sub-account.
   *
   * Report will include the wallet and Trading balances for each currency.
   *
   * It is functional with no regard to the state of a sub-account. All account types are optional and appears only in case of non-zero balance
   *
   * Requires the "Payment information" API key Access Right
   *
   * https://api.exchange.cryptomkt.com/#get-sub-account-balance
   *
   * @param {string} sub_account_id the sub-account ID of the sub-account to get the balances
   *
   * @return A list of balances of the sub-account
   */
  async getSubAccountBalance(
    sub_account_id: string
  ): Promise<SubAccountBalance> {
    const response = await this.get(`sub-account/balance/${sub_account_id}`);
    return response["result"];
  }

  /**
   * Returns sub-account crypto address for currency
   *
   * Requires the "Payment information" API key Access Right
   *
   * https://api.exchange.cryptomkt.com/#get-sub-account-crypto-address
   *
   * @param {string} sub_account_id the sub-account ID to get the crypto address
   * @param {string} currency currency code to get the crypto address
   *
   * @return The crypto address
   */
  async getSubAccountCryptoAddress(
    sub_account_id: string,
    currency: string
  ): Promise<string> {
    const response = await this.get(
      `sub-account/crypto/address/${sub_account_id}/${currency}`
    );
    return response["result"];
  }
}
