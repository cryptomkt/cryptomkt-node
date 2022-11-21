import assert from "assert";
import "mocha";
import { expect } from "chai";
import { WSMarketDataClient } from "../../lib";
import {
  DEPTH,
  ORDER_BOOK_SPEED,
  PERIOD,
  TICKER_SPEED,
} from "../../lib/constants";
import { SECOND, timeout } from "../test_helpers";

describe.only("websocket market data client", function () {
  let wsclient: WSMarketDataClient;

  beforeEach(() => {
    wsclient = new WSMarketDataClient();
  });

  afterEach(() => {
    wsclient.close();
  });

  describe("subscribe to trades", function () {
    it("should succeed", async function () {
      this.timeout(0);
      await wsclient.connect();
      try {
        const symbols = await wsclient.subscribeToTrades({
          params: {
            symbols: ["ETHBTC"],
            limit: 4,
          },
          callback: (trades, type): void => {
            console.log(type);
            for (const symbol in trades) {
              console.log("");
              console.log(symbol);
              console.log(trades[symbol]);
            }
          },
        });
        expect(symbols.length).equal(1);
        await timeout(45 * SECOND);
      } catch (err) {
        assert.fail("should not fail: " + err);
      }
    });
  });

  describe("subscribe to candles", function () {
    it("should succeed", async function () {
      this.timeout(0);
      await wsclient.connect();
      try {
        await wsclient.subscribeToCandles({
          callback: (candles, type) => {
            for (const symbol in candles) {
              console.log(symbol);
              console.log(candles[symbol]);
            }
          },
          params: {
            period: PERIOD._1_MINUTE,
            symbols: ["EOSETH", "ETHBTC"],
            limit: 3,
          },
        });
        await timeout(3 * SECOND);
      } catch (e) {
        assert.fail("should not fail: " + e);
      }
    });
  });

  describe("subscribe to mini ticker", function () {
    it("should succeed", async function () {
      this.timeout(0);
      await wsclient.connect();
      try {
        await wsclient.subscribeToMiniTicker({
          callback: (miniTickers, type) => {
            for (const symbol in miniTickers) {
              console.log(symbol);
              console.log(miniTickers[symbol]);
            }
          },
          params: {
            speed: TICKER_SPEED._1_S,
            symbols: ["EOSETH", "ETHBTC"],
          },
        });
        await timeout(3 * SECOND);
      } catch (e) {
        assert.fail("should not fail: " + e);
      }
    });
  });

  describe("subscribe to ticker", function () {
    it("should succeed", async function () {
      this.timeout(0);
      await wsclient.connect();
      try {
        await wsclient.subscribeToTicker({
          callback: (tickers, type) => {
            for (const symbol in tickers) {
              console.log(symbol);
              console.log(tickers[symbol]);
            }
          },
          params: {
            speed: TICKER_SPEED._1_S,
            symbols: ["EOSETH", "ETHBTC"],
          },
        });
        await timeout(3 * SECOND);
      } catch (e) {
        assert.fail("should not fail: " + e);
      }
    });
  });

  describe("subscribe to full orderbook", function () {
    it("should succeed", async function () {
      this.timeout(0);
      await wsclient.connect();
      try {
        await wsclient.subscribeToFullOrderBook({
          callback: (orderBooks, type) => {
            for (const symbol in orderBooks) {
              console.log(symbol);
              console.log(orderBooks[symbol]);
            }
          },
          params: {
            symbols: ["EOSETH", "ETHBTC"],
          },
        });
        await timeout(3 * SECOND);
      } catch (e) {
        assert.fail("should not fail: " + e);
      }
    });
  });

  describe("subscribe to partial orderbook", function () {
    it("should succeed", async function () {
      this.timeout(0);
      await wsclient.connect();
      try {
        await wsclient.subscribeToPartialOrderBook({
          callback: (orderBooks) => {
            for (const symbol in orderBooks) {
              console.log(symbol);
              console.log(orderBooks[symbol]);
            }
          },
          params: {
            speed: ORDER_BOOK_SPEED._100_MS,
            depth: DEPTH._5,
            symbols: ["EOSETH", "ETHBTC"],
          },
        });
        await timeout(3 * SECOND);
      } catch (e) {
        assert.fail("should not fail: " + e);
      }
    });
  });

  describe("subscribe to top of orderbook", function () {
    it("should succeed", async function () {
      this.timeout(0);
      await wsclient.connect();
      try {
        await wsclient.subscribeToTopOfOrderBook({
          callback: (orderBookTops) => {
            for (const symbol in orderBookTops) {
              console.log(symbol);
              console.log(orderBookTops[symbol]);
            }
          },
          params: {
            speed: ORDER_BOOK_SPEED._100_MS,
            symbols: ["EOSETH", "ETHBTC"],
          },
        });
        await timeout(3 * SECOND);
      } catch (e) {
        assert.fail("should not fail: " + e);
      }
    });
  });

  describe("multiple subscriptions", function () {
    it("override on second call on same channel", async function () {
      this.timeout(0);
      await wsclient.connect();
      const first_set = [
        "ALGOUSDT",
        "ETHARS",
        "USDTTUSD",
        "ETHTUSD",
        "THETAUSDT",
        "ATOMBTC",
        "NEOETH",
        "AAVEUSDT",
      ];
      const second_set = [
        "YFIBTC",
        "ETHUSDC",
        "SOLETH",
        "UNIBTC",
        "SOLUST",
        "BUSDUSDT",
        "XRPEURS",
        "EURSDAI",
        "BTCEURS",
        "LUNAUSDT",
        "MKRETH",
      ];
      wsclient.subscribeToTicker({
        callback: () => console.log("first callbackk"),
        params: { speed: TICKER_SPEED._1_S, symbols: first_set },
      });
      wsclient.subscribeToTicker({
        callback: () => console.log("second callback"),
        params: { speed: TICKER_SPEED._1_S, symbols: second_set },
      });
      await timeout(20 * SECOND);
    });
  });
});
