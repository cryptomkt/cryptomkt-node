import { NOTIFICATION_TYPE } from "../constants";
import { OrderBookTop, OrderBookTopRaw, PriceRate, PriceRateRaw, WSCandle, WSCandleRaw, WSOrderBook, WSOrderBookRaw, WSTicker, WSTickerRaw, WSTrade, WSTradeRaw } from "../models";

type JsonObject<T> = { [x: string]: T };
type MapNotificationCallback<T> = (notification: JsonObject<T>, notificationType: NOTIFICATION_TYPE) => any;
type ParseFn<TRaw, T> = (raw: TRaw) => T

export const parseMapListInterceptor = <TRaw, T>(
  callback: MapNotificationCallback<T[]>, parseFn: ParseFn<TRaw, T>) => (
    notification: JsonObject<TRaw[]>, notificationType: NOTIFICATION_TYPE) => {
    const parsedEntries = Object.entries(notification).map(([key, rawValueList]) => [key, rawValueList.map(parseFn)])
    const parsedNotification = Object.fromEntries(parsedEntries)
    return callback(parsedNotification, notificationType)
  }

export const parseMapInterceptor = <TRaw, T>(
  callback: MapNotificationCallback<T>, parseFn: ParseFn<TRaw, T>) => (
    notification: JsonObject<TRaw>, notificationType: NOTIFICATION_TYPE) => {
    const parsedEntries = Object.entries(notification).map(([key, rawValue]) => [key, parseFn(rawValue)])
    const parsedNotification = Object.fromEntries(parsedEntries)
    return callback(parsedNotification, notificationType)
  }


export const parseWSTrade = (wsTradeRaw: WSTradeRaw): WSTrade => {
  return {
    timestamp: wsTradeRaw.t,
    id: wsTradeRaw.i,
    price: wsTradeRaw.p,
    quantity: wsTradeRaw.q,
    side: wsTradeRaw.s,
  }
}

export const parseWSCandle = (wsCandleRaw: WSCandleRaw): WSCandle => {
  return {
    timestamp: wsCandleRaw.t,
    openPrice: wsCandleRaw.o,
    closePrice: wsCandleRaw.c,
    highPrice: wsCandleRaw.h,
    lowPrice: wsCandleRaw.l,
    baseVolume: wsCandleRaw.v,
    quoteVolume: wsCandleRaw.q,
  }
}


export const parseWSTicker = (wsTickerRaw: WSTickerRaw): WSTicker => {
  return {
    timestamp: wsTickerRaw.t,
    bestAsk: wsTickerRaw.a,
    bestAskQuantity: wsTickerRaw.A,
    bestBid: wsTickerRaw.b,
    bestBidQuantity: wsTickerRaw.B,
    closePrice: wsTickerRaw.c,
    openPrice: wsTickerRaw.o,
    highPrice: wsTickerRaw.h,
    lowPrice: wsTickerRaw.l,
    baseVolume: wsTickerRaw.v,
    quoteVolume: wsTickerRaw.q,
    priceChange: wsTickerRaw.p,
    PriceChangePercent: wsTickerRaw.P,
    lastTradeId: wsTickerRaw.L,
  }
}


export const parseWSOrderbook = (wsOrderbookRaw: WSOrderBookRaw): WSOrderBook => {
  return {
    timestamp: wsOrderbookRaw.t,
    sequence: wsOrderbookRaw.s,
    asks: wsOrderbookRaw.a,
    bids: wsOrderbookRaw.b,
  }
}

export const parseOrderbookTop = (orderbookTopRaw: OrderBookTopRaw): OrderBookTop => {
  return {
    timestamp: orderbookTopRaw.t,
    bestAsk: orderbookTopRaw.a,
    bestAskQuantity: orderbookTopRaw.A,
    bestBid: orderbookTopRaw.b,
    bestBidQuantity: orderbookTopRaw.B,
  }
}

export const parsePriceRate = (priceRateRaw: PriceRateRaw): PriceRate => {
  return {
    timestamp: priceRateRaw.t,
    rate: priceRateRaw.r,
  }
}