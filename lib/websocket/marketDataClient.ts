//@ts-ignore
import {
  DEPTH,
  NOTIFICATION_TYPE,
  ORDER_BOOK_SPEED,
  PERIOD,
  PRICE_RATE_SPEED,
  TICKER_SPEED,
} from "../constants";
import { CryptomarketAPIException } from "../exceptions";
import {
  Candle,
  MiniTicker,
  OrderBookTop,
  PriceRate,
  Ticker,
  Trade,
  WSCandle,
  WSOrderBook,
  WSTicker,
  WSTrade,
  WSTradeRaw,
} from "../models";
import { parseMapInterceptor, parseMapListInterceptor, parseOrderbookTop, parsePriceRate, parseWSCandle, parseWSOrderbook, parseWSTicker, parseWSTrade } from "./DataParser";
import { WSClientBase } from "./clientBase";
import { fromCamelCaseToSnakeCase } from "../paramStyleConverter"

/**
 * MarketDataClient connects via websocket to cryptomarket to get market information of the exchange.
 * @param requestTimeoutMs Timeout time for subscription and unsubscription requests to the server. No timeout by default.
 */
export class MarketDataClient extends WSClientBase {
  constructor(requestTimeoutMs?: number) {
    super("wss://api.exchange.cryptomkt.com/api/3/ws/public", {}, requestTimeoutMs);
  }

  protected override handle({ msgJson }: { msgJson: string }): void {
    const message = JSON.parse(msgJson);
    if ("ch" in message) {
      this.handleChanneledNotification(message);
    } else if ("id" in message) {
      this.handleResponse(message);
    }
  }

  private handleChanneledNotification(notification: {
    ch: any;
    update: any;
    snapshot: any;
    data: any;
  }): void {
    const { ch: channel, update, snapshot, data } = notification;
    if (update) {
      this.emitter.emit(channel, update, NOTIFICATION_TYPE.UPDATE);
    } else if (snapshot) {
      this.emitter.emit(channel, snapshot, NOTIFICATION_TYPE.SNAPSHOT);
    } else {
      this.emitter.emit(channel, data, NOTIFICATION_TYPE.DATA);
    }
  }

  private sendChanneledSubscription({
    channel,
    callback,
    params,
  }: {
    channel: string;
    callback: (...args: any[]) => void;
    params: any;
  }): Promise<unknown> {
    this.emitter.on(channel, callback);
    const ID = this.getNextId();
    const emitter = this.emitter;
    const promise = new Promise(function (resolve, reject) {
      emitter.once(ID.toString(), function (response) {
        if ("error" in response) {
          reject(new CryptomarketAPIException(response.error));
          return;
        }
        resolve(response.result);
      });
    });
    let payload = {
      id: ID,
      method: "subscribe",
      ch: channel,
      params,
    };
    this.ws.send(JSON.stringify(payload));
    return promise;
  }

  private async makeSubscription({
    channel,
    callback,
    params,
    withDefaultSymbols = false,
    withDefaultCurrencies = false,
  }: {
    channel: string;
    callback: any;
    params: any;
    withDefaultSymbols?: boolean;
    withDefaultCurrencies?: boolean;
  }): Promise<string[]> {
    if (withDefaultSymbols && !params.symbols) {
      params.symbols = ["*"];
    }
    if (withDefaultCurrencies && !params.currencies) {
      params.currencies = ["*"];
    }
    const { subscriptions } = (await this.sendChanneledSubscription({
      channel,
      callback,
      params: fromCamelCaseToSnakeCase(params),
    })) as {
      subscriptions: string[];
    };
    return subscriptions;
  }

  /**
   * subscribe to a feed of trades
   *
   * subscription is for the specified symbols
   *
   * normal subscriptions have one update message per symbol
   *
   * the first notification contains the last n trades, with n defined by the
   * limit argument, the next notifications are updates and correspond to new
   * trades
   *
   * Requires no API key Access Rights
   *
   * https://api.exchange.cryptomkt.com/#subscribe-to-trades
   *
   * @param {function} callback a function that recieves notifications as a dict of trades indexed by symbol, and the type of the notification (either SNAPSHOT or UPDATE)
   * @param {string[]} params.symbols A list of symbol ids to recieve notifications
   * @param {number} params.limit Number of historical entries returned in the first feed. Min is 0. Max is 1000. Default is 0
   * @returns a promise that resolves when subscribed with a list of the successfully subscribed symbols
   */
  subscribeToTrades({
    callback,
    params,
  }: {
    callback: (
      notification: { [x: string]: WSTrade[] },
      type: NOTIFICATION_TYPE
    ) => any;
    params: { symbols: string[]; limit?: number };
  }): Promise<string[]> {
    return this.makeSubscription({
      channel: "trades",
      callback: parseMapListInterceptor(callback, parseWSTrade),
      params,
    });
  }

