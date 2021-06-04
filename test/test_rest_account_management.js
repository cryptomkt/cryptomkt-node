const { Client } = require("../lib/client")
const keys = require("../../keys.json")
const check = require("./test_helpers")
const { fail } = require("assert")

describe('Get deposit crypto address', () => {    
    let client = new Client(keys.apiKey,keys.apiSecret);
    it('should succeed', async function() {
        address = await client.getDepositCryptoAddress('EOS')
        if (!(typeof address === 'object' || address instanceof Object)) fail("should be an object")
        if (!('address' in address)) fail("should have address")
        if (address['address'] === "") fail("should have address")
    })
})

describe('Transfer between trading and account balances', () => {    
    let client = new Client(keys.apiKey,keys.apiSecret);
    it('should succeed', async function() {
        transaction = await client.transferMoneyFromAccountBalanceToTradingBalance("EOS", "0.1")
        if ((typeof transaction === 'string' || transaction instanceof String) && transaction === "") fail("transcation failed")
        transaction = await client.transferMoneyFromTradingBalanceToAccountBalance("EOS", "0.1")
        if ((typeof transaction === 'string' || transaction instanceof String) && transaction === "") fail("transcation failed")
        
    })
})

describe('get transaction history', () => {    
    let client = new Client(keys.apiKey,keys.apiSecret);
    it('should succeed', async function() {
        result = await client.getTransactionHistory("EOS")
        for (transaction of result) {
            if (!check.goodTransaction(transaction)) fail("should be good")
        }
    })
})

describe('check crypto address is mine', () => {    
    let client = new Client(keys.apiKey,keys.apiSecret);
    it('should succeed', async function() {
        result = await client.checkIfCryptoAddressIsMine("words")
        if (!("result" in result)) fail("should have result")
        if (result["result"]) fail("is not mine")
    })
})

describe('estimate withdraw fee', () => {    
    let client = new Client(keys.apiKey,keys.apiSecret);
    it('should succeed', async function() {
        result = await client.getEstimatesWithdrawFee("EOS", "100")
        if (!("fee" in result)) fail("should have fee")
        if (result["fee"] == "") fail("no fee")
    })
})

describe('account balance', () => {    
    let client = new Client(keys.apiKey,keys.apiSecret);
    it('should succeed', async function() {
        result = await client.getAccountBalance()
        if (!check.goodBalances(result)) fail("should be good")
    })
})
