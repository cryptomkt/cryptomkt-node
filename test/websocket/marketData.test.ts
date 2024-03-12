import { expect } from "chai";
import "mocha";
import { WSMarketDataClient } from "../../lib";
import {
  DEPTH,
  ORDER_BOOK_SPEED,
  PERIOD,
  PRICE_RATE_SPEED,
  TICKER_SPEED,
} from "../../lib/constants";
import { SECOND, goodPriceRate, goodWSCandle, goodWSOrderbook, goodWSOrderbookTop, goodWSTicker, goodWSTrade, timeout } from "../testHelpers";

describe("websocket market data client", function () {
  let wsclient: WSMarketDataClient;

  beforeEach(() => {
    wsclient = new WSMarketDataClient(10_000);
  });

  afterEach(() => {
    wsclient.close();
  });

  describe("subscribe to trades", function () {
    it("gets a feed of trades", async function () {
      this.timeout(0);
      await wsclient.connect();
      const symbols = await wsclient.subscribeToTrades({
        params: {
          symbols: ["ETHBTC"],
          limit: 4,
        },
        callback: checkGoodMapListValues(goodWSTrade),
      });
      expect(symbols.length).equal(1);
      await timeout(45 * SECOND);
    });
  });

  describe("subscribe to candles", function () {
    it("gets a feed of candles", async function () {
      this.timeout(0);
      await wsclient.connect();
      await wsclient.subscribeToCandles({
        callback: checkGoodMapListValues(goodWSCandle),
        params: {
          period: PERIOD._1_MINUTE,
          symbols: ["EOSETH", "ETHBTC"],
          limit: 3,
        },
      });
      await timeout(3 * SECOND);
    });
  });


  describe("subscribe to converted candles", function () {
    it("gets a feed of candles", async function () {
      this.timeout(0);
      await wsclient.connect();
      await wsclient.subscribeToConvertedCandles({
        callback: checkGoodMapListValues(goodWSCandle),
        params: {
          period: PERIOD._1_MINUTE,
          targetCurrency: "BTC",
          symbols: ["EOSETH", "ETHBTC"],
          limit: 3,
        },
      });
      await timeout(3 * SECOND);
    });
  });

  describe("subscribe to mini ticker", function () {
    it("gets a feed of mini tickers (with are candles)", async function () {
      this.timeout(0);
      await wsclient.connect();
      await wsclient.subscribeToMiniTicker({
        callback: checkGoodMapValues(goodWSCandle),
        params: {
          speed: TICKER_SPEED._1_S,
          symbols: ["EOSETH", "ETHBTC"],
        },
      });
      await timeout(3 * SECOND);
    });
  });

  describe("subscribe to ticker", function () {
    it("gets a feed of tickers", async function () {
      this.timeout(0);
      await wsclient.connect();
      await wsclient.subscribeToTicker({
        callback: checkGoodMapValues(goodWSTicker),
        params: {
          speed: TICKER_SPEED._1_S,
          symbols: ["EOSETH", "ETHBTC"],
        },
      });
      await timeout(3 * SECOND);
    });
  });

  describe("subscribe to full orderbook", function () {
    it("should succeed", async function () {
      this.timeout(0);
      await wsclient.connect();
      await wsclient.subscribeToFullOrderBook({
        callback: checkGoodMapValues(goodWSOrderbook),
        params: {
          symbols: ["EOSETH", "ETHBTC"],
        },
      });
      await timeout(3 * SECOND);
    });
  });

  describe("subscribe to partial orderbook", function () {
    it("should succeed", async function () {
      this.timeout(0);
      await wsclient.connect();
      await wsclient.subscribeToPartialOrderBook({
        callback: checkGoodMapValues(goodWSOrderbook),
        params: {
          speed: ORDER_BOOK_SPEED._100_MS,
          depth: DEPTH._5,
          symbols: ["EOSETH", "ETHBTC"],
        },
      });
      await timeout(3 * SECOND);
    });
  });

  describe("subscribe to top of orderbook", function () {
    it("should succeed", async function () {
      // TODO: unknown state
      this.timeout(0);
      await wsclient.connect();
      await wsclient.subscribeToTopOfOrderBook({
        callback: checkGoodMapValues(goodWSOrderbookTop),
        params: {
          speed: ORDER_BOOK_SPEED._100_MS,
          symbols: ["EOSETH", "ETHBTC"],
        },
      });
      await timeout(3 * SECOND);
    });
  });
  describe("subscribe to price rates", function () {
    it("should succeed", async function () {
      this.timeout(0);
      await wsclient.connect();
      await wsclient.subscribeToPriceRates({
        callback: checkGoodMapValues(goodPriceRate),
        params: {
          speed: PRICE_RATE_SPEED._3_S,
          targetCurrency: "BTC",
          currencies: ["EOS", "ETH", "CRO"],
        },
      });
      await timeout(3 * SECOND);
    });
  });
  describe("subscribe to price rates in batches", function () {
    it("gets a feed of price rates", async function () {
      this.timeout(0);
      await wsclient.connect();
      await wsclient.subscribeToPriceRatesInBatches({
        callback: checkGoodMapValues(goodPriceRate),
        params: {
          speed: PRICE_RATE_SPEED._3_S,
          targetCurrency: "BTC",
          currencies: ["EOS", "ETH", "CRO"],
        },
      });
      await timeout(3 * SECOND);
    });
  });

  function checkGoodMapListValues<T>(checkFn: (valueToCheck: T) => Boolean): (notification: { [x: string]: T[]; }, type: any) => any {
    return (entries, _) => {
      for (let key in entries) {
        const allGood = entries[key].map(checkFn).every(Boolean)
        expect(allGood).to.be.true;
      }
    };
  }
  function checkGoodMapValues<T>(checkFn: (valueToCheck: T) => Boolean): (notification: { [x: string]: T; }, type: any) => any {
    return (entries, _) => {
      for (let key in entries) {
        expect(checkFn(entries[key])).to.be.true;
      }
    };
  }
});