  /**
   * subscribe to a feed of candles
   *
   * subscription is for the specified symbols
   *
   * normal subscriptions have one update message per symbol
   *
   * the first notification are n candles, with n defined by the limit argument,
   * the next notification are updates, with one candle at a time
   *
   * Requires no API key Access Rights
   *
   * https://api.exchange.cryptomkt.com/#subscribe-to-candles
   *
   * @param {function} callback a function that recieves notifications as a dict of candles indexed by symbol, and the type of notification (either SNAPSHOT or UPDATE)
   * @param {PERIOD} params.period A valid tick interval. 'M1' (one minute), 'M3', 'M5', 'M15', 'M30', 'H1' (one hour), 'H4', 'D1' (one day), 'D7', '1M' (one month). 
   * @param {string[]} params.symbols A list of symbol ids
   * @param {number} [params.limit] Optional. Number of historical entries returned in the first feed. Min is 0. Max is 1000. Default is 0
   * @return A promise that resolves when subscribed with a list of the successfully subscribed symbols
   */
  subscribeToCandles({
    callback,
    params: { period, ...params },
  }: {
    callback: (
      notification: { [x: string]: WSCandle[] },
      type: NOTIFICATION_TYPE
    ) => any;
    params: { period: PERIOD; symbols: string[]; limit?: number };
  }): Promise<string[]> {
    return this.makeSubscription({
      channel: `candles/${period}`,
      callback: parseMapListInterceptor(callback, parseWSCandle),
      params,
    });
  }

  /**
   * subscribes to a feed of candles regarding the last price converted to the target currency * for the specified symbols
   *
   * subscription is only for the specified symbols
   *
   * normal subscriptions have one update message per symbol
   *
   * Requires no API key Access Rights
   *
   * https://api.exchange.cryptomkt.com/#subscribe-to-converted-candles
   *
   * @param {function} callback a function that recieves notifications as a dict of candles indexed by symbol, and the type of notification (either SNAPSHOT or UPDATE)
   * @param {function} params.targetCurrency Target currency for conversion
   * @param {PERIOD} params.period A valid tick interval. 'M1' (one minute), 'M3', 'M5', 'M15', 'M30', 'H1' (one hour), 'H4', 'D1' (one day), 'D7', '1M' (one month).
   * @param {string[]} params.symbols A list of symbol ids
   * @param {number} [params.limit] Optional. Number of historical entries returned in the first feed. Min is 0. Max is 1000. Default is 0
   * @return A promise that resolves when subscribed with a list of the successfully subscribed symbols
   */
  subscribeToConvertedCandles({
    callback,
    params: { period, ...params },
  }: {
    callback: (
      notification: { [x: string]: WSCandle[] },
      type: NOTIFICATION_TYPE
    ) => any;
    params: { targetCurrency: string, period: PERIOD; symbols: string[]; limit?: number };
  }): Promise<string[]> {
    return this.makeSubscription({
      channel: `converted/candles/${period}`,
      callback: parseMapListInterceptor(callback, parseWSCandle),
      params,
    });
  }

  /**
   * subscribe to a feed of mini tickers
   *
   * subscription is for all symbols or for the specified symbols
   *
   * normal subscriptions have one update message per symbol
   *
   * Requires no API key Access Rights
   *
   * https://api.exchange.cryptomkt.com/#subscribe-to-mini-ticker
   *
   * @param {function} callback a function that recieves notifications as a dict of mini tickers indexed by symbol id, and the type of notification (only DATA)
   * @param {TICKER_SPEED} params.speed The speed of the feed. '1s' or '3s'
   * @param {string[]} [params.symbols] Optional. A list of symbol ids
   * @return A promise that resolves when subscribed with a list of the successfully subscribed symbols
   */
  subscribeToMiniTicker({
    callback,
    params: { speed, ...params },
  }: {
    callback: (
      notification: { [x: string]: MiniTicker },
      type: NOTIFICATION_TYPE
    ) => any;
    params: { speed: TICKER_SPEED; symbols?: string[] };
  }): Promise<string[]> {
    return this.makeSubscription({
      channel: `ticker/price/${speed}`,
      callback: parseMapInterceptor(callback, parseWSCandle),
      params,
      withDefaultSymbols: true,
    });
  }

