const CryptoJS = require('crypto-js');
const fetch = require("node-fetch");
const { CryptomarketSDKException, CryptomarketAPIException, ArgumentFormatException } = require('./exceptions');
const { URL, URLSearchParams } = require('url');

const apiUrl     = 'https://api.exchange.cryptomkt.com'
const apiVersion = '/api/2/'

const methodGet = "GET"
const methodPut = "PUT"
const methodPost = "POST"
const methodDelete = "DELETE"

class Client {
    constructor(apiKey, apiSecret) {
        this.apiKey = apiKey
        this.apiSecret = apiSecret
    }

    async publicGet(endpoint, params) {
        return this.makeRequest(methodGet, endpoint, params, true)
    }

    async get(endpoint, params) {
        return this.makeRequest(methodGet, endpoint, params)
    }

    async post(endpoint, params) {
        return this.makeRequest(methodPost, endpoint, params)
    }

    async delete(endpoint, params) {
        return this.makeRequest(methodDelete, endpoint, params)
    }

    async put(endpoint, params) {
        return this.makeRequest(methodPut, endpoint, params)
    }

    async makeRequest(method, endpoint, params, publc=false) {
        let url = new URL(apiUrl + apiVersion + endpoint)
        let query = new URLSearchParams(params).toString()

        // build fetch options
        let opts = {
            method: method,
            headers: {
                'User-Agent': 'cryptomarket/node',
                'Content-type': 'application/x-www-form-urlencoded'
            }
        }
        // add auth header if not public endpoint
        if (!publc) opts.headers['Authorization'] = this.buildCredential(method, endpoint, query)
        
        // include query params to call
        if (method === methodGet) url.search = query
        else opts.body = query
        
        // make request
        let response
        try {
            response = await fetch(url, opts)
        } catch (e) {
            throw new CryptomarketSDKException('Failed request to server', e)
        }
        let jsonResponse
        try {
            jsonResponse = await response.json()
        } catch (e) {
            throw new CryptomarketSDKException(`Failed to parse response: ${response}`, e)
        }
        if (!response.ok) {
            throw new CryptomarketAPIException(jsonResponse, response.status)
        }
        return jsonResponse
    }

    buildCredential(httpMethod, method, query) {
        let timestamp = Math.floor(Date.now() / 1000).toString()
        let msg = httpMethod + timestamp + apiVersion + method
        if (query) {
            if (httpMethod === methodGet) msg += "?"
            msg += query
        } 
        let signature = CryptoJS.HmacSHA256(msg, this.apiSecret).toString()
        return "HS256 " + Buffer.from(this.apiKey + ":" + timestamp + ":" + signature).toString('base64')
    }

    //////////////////
    // PUBLIC CALLS //
    //////////////////

    /**
     * Get a list of all currencies or specified currencies
     * 
     * https://api.exchange.cryptomkt.com/#currencies
     * 
     * @param {string[]} [currencies] Optional. A list of currencies ids
     * 
     * @return A list of available currencies
     */
    getCurrencies(currencies=[]) {
        return this.get('public/currency/', {currencies})
    }

    /**
     * Get the data of a currency
     * 
     * https://api.exchange.cryptomkt.com/#currencies
     * 
     * @param {string} currency A currency id
     * 
     * @return A currency
     */
    getCurrency(currency) {
        return this.get(`public/currency/${currency}`)
    }

    /**
     * Get a list of all symbols or for specified symbols
     * 
     * A symbol is the combination of the base currency (first one) and quote currency (second one)
     *
     * https://api.exchange.cryptomkt.com/#symbols
     *
     * @param {string[]} [symbols] Optional. A list of symbol ids
     * 
     * @return A list of symbols traded on the exchange
     */
    async getSymbols(symbols=[]) {
        return this.get('public/symbol/', {symbols})
    }

