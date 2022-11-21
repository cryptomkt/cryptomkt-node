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
    "full_name",
    "payin_enabled",
    "payout_enabled",
    "transfer_enabled",
    "precision_transfer",
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
    "payin_enabled",
    "payout_enabled",
    "precision_payout",
    "payout_fee",
    "payout_is_payment_id",
    "payin_payment_id",
    "payin_confirmations",
  ]);
}
// goodSymbol check the precence of every field in the symbol dict
export function goodSymbol(symbol: any) {
  return goodObject(symbol, [
    "type",
    "base_currency",
    "quote_currency",
    "status",
    "quantity_increment",
    "tick_size",
    "take_rate",
    "make_rate",
    "fee_currency",
    // "margin_trading",
    // "max_initial_leverage",
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
    "volume_quote",
    "timestamp",
  ]);
}

export function goodPrice(price: any) {
  return goodObject(price, ["currency", "price", "timestamp"]);
}

export function goodTickerPrice(price: any) {
  return goodObject(price, ["price", "timestamp"]);
}

export function goodPriceHistory(price_history: { [x: string]: any }) {
  let good = goodObject(price_history, ["currency", "history"]);
  if (!good) return false;
  for (const point of price_history["history"]) {
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
    "volume_quote",
  ]);
}

// goodBalance check the precence of every field on every balance dict
export function goodBalance(balance: any) {
  return goodObject(balance, [
    "currency",
    "available",
    "reserved",
    // "reserved_margin" optional.
  ]);
}

// goodOrder check the precence of every field in the order dict
export function goodOrder(order: { [x: string]: any }) {
  let good = goodObject(order, [
    "id",
    "client_order_id",
    "symbol",
    "side",
    "status",
    "type",
    "time_in_force",
    "quantity",
    "quantity_cumulative",
    // "price", // optional
    // "stop_price",  // optional
    // "expire_time", // optional
    // "original_client_order_id", // optional
    "created_at",
    "updated_at",
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
    "order_id",
    "client_order_id",
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
  return goodObject(transaction, ["symbol", "take_rate", "make_rate"]);
}

// goodTransaction check the precence of every field in the transaction dict
export function goodAddress(transaction: any) {
  return goodObject(transaction, [
    "currency",
    "address",
    // "payment_id", // optional
    // "public_key", // optional
  ]);
}

// goodTransaction check the precence of every field in the transaction dict
export function goodTransaction(transaction: { native: any }) {
  let good = goodObject(transaction, [
    "id",
    "status",
    "type",
    "subtype",
    "created_at",
    "updated_at",
    // "native", // optional
    // "primetrust", // optional
    // "meta" // optional
  ]);
  if (!good) return false;
  if ("native" in transaction && !goodNativeTransaction(transaction.native)) {
    return false;
  }
  if ("meta" in transaction && !goodMetaTransaction(transaction.native)) {
    return false;
  }
  return true;
}

export function goodNativeTransaction(transaction: any) {
  return goodObject(transaction, [
    "tx_id",
    "index",
    "currency",
    "amount",
    // "fee", // optional
    // "address", // optional
    // "payment_id", // optional
    // "hash", // optional
    // "offchain_id", // optional
    // "confirmations", // optional
    // "public_comment", // optional
    // "error_code", // optional
    // "senders" // optional
  ]);
}

export function goodMetaTransaction(transaction: any) {
  return goodObject(transaction, [
    "fiat_to_crypto",
    "id",
    "provider_name",
    "order_type",
    "order_type",
    "source_currency",
    "target_currency",
    "wallet_address",
    "tx_hash",
    "target_amount",
    "source_amount",
    "status",
    "created_at",
    "updated_at",
    "deleted_at",
    "payment_method_type",
  ]);
}

export function goodReport(report: any) {
  return goodObject(report, [
    "id",
    "clientOrderId",
    "symbol",
    "side",
    "status",
    "type",
    "timeInForce",
    "quantity",
    "price",
    "cumQuantity",
    // "postOnly", // does not appears in the orders in orders history
    "createdAt",
    "updatedAt",
    "reportType",
  ]);
}

export function goodAmountLock(report: any) {
  return goodObject(report, [
    "id",
    "currency",
    "amount",
    "date_end",
    "description",
    "cancelled",
    "cancelled_at",
    "cancel_description",
    "created_at",
  ]);
}