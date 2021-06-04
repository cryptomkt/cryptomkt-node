const { WSAccountClient } = require("../lib/index")
const keys = require("../../keys.json");
const { fail } = require("assert");
const check = require("./test_helpers");

describe('get account balance', function() {    
    it('should succeed', async function() {
        this.timeout(0)
        let wsclient = new WSAccountClient(keys.apiKey, keys.apiSecret)
        try {
            await wsclient.connect()
            balance = await wsclient.getAccountBalance()
            if (!check.goodBalances(balance)) fail("sould be good")
        } catch (err) {
            fail("should not fail. " + err)
        }
        wsclient.close()
    })
}) 


describe('find transactions', function() {    
    it('should succeed', async function() {
        this.timeout(0)
        let wsclient = new WSAccountClient(keys.apiKey, keys.apiSecret)
        try {
            await wsclient.connect()
            transactions = await wsclient.findTransactions({currency:"EOS", limit:3})
            for (let transaction of transactions) {
               if (!check.goodTransaction(transaction)) fail("sould be good")
            }
        } catch (err) {
            fail("should not fail. " + err)
        }
        wsclient.close()
    })
}) 


describe('load transactions', function() {    
    it('should succeed', async function() {
        this.timeout(0)
        let wsclient = new WSAccountClient(keys.apiKey, keys.apiSecret)
        try {
            await wsclient.connect()
            transactions = await wsclient.loadTransactions({currency:"EOS", limit:3, showSenders:true})
            for (let transaction of transactions) {
               if (!check.goodTransaction(transaction)) fail("sould be good")
            }
        } catch (err) {
            fail("should not fail. " + err)
        }
        wsclient.close()
    })
}) 