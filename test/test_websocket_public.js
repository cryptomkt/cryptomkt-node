const { PublicClient } = require("../lib/websocket/publicClient")
const { fail } = require("assert");
const check = require("./test_helpers");


describe('get an exchange error', function() {    
    it('should succeed', async function() {
        this.timeout(0)
        let wsclient = new PublicClient()
        try {
            await wsclient.connect()
            await wsclient.getTrades("abcde") // not a real symbol
            fail("shoul rise error")
        } catch (err) {
        }
        wsclient.close()
    })
})


describe('Get Currencies', function() {    
    it('should succeed', async function() {
        this.timeout(0)
        let wsclient = new PublicClient()
        try {
            await wsclient.connect()
            currencies = await wsclient.getCurrencies()
            for (currency of currencies) {
                if (!check.goodCurrency(currency)) fail("should be good")
            }
        } catch (err) {
            fail("should not fail" + err)
        } 
        wsclient.close()
    })
})

describe('Get Currency', function() {    
    it('should succeed', async function() {
        this.timeout(0)
        let wsclient = new PublicClient()
        try {
            await wsclient.connect()
            currency = await wsclient.getCurrency("EOS")
            if (!check.goodCurrency(currency)) fail("should be good")
        } catch (err) {
            fail("should not fail" + err)
        } 
        wsclient.close()
    })
})

describe('Get symbols', function() {    
    it('should succeed', async function() {
        this.timeout(0)
        let wsclient = new PublicClient()
        try {
            await wsclient.connect()
            symbols = await wsclient.getSymbols()
            for (symbol of symbols) {
                if (!check.goodSymbol(symbol)) fail("should be good")
            }
        } catch (err) {
            fail("should not fail" + err)
        } 
        wsclient.close()
    })
})

describe('Get symbol', function() {    
    it('should succeed', async function() {
        this.timeout(0)
        let wsclient = new PublicClient()
        try {
            await wsclient.connect()
            symbol = await wsclient.getSymbol("EOSETH")
            if (!check.goodSymbol(symbol)) fail("should be good")
            
        } catch (err) {
            fail("should not fail" + err)
        } 
        wsclient.close()
    })
})

describe('get trades', function() {    
    it('should succeed', async function() {
        this.timeout(0)
        let wsclient = new PublicClient()
        try {
            await wsclient.connect()
            trades = await wsclient.getTrades("ETHBTC")
            for (trade of trades.data) {
                if (!check.goodPublicTrade(trade)) fail("should be good")
            }
        } catch (err) {
            fail("should not fail" + err)
        } 
        wsclient.close()
    })
    it('not a real symbol', async function() {
        this.timeout(0)
        let wsclient = new PublicClient()
        
        try {
            await wsclient.connect()
            await wsclient.getTrades("ETHBTCCCC")
            fail("should fail")
        } catch (err) {
            // good, is failing
        } 
        wsclient.close()
    })
})