  /**
   * subscribe to a feed of mini tickers
   *
   * subscription is for all symbols or for the specified symbols
   *
   * batch subscriptions have a joined update for all symbols
   *
   * Requires no API key Access Rights
   *
   * https://api.exchange.cryptomkt.com/#subscribe-to-mini-ticker-in-batches
   *
   * @param {function} callback a function that recieves notifications as a dict of mini tickers indexed by symbol id, and the type of notification (only DATA)
   * @param {TICKER_SPEED} params.speed The speed of the feed. '1s' or '3s'
   * @param {string[]} [params.symbols] Optional. A list of symbol ids
   * @return A promise that resolves when subscribed with a list of the successfully subscribed symbols
   */
  subscribeToMiniTickerInBatches({
    callback,
    params: { speed, ...params },
  }: {
    callback: (
      notification: { [x: string]: MiniTicker[] },
      type: NOTIFICATION_TYPE
    ) => any;
    params: { speed: TICKER_SPEED; symbols?: string[] };
  }): Promise<string[]> {
    return this.makeSubscription({
      channel: `ticker/price/${speed}/batch`,
      callback: parseMapListInterceptor(callback, parseWSCandle),
      params,
      withDefaultSymbols: true,
    });
  }

  /**
   * subscribe to a feed of tickers
   *
   * subscription is for all symbols or for the specified symbols
   *
   * normal subscriptions have one update message per symbol
   *
   * Requires no API key Access Rights
   *
   * https://api.exchange.cryptomkt.com/#subscribe-to-ticker
   *
   * @param {function} callback a function that recieves notifications as a dict of tickers indexed by symbol id, and the type of notification (only DATA)
   * @param {TICKER_SPEED} params.speed The speed of the feed. '1s' or '3s'
   * @param {string[]} [param.symbols] Optional. A list of symbol ids
   * @return A promise that resolves when subscribed with a list of the successfully subscribed symbols
   */
  subscribeToTicker({
    callback,
    params: { speed, ...params },
  }: {
    callback: (
      notification: { [x: string]: WSTicker },
      type: NOTIFICATION_TYPE
    ) => any;
    params: { speed: TICKER_SPEED; symbols?: string[] };
  }): Promise<string[]> {
    return this.makeSubscription({
      channel: `ticker/${speed}`,
      callback: parseMapInterceptor(callback, parseWSTicker),
      params,
      withDefaultSymbols: true,
    });
  }

  /**
   * subscribe to a feed of tickers
   *
   * subscription is for all symbols or for the specified symbols
   *
   * batch subscriptions have a joined update for all symbols
   *
   * Requires no API key Access Rights
   *
   * https://api.exchange.cryptomkt.com/#subscribe-to-ticker-in-batches
   *
   * @param {function} callback a function that recieves notifications as a dict of tickers indexed by symbol id, and the type of notification (only DATA)
   * @param {TICKER_SPEED} params.speed The speed of the feed. '1s' or '3s'
   * @param {string[]} [params.symbols] Optional. A list of symbol ids
   * @return A promise that resolves when subscribed with a list of the successfully subscribed symbols
   */
  subscribeToTickerInBatches({
    callback,
    params: { speed, ...params },
  }: {
    callback: (
      notification: { [x: string]: WSTicker },
      type: NOTIFICATION_TYPE
    ) => any;
    params: { speed: TICKER_SPEED; symbols?: string[] };
  }): Promise<string[]> {
    return this.makeSubscription({
      channel: `ticker/${speed}/batch`,
      callback: parseMapInterceptor(callback, parseWSTicker),
      params,
      withDefaultSymbols: true,
    });
  }

