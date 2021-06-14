const { WSAccountClient, Client } = require("../lib/index")
const keys = require("/home/ismael/cryptomarket/apis/keys.json");
const { fail } = require("assert");
const check = require("./test_helpers")

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const second = 1000

describe('Subscribe to transactions', function() {    
    it('should succeed', async function() {
        let wsclient = new WSAccountClient(keys.apiKey, keys.apiSecret)
        let restClient = new Client(keys.apiKey, keys.apiSecret)
        try {
            await wsclient.connect()
            await wsclient.subscribeToTransactions((feed) => {
                if (!check.goodTransaction(feed)) fail("not a good transaction")
            })
            await timeout(3 * second)
            await restClient.transferMoneyFromAccountBalanceToTradingBalance("EOS", "0.01")
            await timeout(3 * second)
            await restClient.transferMoneyFromTradingBalanceToAccountBalance("EOS", "0.01")
            await timeout(3 * second)
        } catch (err) {
            fail("should not fail. " + err)
        }
        wsclient.close()
    })
})



describe('Subscribe to balance', function() {    
    it('should succeed', async function() {
        this.timeout(0)
        let wsclient = new WSAccountClient(keys.apiKey, keys.apiSecret)
        try {
            await wsclient.connect()
            await wsclient.subscribeToBalance((feed) => {
                if (!check.goodBalances(feed)) fail("not a good balance")
            })
            await timeout(3 * second)
        } catch (err) {
            fail("should not fail. " + err)
        }
        wsclient.close()
    })
})