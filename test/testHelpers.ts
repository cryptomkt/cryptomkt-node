import { Fee, Report } from "../lib/models";

export const timeout = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
export const SECOND = 1000;

// defined checks if a key is present in a dict, and if its value is str, checks if its defined.
// return false when the key is not present or when the value is an empty string, return true otherwise.
export function defined(anObject: { [x: string]: any }, key: string) {
  if (!(key in anObject)) return false;
  const val = anObject[key];
  if ((typeof val === "string" || val instanceof String) && val === "")
    return false;
  return true;
}

// goodObject checks all of the values in the fields list to be present in the dict, and if they are
// present, check the defined() condition to be true. if any of the fields fails to be defined(), then
// this function returns false
export function goodObject(anObject: any, fields: string[]) {
  if (!anObject) return false;
  if (!(typeof anObject === "object" || anObject instanceof Object))
    return false;
  for (const field of fields) {
    if (!defined(anObject, field)) return false;
  }
  return true;
}

export function emptyList(list: any[]) {
  return list.length == 0;
}

export function listSize(list: string | any[], size: any) {
  return list.length == size;
}

export function goodList(
  checkFn: { (trade: any): boolean; (arg0: any): any },
  list: any
) {
  for (const elem of list) {
    if (!checkFn(elem)) return false;
  }
  return true;
}

export function emptyDict(dict: {}) {
  return Object.keys(dict).length == 0;
}

export function dictSize(dict: {}, size: number) {
  return Object.keys(dict).length == size;
}

export function goodDict(checkFn: (arg0: any) => any, dict: { [x: string]: any }) {
  for (const key in dict) {
    if (!checkFn(dict[key])) return false;
  }
  return true;
}

// goodCurrency checks the precence of every field in the currency dict
export function goodCurrency(currency: { [x: string]: any }) {
  let good = goodObject(currency, [
    "fullName",
    "payinEnabled",
    "payoutEnabled",
    "transferEnabled",
    "precisionTransfer",
    "networks",
  ]);
  if (!good) {
    return false;
  }
  for (const network of currency["networks"]) {
    if (!goodNetwork(network)) {
      return false;
    }
  }
  return true;
}

export function goodNetwork(network: any) {
  return goodObject(network, [
    "network",
    "default",
    "payinEnabled",
    "payoutEnabled",
    "precisionPayout",
    "payoutFee",
    "payoutIsPaymentId",
    "payinPaymentId",
    "payinConfirmations",
  ]);
}
// goodSymbol check the precence of every field in the symbol dict
export function goodSymbol(symbol: any) {
  return goodObject(symbol, [
    "type",
    "baseCurrency",
    "quoteCurrency",
    "status",
    "quantityIncrement",
    "tickSize",
    "takeRate",
    "makeRate",
    "feeCurrency",
    // "marginTrading",
    // "maxInitialLeverage",
  ]);
}

// goodTicker check the precence of every field in the ticker dict
export function goodTicker(ticker: any) {
  return goodObject(ticker, [
    "ask",
    "bid",
    "last",
    "low",
    "high",
    "open",
    "volume",
    "volumeQuote",
    "timestamp",
  ]);
}

export function goodPrice(price: any) {
  return goodObject(price, ["currency", "price", "timestamp"]);
}

export function goodTickerPrice(price: any) {
  return goodObject(price, ["price", "timestamp"]);
}

export function goodPriceHistory(priceHistory: { [x: string]: any }) {
  let good = goodObject(priceHistory, ["currency", "history"]);
  if (!good) return false;
  for (const point of priceHistory["history"]) {
    if (!goodHistoryPoint(point)) return false;
  }
  return true;
}

export function goodHistoryPoint(point: any) {
  return goodObject(point, ["timestamp", "open", "close", "min", "max"]);
}

// goodPublicTrade check the precence of every field in the trade dict
export function goodPublicTrade(trade: any) {
  return goodObject(trade, ["id", "price", "qty", "side", "timestamp"]);
}

// goodPublicTrade check the precence of every field in the trade dict
export function goodWSTrade(trade: any) {
  return goodObject(trade, ["timestamp", "id", "price", "quantity", "side"]);
}

// goodPublicTrade check the precence of every field in the trade dict
export function goodWSCandle(candle: any) {
  return goodObject(candle, ["timestamp", "openPrice", "closePrice", "highPrice", "lowPrice", "baseVolume", "quoteVolume"]);
}


// goodPublicTrade check the precence of every field in the trade dict
export function goodWSTicker(ticker: any) {
  return goodObject(ticker, [
    "timestamp",
    "bestAsk",
    "bestAskQuantity",
    "bestBid",
    "bestBidQuantity",
    "closePrice",
    "openPrice",
    "highPrice",
    "lowPrice",
    "baseVolume",
    "quoteVolume",
    "priceChange",
    "PriceChangePercent",
    "lastTradeId"]);
}


export function goodWSOrderbook(orderbook: any) {
  const goodOrderbook = goodObject(orderbook, [
    "timestamp",
    "sequence",
    "asks",
    "bids"]);
  if (!goodOrderbook) return false;

  for (const level of orderbook["asks"]) {
    if (!goodOrderbookLevel(level)) return false;
  }
  for (const level of orderbook["bids"]) {
    if (!goodOrderbookLevel(level)) return false;
  }
  return true;
}
// goodPublicTrade check the precence of every field in the trade dict
export function goodWSOrderbookTop(orderbookTop: any) {
  return goodObject(orderbookTop, [
    "timestamp",
    "bestAsk",
    "bestAskQuantity",
    "bestBid",
    "bestBidQuantity",]);
}