  /**
   * subscribe to a feed of a full orderbook
   *
   * subscription is for all symbols or for the specified symbols
   *
   * normal subscriptions have one update message per symbol
   *
   * Requires no API key Access Rights
   *
   * https://api.exchange.cryptomkt.com/#subscribe-to-full-order-book
   *
   * @param {function} callback a function that recieves notifications as a dict of full orderbooks indexed by symbol id, and the type of notification (either SNAPSHOT or UPDATE)
   * @param {string[]} [params.symbols] Optional. A list of symbol ids
   * @return A promise that resolves when subscribed with a list of the successfully subscribed symbols
   */
  subscribeToFullOrderBook({
    callback,
    params,
  }: {
    callback: (
      notification: { [x: string]: WSOrderBook },
      type: NOTIFICATION_TYPE
    ) => any;
    params: { symbols?: string[] };
  }): Promise<string[]> {
    return this.makeSubscription({
      channel: "orderbook/full",
      callback: parseMapInterceptor(callback, parseWSOrderbook),
      params,
    });
  }

  /**
   * subscribe to a feed of a partial orderbook
   *
   * subscription is for all symbols or for the specified symbols
   *
   * normal subscriptions have one update message per symbol
   *
   * Requires no API key Access Rights
   *
   * https://api.exchange.cryptomkt.com/#subscribe-to-partial-order-book
   *
   * @param {function} callback a function that recieves notifications as a dict of partial orderbooks indexed by symbol id, and the type of notification (only DATA)
   * @param {ORDER_BOOK_SPEED} params.speed The speed of the feed. '100ms', '500ms' or '1000ms'
   * @param {DEPTH} params.depth The depth of the partial orderbook, 'D5', 'D10' or 'D20'
   * @param {string[]} [params.symbols] Optional. A list of symbol ids
   * @return A promise that resolves when subscribed with a list of the successfully subscribed symbols
   */
  subscribeToPartialOrderBook({
    callback,
    params: { speed, depth, ...params },
  }: {
    callback: (
      notification: { [x: string]: WSOrderBook },
      type: NOTIFICATION_TYPE
    ) => any;
    params: {
      speed: ORDER_BOOK_SPEED;
      depth: DEPTH;
      symbols?: string[];
    };
  }): Promise<string[]> {
    return this.makeSubscription({
      channel: `orderbook/${depth}/${speed}`,
      callback: parseMapInterceptor(callback, parseWSOrderbook),
      params,
      withDefaultSymbols: true,
    });
  }

  /**
   * subscribe to a feed of a partial orderbook in batches
   *
   * subscription is for all symbols or for the specified symbols
   *
   * batch subscriptions have a joined update for all symbols
   *
   * https://api.exchange.cryptomkt.com/#subscribe-to-partial-order-book-in-batches
   *
   * @param {function} callback a function that recieves notifications as a dict of partial orderbooks indexed by symbol id, and the type of notification (only DATA)
   * @param {ORDER_BOOK_SPEED} params.speed The speed of the feed. '100ms', '500ms' or '1000ms'
   * @param {DEPTH} params.depth The depth of the partial orderbook. 'D5', 'D10' or 'D20'
   * @param {string[]} [params.symbols] Optional. A list of symbol ids
   * @return A promise that resolves when subscribed with a list of the successfully subscribed symbols
   */
  subscribeToPartialOrderBookInBatches({
    callback,
    params: { speed, depth, ...params },
  }: {
    callback: (
      notification: { [x: string]: WSOrderBook },
      type: NOTIFICATION_TYPE
    ) => any;
    params: {
      speed: ORDER_BOOK_SPEED;
      depth: DEPTH;
      symbols?: string[];
    };
  }): Promise<string[]> {
    return this.makeSubscription({
      channel: `orderbook/${depth}/${speed}/batch`,
      callback: parseMapInterceptor(callback, parseWSOrderbook),
      params,
      withDefaultSymbols: true,
    });
  }

  /**
   * subscribe to a feed of the top of the orderbook
   *
   * subscription is for all symbols or for the specified symbols
   *
   * normal subscriptions have one update message per symbol
   *
   * https://api.exchange.cryptomkt.com/#subscribe-to-top-of-book
   *
   * @param {function} callback a function that recieves notifications as a dict of top of orderbooks indexed by symbol id, and the type of notification (only DATA)
   * @param {ORDER_BOOK_SPEED} params.speed The speed of the feed. '100ms', '500ms' or '1000ms'
   * @param {string[]} [params.symbols] Optional. A list of symbol ids
   * @return A promise that resolves when subscribed with a list of the successfully subscribed symbols
   */
  subscribeToTopOfOrderBook({
    callback,
    params: { speed, ...params },
  }: {
    callback: (
      notification: { [x: string]: OrderBookTop },
      type: NOTIFICATION_TYPE
    ) => any;
    params: {
      speed: ORDER_BOOK_SPEED;
      symbols?: string[];
    };
  }): Promise<string[]> {
    return this.makeSubscription({
      channel: `orderbook/top/${speed}`,
      callback: parseMapInterceptor(callback, parseOrderbookTop),
      params,
      withDefaultSymbols: true,
    });
  }