    /**
     * Get a symbol by its id
     * 
     * A symbol is the combination of the base currency (first one) and quote currency (second one)
     * 
     * https://api.exchange.cryptomkt.com/#symbols
     * 
     * @param {string} symbol A symbol id
     * 
     * @return A symbol traded on the exchange
     */
    getSymbol(symbol) {
        return this.get(`public/symbol/${symbol}`)
    }

    /**
     * Get tickers for all symbols or for specified symbols
     * 
     * https://api.exchange.cryptomkt.com/#tickers
     * 
     * @param {string[]} [symbols] Optional. A list of symbol ids
     * 
     * @returns A list of tickers
     */
    getTickers(symbols = []) {
        return this.get('public/ticker/', {symbols})
    }

    /**
     * Get the ticker of a symbol
     * 
     * https://api.exchange.cryptomkt.com/#tickers
     * 
     * @param {string} [symbol] A symbol id
     * 
     * @returns A ticker of a symbol
     */
    getTicker(symbol) {
        return this.get(`public/ticker/${symbol}`)
    }

    /**
     * Get trades for all symbols or for specified symbols
     * 
     * 'from' param and 'till' param must have the same format, both index of both timestamp
     * 
     * https://api.exchange.cryptomkt.com/#trades
     * 
     * @param {string[]} [params.symbols] Optional. A list of symbol ids
     * @param {string} [params.sort] Optional. Sort direction. 'ASC' or 'DESC'. Default is 'DESC'
     * @param {string} [params.from] Optional. Initial value of the queried interval
     * @param {string} [params.till] Optional. Last value of the queried interval
     * @param {number} [params.limit] Optional. Trades per query. Defaul is 100. Max is 1000
     * @param {number} [params.offset] Optional. Default is 0. Max is 100000
     * 
     * @return A list of trades for each symbol of the query
     */
    getTrades(params) {
        return this.get('public/trades/', params)
    }

    /**
     * Get trades of a symbol
     * 
     * 'from' param and 'till' param must have the same format, both index of both timestamp
     * 
     * https://api.exchange.cryptomkt.com/#trades
     * 
     * @param {string} symbol A symbol id
     * @param {string} [params.sort] Optional. Sort direction. 'ASC' or 'DESC'. Default is 'DESC'
     * @param {string} [params.from] Optional. Initial value of the queried interval
     * @param {string} [params.till] Optional. Last value of the queried interval
     * @param {number} [params.limit] Optional. Trades per query. Defaul is 100. Max is 1000
     * @param {number} [params.offset] Optional. Default is 0. Max is 100000
     * 
     * @return A list of trades of the symbol
     */
    getTradesOfSymbol(symbol, params) {
        return this.get(`public/trades/${symbol}`, params)
    }

    /**
     * Get orderbooks for all symbols or for the specified symbols
     * 
     * An Order Book is an electronic list of buy and sell orders for a specific symbol, structured by price level
     * 
     * https://api.exchange.cryptomkt.com/#order-book
     * 
     * @param {string[]} [symbols] Optional. A list of symbol ids
     * @param {number} [limit] Optional. Limit of order book levels. Set to 0 to view full list of order book levels
     * 
     * @return The order book for each queried symbol
     */
    getOrderBooks(symbols=[], limit) {
        let params = {symbols}
        if (limit) {
            params['limit'] = limit
        }
        return this.get('public/orderbook/', params)
    }

    /**
     * Get order book of a symbol
     * 
     * An Order Book is an electronic list of buy and sell orders for a specific symbol, structured by price level
     * 
     * https://api.exchange.cryptomkt.com/#order-book
     * 
     * @param {string} symbol The symbol id
     * @param {number} [limit] Optional. Limit of order book levels. Set to 0 to view full list of order book levels
     * 
     * @return The order book of the symbol
     */
    getOrderBook(symbol, limit) {
        let params = {}
        if (limit) {
            params['limit'] = limit
        }
        return this.get(`public/orderbook/${symbol}`, params)
    }

