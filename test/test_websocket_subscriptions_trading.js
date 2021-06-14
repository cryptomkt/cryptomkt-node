const { TradingClient } = require("../lib/websocket/tradingClient")
const keys = require("/home/ismael/cryptomarket/apis/keys.json");
const { fail } = require("assert");
const check = require("./test_helpers")

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const second = 1000

describe('Subscribe to reports', function() {    
    it('should succeed', async function() {
        this.timeout(0)
        let wsclient = new TradingClient(keys.apiKey, keys.apiSecret)
        try {
            await wsclient.connect()
            await wsclient.subscribeToReports((feed) => {
                if (Array.isArray(feed)) {
                    for (let report of feed) {
                        if (!check.goodReport(report)) {fail("not a good report in feed")}
                    }
                } else if (!check.goodReport(feed)) {fail("not a good report in feed")}
                
            })
            await timeout(3 * second)
            let clientOrderId = Math.floor(Date.now() / 1000).toString()
            await wsclient.createOrder({
                clientOrderId, 
                symbol:'EOSETH',
                side: 'sell',
                quantity:'0.01', 
                price:'1000'
            })
            await timeout(3 * second)
            await wsclient.cancelOrder(clientOrderId)
            await timeout(3 * second)
            wsclient.close()
        } catch (err) {
            fail("should not fail. " + err)
        }
    })
})