  /**
   * subscribe to a feed of the top of the orderbook
   *
   * subscription is for all symbols or for the specified symbols
   *
   * batch subscriptions have a joined update for all symbols
   *
   * https://api.exchange.cryptomkt.com/#subscribe-to-top-of-book-in-batches
   *
   * @param {function} callback a function that recieves notifications as a dict of top of orderbooks indexed by symbol id, and the type of notification (only DATA)
   * @param {ORDER_BOOK_SPEED} params.speed The speed of the feed. '100ms', '500ms' or '1000ms'
   * @param {string[]} [params.symbols] Optional. A list of symbol ids
   * @return A promise that resolves when subscribed with a list of the successfully subscribed symbols
   */
  subscribeToTopOfOrderBookInBatches({
    callback,
    params: { speed, ...params },
  }: {
    callback: (
      notification: { [x: string]: OrderBookTop },
      type: NOTIFICATION_TYPE
    ) => any;
    params: {
      speed: ORDER_BOOK_SPEED;
      symbols?: string[];
    };
  }): Promise<string[]> {
    return this.makeSubscription({
      channel: `orderbook/top/${speed}/batch`,
      callback: parseMapInterceptor(callback, parseOrderbookTop),
      params,
      withDefaultSymbols: true,
    });
  }

  /**
   * subscribe to a feed of price rates
   * 
   * subscription is for all currencies or for the specified currencies
   * 
   * normal subscription have one update message per currency
   * 
   * https://api.exchange.cryptomkt.com/#subscribe-to-price-rates
   * 
   * @param {function} callback recieves a feed of price rates as a map of them, indexed by currency id, and the type of notification, only DATA
   * @param {PRICE_RATE_SPEED} params.speed The speed of the feed. '1s' or '3s'
   * @param {string} params.targetCurrency quote currency of the rate
   * @param {string} params.currencies Optional. a list of base currencies to get rates. If omitted, subscribe to all currencies
   * @return A promise that resolves when subscribed with a list of the successfully subscribed currencies
   */
  subscribeToPriceRates({
    callback,
    params: { speed, ...params },
  }: {
    callback: (
      notification: { [x: string]: PriceRate },
      type: NOTIFICATION_TYPE
    ) => any;
    params: {
      speed: PRICE_RATE_SPEED;
      targetCurrency: string,
      currencies?: string[];
    };
  }): Promise<string[]> {
    return this.makeSubscription({
      channel: `price/rate/${speed}`,
      callback: parseMapInterceptor(callback, parsePriceRate),
      params,
      withDefaultCurrencies: true,
    });
  }

  /**
   * subscribe to a feed of price rates
   * 
   * subscription is for all currencies or for the specified currencies
   * 
   * batch subscriptions have a joined update for all currencies
   * 
   * https://api.exchange.cryptomkt.com/#subscribe-to-price-rates-in-batches
   * 
   * @param {function} callback recieves a feed of price rates as a map of them, indexed by currency id, and the type of notification, only DATA
   * @param {PRICE_RATE_SPEED} params.speed The speed of the feed. '1s' or '3s'
   * @param {string} params.targetCurrency quote currency of the rate
   * @param {string} params.currencies Optional. a list of base currencies to get rates. If omitted, subscribe to all currencies
   * @return A promise that resolves when subscribed with a list of the successfully subscribed currencies
   */
  subscribeToPriceRatesInBatches({
    callback,
    params: { speed, ...params },
  }: {
    callback: (
      notification: { [x: string]: PriceRate },
      type: NOTIFICATION_TYPE
    ) => any;
    params: {
      speed: PRICE_RATE_SPEED;
      targetCurrency: string,
      currencies?: string[];
    };
  }): Promise<string[]> {
    return this.makeSubscription({
      channel: `price/rate/${speed}/batch`,
      callback: parseMapInterceptor(callback, parsePriceRate),
      params,
      withDefaultCurrencies: true,
    });
  }
}