// goodOrderbookLevel check the precence of every field in the level dict
export function goodOrderbookLevel(level: string | any[]) {
  return level.length == 2;
}

// goodOrderbook check the precence of every field in the orderbook dict
// and the fields of each level in each side of the orderbook
export function goodOrderbook(orderbook: { [x: string]: any }) {
  const goodOrderbook = goodObject(orderbook, ["timestamp", "ask", "bid"]);
  if (!goodOrderbook) return false;

  for (const level of orderbook["ask"]) {
    if (!goodOrderbookLevel(level)) return false;
  }
  for (const level of orderbook["bid"]) {
    if (!goodOrderbookLevel(level)) return false;
  }
  return true;
}

// goodCandle check the precence of every field in the candle dict
export function goodCandle(candle: any) {
  return goodObject(candle, [
    "timestamp",
    "open",
    "close",
    "min",
    "max",
    "volume",
    "volumeQuote",
  ]);
}

// goodBalance check the precence of every field on every balance dict
export function goodBalance(balance: any) {
  return goodObject(balance, [
    "currency",
    "available",
    "reserved",
    // "reservedMargin" optional.
  ]);
}

// goodOrder check the precence of every field in the order dict
export function goodOrder(order: { [x: string]: any }) {
  let good = goodObject(order, [
    "id",
    "clientOrderId",
    "symbol",
    "side",
    "status",
    "type",
    "timeInForce",
    "quantity",
    "quantityCumulative",
    // "price", // optional
    // "stotPrice",  // optional
    // "expireTime", // optional
    // "originalClientOrderId", // optional
    "createdAt",
    "updatedAt",
    // "trades", // optional. List of trades
  ]);
  if (!good) return false;
  if ("trades" in order) {
    return goodList(goodTradeOfOrder, order["trades"]);
  }
  return true;
}

// goodTradeOfOrder checks orders that are part of an order model.
export function goodTradeOfOrder(trade: any) {
  return goodObject(trade, [
    "id",
    "quantity",
    "price",
    "fee",
    "timestamp",
    "taker",
  ]);
}

// goodTrade check the precence of every field in the trade dict. trades of this type are present in trade history.
export function goodTrade(trade: any) {
  return goodObject(trade, [
    "id",
    "orderId",
    "clientOrderId",
    "symbol",
    "side",
    "quantity",
    "price",
    "fee",
    "timestamp",
    "taker",
  ]);
}

export function goodTradingCommission(transaction: any) {
  return goodObject(transaction, ["symbol", "takeRate", "makeRate"]);
}

// goodTransaction check the precence of every field in the transaction dict
export function goodAddress(transaction: any) {
  return goodObject(transaction, [
    "currency",
    "address",
    // "paymentId", // optional
    // "publicKey", // optional
  ]);
}

export function goodFee(fee: Fee) {
  return goodObject(fee, [
    "fee",
    // "networkFee", // Optional
    "amount",
    "currency"
  ]);
}

// goodTransaction check the precence of every field in the transaction dict
export function goodTransaction(transaction: { native: any }) {
  let good = goodObject(transaction, [
    "id",
    "status",
    "type",
    "subtype",
    "createdAt",
    "updatedAt",
    // "native", // optional
    // "primetrust", // optional
    // "meta" // optional
  ]);
  if (!good) return false;
  if ("native" in transaction && !goodNativeTransaction(transaction.native)) {
    return false;
  }
  // if ("meta" in transaction && !goodMetaTransaction(transaction.native)) {
  //   return false;
  // }
  return true;
}

export function goodNativeTransaction(transaction: any) {
  return goodObject(transaction, [
    "txId",
    "index",
    "currency",
    "amount",
    // "fee", // optional
    // "address", // optional
    // "paymentId", // optional
    // "hash", // optional
    // "offchainId", // optional
    // "confirmations", // optional
    // "publicComment", // optional
    // "errorCode", // optional
    // "senders" // optional
  ]);
}

export function goodMetaTransaction(transaction: any) {
  return goodObject(transaction, [
    "fiatToCrypto",
    "id",
    "providerName",
    "orderType",
    "orderType",
    "sourceCurrency",
    "targetCurrency",
    "walletAddress",
    "txHash",
    "targetAmount",
    "sourceAmount",
    "status",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "paymentMethodType",
  ]);
}

export function goodReport(report: Report) {
  return goodObject(report, [
    "id",
    "clientOrderId",
    "symbol",
    "side",
    "status",
    "type",
    "timeInForce",
    "quantity",
    "quantityCumulative",
    "price",
    "postOnly",
    "createdAt",
    "updatedAt",
    // "reportType", not present in order list reports
  ]);
}

export function goodAmountLock(report: any) {
  return goodObject(report, [
    "id",
    "currency",
    "amount",
    "dateEnd",
    "description",
    "cancelled",
    "cancelledAt",
    "cancelDescription",
    "createdAt",
  ]);
}


export function goodPriceRate(report: any) {
  return goodObject(report, [
    "timestamp",
    "rate"
  ]);
}
