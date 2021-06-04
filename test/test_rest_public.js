const { fail } = require("assert");
const assert = require("assert")
const { Client } = require("../lib/client")
const check = require("./test_helpers")

describe('Get Currencies', () => {    
    let client = new Client("","");

    context('Get all currencies', () => {
        it('should be the full list of currencies', async function() {
            currencies = await client.getCurrencies()
            if (currencies.length == 0) fail("should have currencies")
            for (currency of currencies) {
                if (!check.goodCurrency(currency)) fail("should be good")
            }
        })
    })

    context('Get some currencies', () => {
        it('should be a list of two currencies', async function() {
            currencies = await client.getCurrencies(['eos', 'BTC'])
            assert(currencies.length == 2, "wrong number of currencies")
            for (currency of currencies) {
                if (!check.goodCurrency(currency)) fail("should be good")
            }
        })
    })

    context('Get one currency', () => {
        it('should be a list of one currency', async function() {
            currencies = await client.getCurrencies(['eth'])
            assert(currencies.length == 1, "wrong number of currencies")
            for (currency of currencies) {
                if (!check.goodCurrency(currency)) fail("should be good")
            }
        })
    })
})

describe('Get Symbol', () => {    
    let client = new Client("","");
    it('should succeed', async function() {
        let result = await client.getSymbol('ETHBTC')
        if (!check.goodSymbol(result)) fail("should be good")
        assert(result.id === 'ETHBTC', "failed request")
    })
})

describe('Get Symbols', () => {    
    let client = new Client("","");

    context('Get all symbols', () => {
        it('should be the full list of symbols', async function() {
            symbols = await client.getSymbols()
            if (symbols.length == 0) fail("should have symbols")
            for (symbol of symbols) {
                if (!check.goodSymbol(symbol)) fail("should be good")
            }
        })
    })

    context('Get some symbols', () => {
        it('should be a list of two symbols', async function() {
            symbols = await client.getSymbols(['EOSETH', 'PAXGBTC'])
            for (symbol of symbols) {
                if (!check.goodSymbol(symbol)) fail("should be good")
            }
            assert(symbols.length == 2, "wrong number of symbols")
        })
    })

    context('Get one symbol', () => {
        it('should be a list of one symbol', async function() {
            symbols = await client.getSymbols(['EOSETH'])
            for (symbol of symbols) {
                if (!check.goodSymbol(symbol)) fail("should be good")
            }
            assert(symbols.length == 1, "wrong number of symbols")
        })
    })
})


describe('Get Ticker', () => {    
    let client = new Client("","");

    context('Get tickers of all symbols', () => {
        it('should be the full list of tickers', async function() {
            tickers = await client.getTickers()
            if (tickers.length == 0) fail("should have tickers")
            for (key in tickers) {
                if (!check.goodTicker(tickers[key])) fail("should be good")
            }
        })
    })

    context('Get tickers of some symbols', () => {
        it('should be a list of two tickers', async function() {
            tickers = await client.getTickers(['EOSETH', 'PAXGBTC'])
            for (key in tickers) {
                if (!check.goodTicker(tickers[key])) fail("should be good")
            }
            assert(tickers.length == 2, "wrong number of tickers")
        })
    })

    context('Get ticker of one symbol', () => {
        it('should be a list of one ticker', async function() {
            tickers = await client.getTickers(['EOSETH'])
            for (key in tickers) {
                if (!check.goodTicker(tickers[key])) fail("should be good")
            }
            assert(tickers.length == 1, "wrong number of tickers")
        })
    })
})

describe('Get Ticker', () => {    
    let client = new Client("","");
    it('should succeed', async function() {
        ticker = await client.getTicker('EOSETH')
        if (!check.goodTicker(ticker)) fail("should be good")
        assert(ticker.symbol === 'EOSETH', "failed request")
    })
})


describe('Get Trades', () => {    
    let client = new Client("","");

    context('Get trades of all symbols', () => {
        it('should be the full list of trades', async function() {
            trades = await client.getTrades()
            if (trades.length ==0) fail("should have trades")
            for (key in trades) {
                for (trade of trades[key]) {
                    if (!check.goodPublicTrade(trade)) fail("should be good")
                }
            }
        })
    })
    
    context('Get trades of some symbols', () => {
        it('should be trades of two symbols', async function() {
            trades = await client.getTrades({'symbols':['EOSETH', 'PAXGBTC'], 'limit':2})
            for (key in trades) {
                for (trade of trades[key]) {
                    if (!check.goodPublicTrade(trade)) fail("should be good")
                }
            }
            assert(Object.keys(trades).length == 2, "wrong number of tickers")
        })
    })

    context('Get trades of one symbol', () => {
        it('should be the trades of one symbol', async function() {
            trades = await client.getTrades({"symbols":['EOSETH']})
            for (key in trades) {
                for (trade of trades[key]) {
                    if (!check.goodPublicTrade(trade)) fail("should be good")
                }
            }
            assert(Object.keys(trades).length == 1, "wrong number of tickers")
        })
    })
})

describe('Get order books', () => {    
    let client = new Client("","");

    context('Get order books of all symbols', () => {
        it('should be the full list of order books', async function() {
            orderBooks = await client.getOrderBooks()
            if (orderBooks.length == 0) fail("should have orderbooks")
            for (key in orderBooks) {
                if (!check.goodOrderbook(orderBooks[key])) fail("should be good")
            }
        })
    })

    context('Get order books of some symbols', () => {
        it('should be order books of two symbols', async function() {
            orderBooks = await client.getOrderBooks(['EOSETH', 'PAXGBTC'], 2)
            for (key in orderBooks) {
                if (!check.goodOrderbook(orderBooks[key])) fail("should be good")
            }
            assert(Object.keys(orderBooks).length == 2, "wrong number of books")
        })
    })

    context('Get order books of one symbol', () => {
        it('should be the order books of one symbol', async function() {
            orderBooks = await client.getOrderBooks(['EOSETH'])
            for (key in orderBooks) {
                if (!check.goodOrderbook(orderBooks[key])) fail("should be good")
            }
            assert(Object.keys(orderBooks).length == 1, "wrong number of books")
        })
    })
})


describe('Get Order book', () => {    
    let client = new Client("","");
    it('should succeed', async function() {
        orderBook = await client.getOrderBook('EOSETH')
        if (!check.goodOrderbook(orderBook)) fail("should be good")
        assert(orderBook.symbol === 'EOSETH', "failed request")
    })
})

describe('Get candles', () => {    
    let client = new Client("","");

    context('Get candles of all symbols', () => {
        it('should be the full list of candles', async function() {
            candles = await client.getCandles()
            if (candles.length ==0) fail("should have candles")
            for (key in candles) {
                if (!check.goodCandleList(candles[key])) fail("should be good")
            }
        })
    })

    context('Get candles of some symbols', () => {
        it('should be order candles of two symbols', async function() {
            candles = await client.getCandles({
                'symbols':['EOSETH', 'PAXGBTC'], 
                'period':'M1',
                'limit':2
            })
            for (key in candles) {
                if (!check.goodCandleList(candles[key])) fail("should be good")
            }
            assert(Object.keys(candles).length == 2, "wrong number of candles")
        })
    })

    context('Get candles of one symbol', () => {
        it('should be the candles of one symbol', async function() {
            candles = await client.getCandles({'symbols':['EOSETH']})
            for (key in candles) {
                if (!check.goodCandleList(candles[key])) fail("should be good")
            }
            assert(Object.keys(candles).length == 1, "wrong number of candles")
        })
    })
})