    /**
     * Get order book of a symbol with market depth info
     * 
     * An Order Book is an electronic list of buy and sell orders for a specific symbol, structured by price level
     * 
     * https://api.exchange.cryptomkt.com/#order-book
     * 
     * @param {string} symbol The symbol id
     * @param {number} volume Desired volume for market depth search
     * 
     * @return The order book of the symbol
     */
    marketDepthSearch(symbol, volume) {
        let params = {volume}
        return this.get(`public/orderbook/${symbol}`, params)
    }

    

    /**
     * Get candles for all symbols or for specified symbols
     * 
     * Candels are used for OHLC representation
     * 
     * https://api.exchange.cryptomkt.com/#candles
     * 
     * @param {string[]} [params.symbols] Optional. A list of symbol ids
     * @param {string} [params.period] Optional. A valid tick interval. 'M1' (one minute), 'M3', 'M5', 'M15', 'M30', 'H1' (one hour), 'H4', 'D1' (one day), 'D7', '1M' (one month). Default is 'M30'
     * @param {string} [params.sort] Optional. Sort direction. 'ASC' or 'DESC'. Default is 'DESC'
     * @param {string} [params.from] Optional. Initial value of the queried interval
     * @param {string} [params.till] Optional. Last value of the queried interval
     * @param {number} [params.limit] Optional. Candles per query. Defaul is 100. Max is 1000
     * @param {number} [params.offset] Optional. Default is 0. Max is 100000
     * 
     * @return A list of candles for each symbol of the query
     */
    getCandles(params) {
        return this.get('public/candles/', params)
    }


    /**
     * Get candle for all symbols or for specified symbols
     * 
     * Candels are used for OHLC representation
     * 
     * https://api.exchange.cryptomkt.com/#candles
     * 
     * @param {string} symbol A symbol id
     * @param {string} [params.period] Optional. A valid tick interval. 'M1' (one minute), 'M3', 'M5', 'M15', 'M30', 'H1' (one hour), 'H4', 'D1' (one day), 'D7', '1M' (one month). Default is 'M30'
     * @param {string} [params.sort] Optional. Sort direction. 'ASC' or 'DESC'. Default is 'DESC'
     * @param {string} [params.from] Optional. Initial value of the queried interval
     * @param {string} [params.till] Optional. Last value of the queried interval
     * @param {number} [params.limit] Optional. Candles per query. Defaul is 100. Max is 1000
     * @param {number} [params.offset] Optional. Default is 0. Max is 100000
     * 
     * @return A list of candles of a symbol
     */
    getCandlesOfSymbol(symbol, params) {
        return this.get(`public/candles/${symbol}`, params)
    }

    /////////////////////////
    // AUTHENTICATED CALLS //
    /////////////////////////

    /////////////
    // TRADING //
    /////////////

    /**
     * Get the account trading balance
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#trading-balance
     * 
     * @return the account trading balance.
     */
    getTradingBalance() {
        return this.get('trading/balance')
    }

    /**
     * Get the account active orders
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#get-active-orders
     * 
     * @param {string} symbol Optional. A symbol for filtering active orders
     * 
     * @return The account active orders
     */
    getActiveOrders(symbol) {
        let params = {}
        if (symbol) params["symbol"] = symbol
        return this.get('order', params)
    }

    /**
     * Get an active order by its client order id
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#get-active-orders
     * 
     * @param {string} clientOrderId The clientOrderId of the order
     * @param {number} [wait] Optional. Time in milliseconds Max value is 60000. Default value is None. While using long polling request: if order is filled, cancelled or expired order info will be returned instantly. For other order statuses, actual order info will be returned after specified wait time.
     * 
     * @return An order of the account
     */
    getActiveOrder(clientOrderId, wait) {
        let params = {}
        if (wait) {
            params["wait"] = wait
        }
        return this.get(`order/${clientOrderId}`, params)
    }

