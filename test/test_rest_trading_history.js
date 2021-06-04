const { Client } = require("../lib/client")
const keys = require("../../keys.json")
const check = require("./test_helpers")
const { fail } = require("assert")

describe('Get Orders', () => {    
    let client = new Client(keys.apiKey,keys.apiSecret);
    it('should succeed', async function() {
        orders = await client.getOrders('825d1fc9ac2b24ef7027400d3a05480b')
        if (!check.goodOrderList(orders)) fail("should be good")
    })
})


describe('Get Order history', () => {    
    let client = new Client(keys.apiKey,keys.apiSecret);
    it('should succeed', async function() {
        orders = await client.getOrdersHistory()
        if (!check.goodOrderList(orders)) fail("should be good")
    })
})


describe('Get Trades history', () => {    
    let client = new Client(keys.apiKey,keys.apiSecret);
    it('should succeed', async function() {
        trades = await client.getTradesHistory()
        for (trade of trades) {
            if (!check.goodTrade(trade)) fail("should be good")
        }
    })
})


describe('Get trades by order', () => {    
    let client = new Client(keys.apiKey,keys.apiSecret);
    it('should succeed', async function() {
        trades = await client.getTradesByOrder(337789478188)
        for (trade of trades) {
            if (!check.goodTrade(trade)) fail("should be good")
        }
    })
})
