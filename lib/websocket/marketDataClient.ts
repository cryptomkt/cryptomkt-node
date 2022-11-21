//@ts-ignore
import {
  DEPTH,
  NOTIFICATION_TYPE,
  ORDER_BOOK_SPEED,
  PERIOD,
  TICKER_SPEED,
} from "../constants";
import { CryptomarketAPIException } from "../exceptions";
import {
  Candle,
  MiniTicker,
  OrderBookTop,
  Ticker,
  Trade,
  WSOrderBook,
} from "../models";
import { WSClientBase } from "./clientBase";

/**
 * MarketDataClient connects via websocket to cryptomarket to get market information of the exchange.
 */
export class MarketDataClient extends WSClientBase {
  constructor() {
    super("wss://api.exchange.cryptomkt.com/api/3/ws/public");
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
          reject(new CryptomarketAPIException(response));
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
  }: {
    channel: string;
    callback: any;
    params: any;
    withDefaultSymbols?: boolean;
  }): Promise<string[]> {
    if (withDefaultSymbols && !params.symbols) {
      params.symbols = ["*"];
    }
    const { subscriptions } = (await this.sendChanneledSubscription({
      channel,
      callback,
      params,
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
  async subscribeToTrades({
    callback,
    params,
  }: {
    callback: (
      notification: { [x: string]: Trade[] },
      type: NOTIFICATION_TYPE
    ) => any;
    params: { symbols: string[]; limit?: number };
  }): Promise<string[]> {
    return await this.makeSubscription({
      channel: "trades",
      callback,
      params,
    });
  }

  /**
   * subscribe to a feed of candles
   *
   * subscription is for all symbols or for the specified symbols
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
   * @param {PERIOD} [params.period] Optional. A valid tick interval. 'M1' (one minute), 'M3', 'M5', 'M15', 'M30', 'H1' (one hour), 'H4', 'D1' (one day), 'D7', '1M' (one month). Default is 'M30'
   * @param {string[]} [params.symbols] Optional. A list of symbol ids
   * @param {number} params.limit Number of historical entries returned in the first feed. Min is 0. Max is 1000. Default is 0
   * @return A promise that resolves when subscribed with a list of the successfully subscribed symbols
   */
  async subscribeToCandles({
    callback,
    params: { period, ...params },
  }: {
    callback: (
      notification: { [x: string]: Candle[] },
      type: NOTIFICATION_TYPE
    ) => any;
    params: { period: PERIOD; symbols: string[]; limit?: number };
  }): Promise<string[]> {
    return await this.makeSubscription({
      channel: `candles/${period}`,
      callback,
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
  async subscribeToMiniTicker({
    callback,
    params: { speed, ...params },
  }: {
    callback: (
      notification: { [x: string]: MiniTicker[] },
      type: NOTIFICATION_TYPE
    ) => any;
    params: { speed: TICKER_SPEED; symbols?: string[] };
  }): Promise<string[]> {
    return await this.makeSubscription({
      channel: `ticker/price/${speed}`,
      callback,
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
  async subscribeToMiniTickerInBatches({
    callback,
    params: { speed, ...params },
  }: {
    callback: (
      notification: { [x: string]: MiniTicker[] },
      type: NOTIFICATION_TYPE
    ) => any;
    params: { speed: TICKER_SPEED; symbols?: string[] };
  }): Promise<string[]> {
    return await this.makeSubscription({
      channel: `ticker/price/${speed}/batch`,
      callback,
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
   * @param {string[]} [param.ssymbols] Optional. A list of symbol ids
   * @return A promise that resolves when subscribed with a list of the successfully subscribed symbols
   */
  async subscribeToTicker({
    callback,
    params: { speed, ...params },
  }: {
    callback: (
      notification: { [x: string]: Ticker[] },
      type: NOTIFICATION_TYPE
    ) => any;
    params: { speed: TICKER_SPEED; symbols?: string[] };
  }): Promise<string[]> {
    return await this.makeSubscription({
      channel: `ticker/${speed}`,
      callback,
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
  async subscribeToTickerInBatches({
    callback,
    params: { speed, ...params },
  }: {
    callback: (
      notification: { [x: string]: Ticker[] },
      type: NOTIFICATION_TYPE
    ) => any;
    params: { speed: TICKER_SPEED; symbols?: string[] };
  }): Promise<string[]> {
    return await this.makeSubscription({
      channel: `ticker/${speed}/batch`,
      callback,
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
  async subscribeToFullOrderBook({
    callback,
    params,
  }: {
    callback: (
      notification: { [x: string]: WSOrderBook[] },
      type: NOTIFICATION_TYPE
    ) => any;
    params: { symbols?: string[] };
  }): Promise<string[]> {
    return await this.makeSubscription({
      channel: "orderbook/full",
      callback,
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
  async subscribeToPartialOrderBook({
    callback,
    params: { speed, depth, ...params },
  }: {
    callback: (
      notification: { [x: string]: WSOrderBook[] },
      type: NOTIFICATION_TYPE
    ) => any;
    params: {
      speed: ORDER_BOOK_SPEED;
      depth: DEPTH;
      symbols?: string[];
    };
  }): Promise<string[]> {
    return await this.makeSubscription({
      channel: `orderbook/${depth}/${speed}`,
      callback,
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
  async subscribeToPartialOrderBookInBatches({
    callback,
    params: { speed, depth, ...params },
  }: {
    callback: (
      notification: { [x: string]: WSOrderBook[] },
      type: NOTIFICATION_TYPE
    ) => any;
    params: {
      speed: ORDER_BOOK_SPEED;
      depth: DEPTH;
      symbols?: string[];
    };
  }): Promise<string[]> {
    return await this.makeSubscription({
      channel: `orderbook/${depth}/${speed}/batch`,
      callback,
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
  async subscribeToTopOfOrderBook({
    callback,
    params: { speed, ...params },
  }: {
    callback: (
      notification: { [x: string]: OrderBookTop[] },
      type: NOTIFICATION_TYPE
    ) => any;
    params: {
      speed: ORDER_BOOK_SPEED;
      symbols?: string[];
    };
  }): Promise<string[]> {
    return await this.makeSubscription({
      channel: `orderbook/top/${speed}`,
      callback,
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
  async subscribeToTopOfOrderBookInBatches({
    callback,
    params: { speed, ...params },
  }: {
    callback: (
      notification: { [x: string]: OrderBookTop[] },
      type: NOTIFICATION_TYPE
    ) => any;
    params: {
      speed: ORDER_BOOK_SPEED;
      symbols?: string[];
    };
  }): Promise<string[]> {
    return await this.makeSubscription({
      channel: `orderbook/top/${speed}/batch`,
      callback,
      params,
      withDefaultSymbols: true,
    });
  }
}