    /**
     * Creates a new order
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#create-new-order
     * 
     * @param {string} params.symbol Trading symbol
     * @param {string} params.side 'buy' or 'sell'
     * @param {string} params.quantity Order quantity
     * @param {string} [params.clientOrderId] Optional. If given must be unique within the trading day, including all active orders. If not given, is generated by the server
     * @param {string} [params.type] Optional. 'limit', 'market', 'stopLimit' or 'stopMarket'. Default is 'limit'
     * @param {string} [params.timeInForce] Optional. 'GTC', 'IOC', 'FOK', 'Day', 'GTD'. Default to 'GTC'
     * @param {string} [params.price] Required for 'limit' and 'stopLimit'. limit price of the order
     * @param {string} [params.stopPrice] Required for 'stopLimit' and 'stopMarket' orders. stop price of the order
     * @param {string} [params.expireTime] Required for orders with timeInForce = GDT
     * @param {boolean} [params.strictValidate] Optional. If False, the server rounds half down for tickerSize and quantityIncrement. Example of ETHBTC: tickSize = '0.000001', then price '0.046016' is valid, '0.0460165' is invalid 
     * @param {boolean} [params.postOnly] Optional. If True, your post_only order causes a match with a pre-existing order as a taker, then the order will be cancelled
     * 
     * @return An order of the account
     */
    createOrder(params={}) {
        if (!('symbol' in params)) throw new ArgumentFormatException('missing "symbol" argument for order creation')
        if (!('side' in params)) throw new ArgumentFormatException('missing "side" argument for order creation', ['buy', 'sell'])
        if (!('quantity' in params)) throw new ArgumentFormatException('missing "quantity" argument for order creation')
        if ('clientOrderId' in params) {
            let clientOrderId = params['clientOrderId']
            delete params['clientOrderId']
            return this.put(`order/${clientOrderId}`, params)
        }
        return this.post('order', params)
    }

    /**
     * Cancel all active orders, or all active orders for a specified symbol
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#cancel-orders
     * 
     * @param {string} [symbol] Optional. If given, cancels all orders of the symbol. If not given, cancels all orders of all symbols
     * 
     * @returns All the canceled orders
     */
    cancelAllOrders(symbol) {
        let params = {}
        if (symbol) params['symbol'] = symbol
        return this.delete('order', params)
    }

    /**
     * Cancel the order with clientOrderId
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#cancel-order-by-clientorderid
     * 
     * @param {string} clientOrderId the client id of the order to cancel
     * 
     * @return The canceled order
     */
    cancelOrder(clientOrderId) {
        return this.delete(`order/${clientOrderId}`)
    }

    /**
     * Get personal trading commission rates for a symbol
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#get-trading-commission
     * 
     * @param {string} symbol The symbol of the comission rates
     * 
     * @return The commission rate for a symbol
     */
    tradingFee(symbol) {
        return this.get(`trading/fee/${symbol}`)
    }

    /////////////////////
    // TRADING HISTORY //
    /////////////////////
    
    
    /**
     * Get the account order history
     * 
     * All not active orders older than 24 are deleted
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#orders-history
     * 
     * @param {string} [params.symbol] Optional. Filter orders by symbol
     * @param {string} [params.from] Optional. Initial value of the queried interval
     * @param {string} [params.till] Optional. Last value of the queried interval
     * @param {number} [params.limit] Optional. Trades per query. Defaul is 100. Max is 1000
     * @param {number} [params.offset] Optional. Default is 0. Max is 100000
     * 
     * @return Orders in the interval
     */
    getOrdersHistory(params={}) {
        return this.get('history/order', params)
    }

    /**
     * Get orders with the clientOrderId
     * 
     * All not active orders older than 24 are deleted
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#orders-history
     * 
     * @param {string} clientOrderId the clientOrderId of the orders
     * 
     * @return An order in a list
     */
    getOrders(clientOrderId) {
        return this.get('history/order', {clientOrderId})
    }


