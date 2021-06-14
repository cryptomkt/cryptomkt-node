const { TradingClient } = require("../lib/websocket/tradingClient")
const keys = require("/home/ismael/cryptomarket/apis/keys.json");
const { fail } = require("assert");
const check = require("./test_helpers");

describe('get trading balance', function() {    
    it('should succeed', async function() {
        this.timeout(0)
        let wsclient = new TradingClient(keys.apiKey, keys.apiSecret)
        try {
            await wsclient.connect()
            balance = await wsclient.getTradingBalance()
            if (!check.goodBalances(balance)) fail("sould be good")
        } catch (err) {
            fail("should not fail. " + err)
        }
        wsclient.close()
    })
}) 


describe('order life cycle', function() {    
    it('should succeed', async function() {
        this.timeout(0)
        let wsclient = new TradingClient(keys.apiKey, keys.apiSecret)
        try {
            await wsclient.connect()
            let clientOrderId = Math.floor(Date.now() / 1000).toString()

            let order = await wsclient.createOrder({
                clientOrderId:clientOrderId, 
                symbol:'EOSETH', 
                side:'sell', 
                quantity:'0.01', 
                price:'1000'
            })
            if (!check.goodReport(order)) fail("not a good report")

            let activeOrders = await wsclient.getActiveOrders()
            let present = false
            for (order of activeOrders) {
                if (order.clientOrderId === clientOrderId) present = true
            }
            if (!present) fail("order is not present")

            let newCOId = clientOrderId + "new"
            order = await wsclient.replaceOrder(clientOrderId, newCOId, "0.02", "2000")
            if (!check.goodReport(order)) fail("not a good report")
            order = await wsclient.cancelOrder(newCOId)
            if (!check.goodReport(order)) fail("not a good report")

        } catch (err) {
            fail("should not fail. " + err)
        }
        wsclient.close()
    })
}) 
