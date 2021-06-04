const {WSClientBase} = require('./clientBase')
const { OrderbookCache } = require('./orderbook_cache')
const methods = require("./methods.json")

/**
 * PublicClient connects via websocket to cryptomarket to get market information of the exchange.
 */
class PublicClient extends WSClientBase {
    constructor() {
        super("wss://api.exchange.cryptomkt.com/api/2/ws/public")
        this.obCache = new OrderbookCache()
        this.methods = methods
    }

    handleNotification(notification) {
        let method = notification['method']
        let params = notification['params']
        let feedData = null
        let key = this.buildKey(method, params)
        if (this.isOrderbookFeed(method)) {
            this.obCache.update(method, key, params)
            if (this.obCache.orderbookBroken(key)) {
                this.obCache.waitOrderbookSnapshot(key)
                this.sendById('subscribeOrderbook', {'symbol':params['symbol']})
            }
            if (this.obCache.orderbookWaiting(key)) return
            feedData = this.obCache.getOrderbook(key)
        } else if (this.isCandlesFeed(method) || this.isTradesFeed(method)) {
            feedData = params.data
        } else {
            feedData = params
        }
        this.emitter.emit(key, feedData)
    }

    isOrderbookFeed(method) {
        return this.methods[method] === "orderbooks"
    }

    isTradesFeed(method) {
        return this.methods[method] === "trades"
    }

    isCandlesFeed(method) {
        return this.methods[method] === "candles"
    }

    buildKey(method, params) {
        let methodKey = this.methods[method]
        let symbol = ('symbol' in params) ? params['symbol'] : ''
        let period = ('period' in params) ? params['period'] : ''
        let key = methodKey + ':' + symbol + ':' + period
        return key.toUpperCase()
    }

    /**
     * Get a list all available currencies on the exchange
     * 
     * https://api.exchange.cryptomkt.com/#get-currencies
     * 
     * @return {Promise} A promise of the list of all available currencies.
     */
    getCurrencies() {
        return this.sendById('getCurrencies')
    }

    /**
     * Get the data of a currency
     * 
     * https://api.exchange.cryptomkt.com/#get-currencies
     * 
     * @param {string} currency A currency id
     * 
     * @return {Promise} A promise of the currency
     */
    getCurrency(currency) {
        this.checkDefined({currency})
        return this.sendById('getCurrency', {currency})
    }

    /**
     * Get a list of the specified symbols or all of them if no symbols are specified
     * 
     * A symbol is the combination of the base currency (first one) and quote currency (second one)
     * 
     * https://api.exchange.cryptomkt.com/#get-symbols
     * 
     * @return {Promise} A promise of the list of symbols traded on the exchange
     */
    getSymbols() {
        return this.sendById('getSymbols')
    }

    /**
     * Get a symbol by its id
     * 
     * A symbol is the combination of the base currency (first one) and quote currency (second one)
     * 
     * https://api.exchange.cryptomkt.com/#get-symbols
     * 
     * 
     * @param {string} symbol A symbol id
     * 
     * @return {Promise} A promise of the symbol traded on the exchange
     */
    getSymbol(symbol) {
        this.checkDefined({symbol})
        return this.sendById('getSymbol', {symbol})
    }

    /**
     * Get trades of the specified symbol
     * 
     * https://api.exchange.cryptomkt.com/#get-trades
     * 
     * @param {string} symbol The symbol to get the trades
     * @param {string} [params.sort] Optional. Sort direction. 'ASC' or 'DESC'. Default is 'DESC'
     * @param {string} [params.from] Optional. Initial value of the queried interval.
     * @param {string} [params.till] Optional. Last value of the queried interval.
     * @param {number} [params.limit] Optional. Trades per query. Defaul is 100. Max is 1000
     * @param {number} [params.offset] Optional. Default is 0. Max is 100000
     
     * 
     * @return Trades information of the symbol as result argument for the  callback
     */
    getTrades(symbol, params) {
        if (!params) params = {}
        this.checkDefined({symbol})
        params['symbol'] = symbol
        return this.sendById('getTrades', params)
    }

    ///////////////////
    // subscriptions //
    ///////////////////

    /**
     * Subscribe to a ticker of a symbol.
     * 
     * the feed is a ticker
     * 
     * https://api.exchange.cryptomkt.com/#subscribe-to-ticker
     * 
     * @param {string} symbol A symbol to subscribe
     * @param {function} callback A function to call with the result data. It takes one argument. The ticker feed
     * 
     * @return {Promise<Boolean>} A Promise of the subscription result. True if success
     */
    subscribeToTicker(symbol, callback) {
        this.checkDefined({symbol, callback})
        return this.sendSubscription('subscribeTicker', callback, {symbol})
    }