    /**
     * Get the user's trading history
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#orders-history
     * 
     * @param {string} [params.symbol] Optional. Filter trades by symbol
     * @param {string} [params.sort] Optional. Sort direction. 'ASC' or 'DESC'. Default is 'DESC'
     * @param {string} [params.by] Optional. Defines the sorting type.'timestamp' or 'id'. Default is 'timestamp'
     * @param {string} [params.from] Optional. Initial value of the queried interval. Id or datetime
     * @param {string} [params.till] Optional. Last value of the queried interval. Id or datetime
     * @param {number} [params.limit] Optional. Trades per query. Defaul is 100. Max is 1000
     * @param {number} [params.offset] Optional. Default is 0. Max is 100000
     * @param {string} [params.margin] Optional. Filtering of margin orders. 'include', 'only' or 'ignore'. Default is 'include'
     * @return Trades in the interval
     */
    getTradesHistory(params = {}) {
        return this.get('history/trades', params)
    }


    /**
     * Get the account's trading order with a specified order id
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#trades-by-order
     * 
     * @param {string} id Order unique identifier assigned by exchange
     * 
     * @return The trades of an order
     */
    getTradesByOrderId(id) {
        return this.get(`history/order/${id}/trades`)
    }

    ////////////////////////
    // ACCOUNT MANAGEMENT //
    ////////////////////////

    /**
     * Get the user account balance
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#account-balance
     * 
     * @return The user's account balance
     */
    getAccountBalance() {
        return this.get('account/balance')
    }

    /**
     * Get the current address of a currency
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#deposit-crypto-address
     * 
     * @param {string} currency currency to get the address
     * 
     * @return The currenct address for the currency
     */
    getDepositCryptoAddress(currency) {
        return this.get(`account/crypto/address/${currency}`)
    }

    /**
     * Creates a new address for the currency
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#deposit-crypto-address
     * 
     * @param {string} currency currency to create a new address
     * 
     * @return The created address for the currency
     */
    createDepositCryptoAddress(currency) {
        return this.post(`account/crypto/address/${currency}`)
    }

    /**
     * Get the last 10 addresses used for deposit by currency
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#last-10-deposit-crypto-address
     * 
     * @param {string} currency currency to get the list of addresses
     * 
     * @return A list of addresses
     */
    getLast10DepositCryptoAddresses(currency) {
        return this.get(`account/crypto/addresses/${currency}`)
    }

    /**
     * Get the last 10 unique addresses used for withdraw by currency
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#last-10-used-crypto-address
     * 
     * @param {string} currency currency to get the list of addresses
     * 
     * @return A list of addresses
     */
    getLast10UsedCryptoAddresses(currency) {
        return this.get(`account/crypto/used-addresses/${currency}`)
    }

    /**
     * Withdraw cryptocurrency
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#withdraw-crypto
     * 
     * @param {string} currency currency code of the crypto to withdraw 
     * @param {number} amount the amount to be sent to the specified address
     * @param {string} address the address identifier
     * @param {string} [params.paymentId] Optional.
     * @param {boolean} [params.includeFee] Optional. If true then the total spent amount includes fees. Default false
     * @param {boolean} [params.autoCommit] Optional. If false then you should commit or rollback transaction in an hour. Used in two phase commit schema. Default true
     * 
     * @return The transaction id, asigned by the exchange
     */
    withdrawCrypto(currency, amount, address, params = {}) {
        params['currency'] = currency
        params['amount'] = amount
        params['address'] = address
        return this.post('account/crypto/withdraw', params)
    }

    /**
     * Converts between currencies
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#transfer-convert-between-currencies
     * 
     * @param {string} fromCurrency currency code of origin
     * @param {string} toCurrency currency code of destiny
     * @param {number} amount the amount to be sent
     * 
     * @return A list of transaction identifiers
     */
    transferConvert(fromCurrency, toCurrency, amount) {
        let params = {fromCurrency, toCurrency, amount}
        return this.post('account/crypto/transfer-convert', params)
    }

    /**
     * Commit a withdrawal of cryptocurrency
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#withdraw-crypto-commit-or-rollback
     * 
     * @param {string} id the withdrawal transaction identifier
     * 
     * @return The transaction result. true if the commit is successful
     */
    commitWithdrawCrypto(id) {
        return this.put(`account/crypto/withdraw/${id}`)
    }

