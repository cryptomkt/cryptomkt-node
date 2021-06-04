# CryptoMarket-javascript
[main page](https://www.cryptomkt.com/)


[sign up in CryptoMarket](https://www.cryptomkt.com/account/register).

# Installation
To install Cryptomarket use npm
```
npm install cryptomarket
```
# Documentation

[The api documentation](https://api.exchange.cryptomkt.com/#about-companyname-api)


# Quick Start

## rest client
```javascript
const { Client } = require('cryptomarket')

// instance a client
let apiKey='AB32B3201'
let api_secret='21b12401'
let client = new Client(apiKey, api_secret)

// get currencies
let currencies = await client.getCurrencies()

// get order books
let orderBook = await client.getOrderBook('EOSETH')

// get your account balances
let accountBalance = await client.getAccountBalance()

// get your trading balances
let tradingBalance = await client.getTradingBalance()

// move balance from account to trading
let result = await client.transferMoneyFromAccountBalanceToTradingBalance('ETH', '3.2')

// get your active orders
let orders = await client.getActiveOrders('EOSETH')

// create a new order
let newOrder = await client.createOrder({'symbol':'EOSETH', 'side':'buy', 'quantity':'10', 'price':'10'})
```

## websocket client
There are three websocket clients, one for public request (WSPublicClient), one for trading request (WSTradingClient) and one for the account requests (WSAccountClient).

Clients work with promises

Clients must be connected before any request. Authentication for WSTradingClient and WSAccountClient is automatic.

```javascript
const { WSPublicClient, WSTradingClient, WSAccountClient} = require('cryptomarket')

let publicClient = new WSPublicClient()
await publicClient.connect()

// get currencies
await publicClient.getCurrencies()

let apiKey='AB32B3201'
let apiSecret='21b12401'
let tradingClient = new WSTradingClient(apiKey, apiSecret)

await tradingClient.connect()

// get your trading balance
let balance = await tradingClient.getTradingBalance()

// get your active orders
let activeOrders = await tradingClient.getActiveOrders()

await tradingClient.createOrder({
    clientOrderId:"qqwe123qwe", 
    symbol:'EOSETH', 
    side:'buy', 
    quantity:'10',
    price:'10'
})

let accountClient = new WSAccountClient(apiKey, apiSecret)
await accountClient.connect()

// get your account balance
let accBalance = await accountCilent.getAccountBalance()
```
### subscriptions

all subscriptions take a callback argument to call with each feed of the subscription

```javascript

// callback is for the subscription feed
function callback(feed) {
    // handle feed
    console.log(feed)
}

await publicClient.subscribeToOrderBook('EOSETH', callabck)


await accountClient.subscribeToTransactions(callback)
```

## error handling

```javascript

{ CryptomarketSDKException, Client, WSPublicClient } = require('cryptomarket')
// exceptions derive from the CryptomarketSDKException class.

client = new Client()
// catch a failed transaction
try {
    order = client.createOrder({
        'symbol':'EOSETHH',  // non existant symbol
        'side':'sell',
        'quantity':'10', 
        'price':'10'})
} catch (error) {
    console.log(error)
}

wsclient = new WSPublicClient()
await wsclient.connect()

// catch a missing argument
try {
    await wsclient.subscribeToOrderbook('ETHBTC') // needs a callback
} catch (error) {
    console.log(error)
}

// also catches forwarded errors from the cryptomarket exchange server
try {
    let trades = await wsclient.getTrades("abcde", myCallback) // not a real symbol
} catch (err) {
    console.log(err)
}
```

# Checkout our other SDKs
<!-- agregar links -->
python sdk

java sdk

go sdk

ruby sdk