    /**
     * Unsubscribe to a ticker of a symbol
     * 
     * https://api.exchange.cryptomkt.com/#subscribe-to-ticker
     * 
     * 
     * @param {string} symbol The symbol to stop the ticker subscribption
     * 
     * @return {Promise<Boolean>} A Promise of the unsubscription result. True if success
     */
    unsubscribeToTicker(symbol) {
        this.checkDefined({symbol})
        return this.sendUnsubscription('unsubscribeTicker', {symbol})
    }

    /**
     * Subscribe to the order book of a symbol
     * 
     * the feed is an orderbook
     * 
     * An Order Book is an electronic list of buy and sell orders for a specific symbol, structured by price level
     * 
     * https://api.exchange.cryptomkt.com/#subscribe-to-order-book
     * 
     * @param {string} symbol The symbol of the orderbook
     * @param {function} callback A function to call with the result data. It takes one argument. the order book feed
     * 
     * @return {Promise<Boolean>} A Promise of the subscription result. True if success
     */
    subscribeToOrderbook(symbol, callback) {
        this.checkDefined({symbol, callback})
        return this.sendSubscription('subscribeOrderbook', callback, {symbol})
    }

    /**
     * Unsubscribe to an order book of a symbol
     * 
     * An Order Book is an electronic list of buy and sell orders for a specific symbol, structured by price level
     * 
     * https://api.exchange.cryptomkt.com/#subscribe-to-order-book
     * 
     * @param {string} symbol The symbol of the orderbook
     * 
     * @return {Promise<Boolean>} A Promise of the unsubscription result. True if success
     */
    unsubscribeToOrderbook(symbol) {
        this.checkDefined({symbol})
        return this.sendUnsubscription('unsubscribeOrderbook', {symbol})
    }

    /**
     * Subscribe to the trades of a symbol
     * 
     * the feed is a list of trades
     * 
     * https://api.exchange.cryptomkt.com/#subscribe-to-trades
     * 
     * @param {string} symbol The symbol of the trades
     * @param {number} [limit] Optional. Maximum number of trades in the first feed, the nexts feeds have one trade
     * @param {function} callback A function to call with the result data. It takes one argument. the trades feed
     * 
     * @return {Promise<Boolean>} A Promise of the subscription result. True if success
     */
    subscribeToTrades(symbol, limit, callback) {
        this.checkDefined({symbol, callback})
        return this.sendSubscription('subscribeTrades', callback, {symbol, limit})
    }


    /**
     * Unsubscribe to a trades of a symbol
     * 
     * https://api.exchange.cryptomkt.com/#subscribe-to-trades
     * 
     * @param {string} symbol The symbol of the trades
     * 
     * @return {Promise<Boolean>} A Promise of the unsubscription result. True if success
     */
    unsubscribeToTrades(symbol) {
        this.checkDefined({symbol})
        return this.sendUnsubscription('unsubscribeTrades', {symbol})
    }
    
    /**
     * Subscribe to the candles of a symbol, at the given period
     * 
     * the feed is a list of candles 
     * 
     * Candels are used for OHLC representation
     * 
     * https://api.exchange.cryptomkt.com/#subscribe-to-candles
     * 
     * @param {string} symbol A symbol to recieve a candle feed
     * @param {string} period A valid tick interval. 'M1' (one minute), 'M3', 'M5', 'M15', 'M30', 'H1' (one hour), 'H4', 'D1' (one day), 'D7', '1M' (one month)
     * @param {number} [limit] Optional. Maximum number of candles in the first feed. The rest of the feeds have one candle
     * @param {function} callback A function to call with the result data. It takes one argument. recieves the candle feed
     * 
     * @return {Promise<Boolean>} A Promise of the subscription result. True if success
     */
    subscribeToCandles(symbol, period, limit, callback) {
        this.checkDefined({symbol, period, callback})
        let params = {symbol, period}
        if (limit) params["limit"] = limit
        return this.sendSubscription('subscribeCandles', callback, params)
    }

    /**
     * Unsubscribe to the candles of a symbol at a given period
     * 
     * https://api.exchange.cryptomkt.com/#subscribe-to-candles
     * 
     * @param {string} symbol The symbol of the candles
     * @param {string} period 'M1' (one minute), 'M3', 'M5', 'M15', 'M30', 'H1' (one hour), 'H4', 'D1' (one day), 'D7', '1M' (one month)
     * 
     * @return {Promise<Boolean>} A Promise of the unsubscription result. True if success
     */
    unsubscribeToCandles(symbol, period) {
        this.checkDefined({symbol, period})
        return this.sendUnsubscription('unsubscribeCandles', {symbol, period})
    }
}

module.exports = {
    PublicClient
}