    /**
     * Rollback a withdrawal of cryptocurrency
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#withdraw-crypto-commit-or-rollback
     * 
     * @param {string} id the withdrawal transaction identifier
     * 
     * @return The transaction result. true if the rollback is successful
     */
    rollbackWithdrawCrypto(id) {
        return this.delete(`account/crypto/withdraw/${id}`)
    }

    /**
     * Get an estimate of the withdrawal fee
     * 
     * Requires authetication
     * 
     * https://api.exchange.cryptomkt.com/#estimate-withdraw-fee
     * 
     * @param {string} currency the currency code for withdraw
     * @param {number} amount the expected withdraw amount
     * 
     * @return The expected fee
     */
    getEstimatesWithdrawFee(currency, amount) {
        let params = {currency, amount}
        return this.get('account/crypto/estimate-withdraw', params)
    }

    /**
     * Check if an address is from this account
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#check-if-crypto-address-belongs-to-current-account
     * 
     * @param {string} address The address to check
     * 
     * @return The transaction result. true if it is from the current account
     */
    checkIfCryptoAddressIsMine(address) {
        return this.get(`account/crypto/is-mine/${address}`)
    }

    /**
     * Transfer money from the trading balance to the account balance
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#transfer-money-between-trading-account-and-bank-account
     * 
     * @param {string} currency Currency code for transfering
     * @param {number} amount Amount to be transfered
     * 
     * @return the transaction identifier of the transfer
     */
    transferMoneyFromTradingBalanceToAccountBalance(currency, amount) {
        let params = {currency, amount, type:"exchangeToBank"}
        return this.post('account/transfer', params)
    }

    /**
     * Transfer money from the account balance to the trading balance
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#transfer-money-between-trading-account-and-bank-account
     * 
     * @param {string} currency Currency code for transfering
     * @param {number} amount Amount to be transfered
     * 
     * @return the transaction identifier of the transfer
     */
    transferMoneyFromAccountBalanceToTradingBalance(currency, amount) {
        let params = {currency, amount, type:"bankToExchange"}
        return this.post('account/transfer', params)
    }

    /**
     * Transfer money to another user
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#transfer-money-to-another-user-by-email-or-username
     * 
     * @param {string} currency currency code
     * @param {number} amount amount to be transfered between balances
     * @param {string} by either 'email' or 'username'
     * @param {string} identifier the email or the username
     * 
     * @return The transaction identifier of the transfer
     */
    transferMoneyToAnotherUser(currency, amount, by, identifier) {
        let params = {currency, amount, by, identifier}
        return this.post('account/transfer/internal', params)
    }

    /**
     * Get the transactions of the account by currency
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#get-transactions-history
     * 
     * @param {string} currency Currency code to get the transaction history
     * @param {string} [params.sort] Optional. Sort direction. 'ASC' or 'DESC'. Default is 'DESC'.
     * @param {string} [params.by] Optional. Defines the sorting type.'timestamp' or 'id'. Default is 'timestamp'
     * @param {string} [params.from] Optional. Initial value of the queried interval. Id or datetime
     * @param {string} [params.till] Optional. Last value of the queried interval. Id or datetime
     * @param {number} [params.limit] Optional. Transactions per query. Defaul is 100. Max is 1000
     * @param {number} [params.offset] Optional. Default is 0. Max is 100000
     * 
     * @return A list with the transactions in the interval
     */
    getTransactionHistory(currency, params={}) {
        params['currency'] = currency
        return this.get('account/transactions', params)
    }

    /**
     * Get the transactions of the account by its identifier
     * 
     * Requires authentication
     * 
     * https://api.exchange.cryptomkt.com/#get-transactions-history
     * 
     * @param {string} id The identifier of the transaction
     * 
     * @return The transaction with the given id
     */
    getTransaction(id) {
        return this.get(`account/transactions/${id}`)
    }
}

module.exports = {
    Client,
}