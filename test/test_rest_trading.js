const { Client } = require("../lib/client")
const keys = require("/home/ismael/cryptomarket/apis/keys.json");
const check = require("./test_helpers")
const { fail } = require("assert");

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


describe('Get account trading balance', () => {    
    let client = new Client(keys.apiKey,keys.apiSecret);
    it('should succeed', async function() {
        balances = await client.getTradingBalance()
        if (!check.goodBalances(balances)) fail("should be good")
    })
})

describe('create order with client order id', () => {    
    let client = new Client(keys.apiKey, keys.apiSecret);
    it('should succeed', async function() {
        let timestamp = Math.floor(Date.now() / 1000).toString()
        order = await client.createOrder({
            'symbol':'EOSETH',
            'side':'sell',
            'quantity':'0.01',
            'price':'1000',
            'clientOrderId':timestamp
        })
        if (!check.goodOrder(order)) fail("should be good")
        order = await client.getActiveOrder(timestamp)
        if (!check.goodOrder(order)) fail("should be good")
        order = await client.cancelOrder(timestamp)
        if (!check.goodOrder(order)) fail("should be good")
    })
})


describe('create order with no client order id', () => {    
    let client = new Client(keys.apiKey,keys.apiSecret);
    it('should succeed', async function() {
        order = await client.createOrder({
            symbol: 'EOSETH',
            side: 'sell', 
            quantity: '0.01',
            price: '1001',
        })
        if (!check.goodOrder(order)) fail("should be good")
        order = await client.cancelOrder(order.clientOrderId)
        if (!check.goodOrder(order)) fail("should be good")
    })
})

describe('cancel all orders', () => {    
    let client = new Client(keys.apiKey,keys.apiSecret);
    it('should succeed', async function() {
        this.timeout(0)
        client.cancelAllOrders()  
        order = await client.createOrder({
            symbol: 'EOSETH',
            side: 'sell', 
            quantity: '0.01',
            price: '1001',
        })
        order = await client.createOrder({
            symbol: 'EOSBTC',
            side: 'sell', 
            quantity: '0.01',
            price: '1001',
        })
        orders = await client.getActiveOrders('EOSETH')
        response = await client.cancelAllOrders('EOSETH')

        if (response.length == orders.length) fail("it does not cancel all orders order, filter does not work")
        client.cancelAllOrders()  
    })
})

describe('get trading fee', () => {    
    let client = new Client(keys.apiKey,keys.apiSecret);
    it('should succeed', async function() {
        response = await client.tradingFee('EOSETH')
        if (!('takeLiquidityRate' in response) || !("provideLiquidityRate" in response)) fail("not a trading fee")
    })
})