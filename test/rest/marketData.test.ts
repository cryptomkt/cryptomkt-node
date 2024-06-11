import assert from "assert";
import { expect } from "chai";
import "mocha";
import { Client } from "../../lib";
import { PERIOD } from "../../lib/constants";
import {
  dictSize,
  emptyDict,
  emptyList,
  goodCandle,
  goodCurrency,
  goodDict,
  goodList,
  goodOrderbook,
  goodPrice,
  goodPriceHistory,
  goodPublicTrade,
  goodSymbol,
  goodTicker,
  goodTickerPrice,
  listSize,
} from "../testHelpers";

describe("Rest client test", () => {
  let client = new Client("", "");
  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  const second = 1000;
  beforeEach(async function () {
    await sleep(second / 20); // make around 20 calls per second at most, to not pass the rate limiting of 30 calls per second, by a big margin.
  });
  describe.only("Get Currencies", () => {
    it("All currencies", async function () {
      this.timeout(0);
      let currencies = await client.getCurrencies();
      assert(!emptyDict(currencies), "empty currency dict");
      assert(goodDict(goodCurrency, currencies), "not good currencies");
    });
    it("two currencies", async function () {
      this.timeout(0);
      let currencies = await client.getCurrencies(["eos", "BTC"]);
      assert(dictSize(currencies, 2), "wrong number of currencies");
      assert(goodDict(goodCurrency, currencies), "not good currencies");
    });
  });
  describe("Get Symbol", () => {
    it("", async function () {
      this.timeout(0);
      let symbol = await client.getSymbol("ETHBTC");
      assert(goodSymbol(symbol), "not a good symbol");
    });
  });
  describe("Get Symbols", () => {
    it("All symbols", async function () {
      this.timeout(0);
      let symbols = await client.getSymbols();
      assert(!emptyDict(symbols), "empty dict of symbols");
      assert(goodDict(goodSymbol, symbols), "not good symbols");
    });
    it("two symbols", async function () {
      this.timeout(0);
      let symbols = await client.getSymbols(["EOSETH", "PAXGBTC"]);
      assert(dictSize(symbols, 2), "wrong number of symbols");
      assert(goodDict(goodSymbol, symbols), "not good symbols");
    });
  });
  describe("Get Tickers", () => {
    it("All tickers", async function () {
      this.timeout(0);
      let tickers = await client.getTickers();
      assert(!emptyDict(tickers), "empty dict of tickers");
      assert(goodDict(goodTicker, tickers), "not good tickers");
    });
    it("A dict with two tickers", async function () {
      this.timeout(0);
      let tickers = await client.getTickers(["EOSETH", "PAXGBTC"]);
      assert(dictSize(tickers, 2), "wrong number of tickers");
      assert(goodDict(goodTicker, tickers), "not good tickers");
    });
  });
  describe("Get Ticker", () => {
    it("", async function () {
      this.timeout(0);
      let ticker = await client.getTicker("EOSETH");
      assert(goodTicker(ticker), "not good ticker");
    });
  });
  describe("Get Prices", () => {
    it("for all currencies as origin", async function () {
      this.timeout(0);
      let prices = await client.getPrices({
        to: "XLM",
      });
      assert(!dictSize(prices, 1), "wrong number of prices");
      assert(goodDict(goodPrice, prices), "not good prices");
    });
    it("for one currency pair", async function () {
      this.timeout(0);
      let prices = await client.getPrices({
        to: "XLM",
        from: "CRO",
      });
      assert(dictSize(prices, 1), "wrong number of prices");
      assert(goodDict(goodPrice, prices), "not good prices");
    });
  });
  describe("Get Prices History", () => {
    it("for all currencies as origin", async function () {
      this.timeout(0);
      let pricesHistory = await client.getPriceHistory({
        to: "ETH",
        period: PERIOD._15_MINUTES,
      });
      assert(!dictSize(pricesHistory, 1), "wrong number of prices histories");
      assert(
        goodDict(goodPriceHistory, pricesHistory),
        "not good price history"
      );
    });
    it("for one currency pair", async function () {
      this.timeout(0);
      let pricesHistory = await client.getPriceHistory({
        to: "ETH",
        from: "BTC",
        period: PERIOD._15_MINUTES,
      });
      assert(dictSize(pricesHistory, 1), "wrong number of prices histories");
      assert(
        goodDict(goodPriceHistory, pricesHistory),
        "not good price history"
      );
    });
  });
  describe("Get Ticker Prices", () => {
    it("for all symbols", async function () {
      this.timeout(0);
      let prices = await client.getTickerLastPrices();
      assert(!emptyDict(prices), "wrong number of ticker prices");
      assert(goodDict(goodTickerPrice, prices), "not good ticker prices");
    });
    it("for two symbols", async function () {
      this.timeout(0);
      let prices = await client.getTickerLastPrices(["EOSETH", "XLMETH"]);
      assert(dictSize(prices, 2), "wrong number of ticker prices");
      assert(goodDict(goodTickerPrice, prices), "not good ticker prices");
    });
  });
  describe("Get Ticker Price Of Symbol", () => {
    it("", async function () {
      this.timeout(0);
      let price = await client.getTickerLastPrice("EOSETH");
      assert(goodTickerPrice(price), "not a good ticker price");
    });
  });
  describe("Get Trades", () => {
    it("for all symbols", async function () {
      this.timeout(0);
      let trades = await client.getTrades();
      assert(!emptyDict(trades), "empty dict of trades");
      assert(
        goodDict((trade) => goodList(goodPublicTrade, trade), trades),
        "not good trades"
      );
    });
    it("for two symbols", async function () {
      this.timeout(0);
      let trades = await client.getTrades({
        symbols: ["EOSETH", "PAXGBTC"],
        limit: 2,
      });
      assert(dictSize(trades, 2), "wrong number of trades");
      assert(
        goodDict((trade) => goodList(goodPublicTrade, trade), trades),
        "not good trades"
      );
    });
  });
  describe("Get Trades of symbol", () => {
    it("", async function () {
      this.timeout(0);
      let trades = await client.getTradesBySymbol("EOSETH");
      assert(!emptyList(trades), "empty dict of trades");
      assert(goodList(goodPublicTrade, trades), "not good trades");
    });
  });
  describe("Get order books", () => {
    it("for all symbols", async function () {
      this.timeout(0);
      let orderBooks = await client.getOrderBooks();
      assert(!emptyDict(orderBooks), "empty dict of order books");
      assert(goodDict(goodOrderbook, orderBooks), "not good orderbooks");
    });
    it("for 2 symbols", async function () {
      this.timeout(0);
      let orderBooks = await client.getOrderBooks({
        symbols: ["EOSETH", "PAXGBTC"],
      });
      expect(Object.keys(orderBooks).length).to.equal(2);
    });
  });
  describe("Get Order book of symbol", () => {
    it("", async function () {
      this.timeout(0);
      let orderBook = await client.getOrderBook("EOSETH");
      assert(goodOrderbook(orderBook), "not good orderbook");
    });
  });
  describe("Get Order book of symbol, with volume", () => {
    it("", async function () {
      this.timeout(0);
      let orderBook = await client.getOrderBookVolume({
        symbol: "EOSETH",
        volume: 1000,
      });
      assert(goodOrderbook(orderBook), "not good orderbook");
    });
  });
  describe("Get candles", () => {
    it("for all symbols", async function () {
      this.timeout(0);
      let candles = await client.getCandles();
      assert(!emptyDict(candles), "empty list of candles");
      assert(
        goodDict((candleList) => goodList(goodCandle, candleList), candles),
        "not good candles"
      );
    });
    it("for 2 symbols", async function () {
      this.timeout(0);
      let candles = await client.getCandles({
        symbols: ["EOSETH", "PAXGBTC"],
        period: PERIOD._1_HOUR,
        limit: 2,
      });
      assert(dictSize(candles, 2), "wrong number of symbols");
      assert(
        goodDict((candleList) => goodList(goodCandle, candleList), candles),
        "not good candles"
      );
    });
  });
  describe("Get candles Of Symbol", () => {
    it("with period and limit", async function () {
      this.timeout(0);
      let candles = await client.getCandlesBySymbol("ADAETH", {
        period: PERIOD._30_MINUTES,
        limit: 2,
      });
      assert(listSize(candles, 2), "wrong number of candles");
      assert(goodList(goodCandle, candles), "not good candles");
    });
  });
  describe("Get Converted candles", () => {
    it("for all symbols", async function () {
      this.timeout(0);
      let candles = await client.getConvertedCandles({ targetCurrency: "ETH" });
      assert(!emptyDict(candles), "empty list of candles");
      assert(
        goodDict((candleList) => goodList(goodCandle, candleList), candles.data),
        "not good candles"
      );
    });
    it("for 2 symbols", async function () {
      this.timeout(0);
      let candles = await client.getConvertedCandles({
        targetCurrency: "ETH",
        symbols: ["EOSETH", "PAXGBTC"],
        period: PERIOD._1_HOUR,
        limit: 2,
      });
      assert(dictSize(candles, 2), "wrong number of symbols");
      assert(
        goodDict((candleList) => goodList(goodCandle, candleList), candles.data),
        "not good candles"
      );
    });
  });
  describe("Get converted candles Of Symbol", () => {
    it("with period and limit", async function () {
      this.timeout(0);
      let candles = await client.getConvertedCandlesBySymbol("ADAETH", {
        targetCurrency: "BTC",
        period: PERIOD._30_MINUTES,
        limit: 2,
      });
      assert(listSize(candles.data, 2), "wrong number of candles");
      assert(goodList(goodCandle, candles.data), "not good candles");
    });
  });
});

