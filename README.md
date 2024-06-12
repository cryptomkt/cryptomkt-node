# CryptoMarket-javascript

[main page](https://www.cryptomkt.com/)

[sign up in CryptoMarket](https://www.cryptomkt.com/account/register).

# Installation

To install Cryptomarket use npm

```
npm install cryptomarket@3.2.0
```

# Documentation

This sdk makes use of the [api version 3](https://api.exchange.cryptomkt.com) of cryptomarket.

# Quick Start

## rest client

```typescript
const { Client } = require("cryptomarket");

// instance a client
const apiKey = "AB32B3201";
const apiSecret = "21b12401";
const client = new Client(apiKey, apiSecret);

// get currencies
const currencies = await client.getCurrencies();

// get order books
const orderBook = await client.getOrderBook("EOSETH");

// get your account balances
const accountBalances = await client.getWalletBalances();

// get your trading balances
const tradingBalances = await client.getSpotTradingBalances();

// move balance from wallet to spot trading
const result = await client.transferBetweenWalletAndExchange({
  currency: "EOS",
  amount: "3.2",
  source: Account.Wallet,
  destination: Account.Spot,
});

// get your active orders
const activeOrders = await client.getAllActiveSpotOrders("EOSETH");

// create a new order
const newOrder = await client.createOrder({
  symbol: "EOSETH",
  side: "buy",
  quantity: "10",
  price: "10",
});
```

## websocket client

There are three websocket clients, the market data client, the spot trading client and the wallet client.
The market data client requires no authentication, while the spot trading client and the wallet client do require it.

All websocket methods return promises. Subscriptions also take in a function of two parameters, the notification data, and the notification type. The notification type is of type NOTIFICATION_TYPE, and is either SNAPSHOT, NOTIFICATION or DATA.

The documentation of a specific subscriptions explains with of this types of
notification uses.

### MarketDataClient

Example of use of the market data client

```typescript
// instantiate a market data client
const wsclient = new WSMarketDataClient();

// make a partial orderbook subscription

//    make subscription
await marketDataClient.subscribeToPartialOrderBook(
  callback:(notification, type) => {
    if (type === NOTIFICATION_TYPE.DATA) {
      System.out.println("this subscription only recieves data notifications");
    }
    for (const symbol in notification) {
      console.log(symbol);
      const orderbook = notification[symbol];
      console.log(orderbook);
    }
  },
  params: {
    speed: ORDER_BOOK_SPEED._100_MS,
    depth: DEPTH._5,
    symbols: ["EOSETH", "ETHBTC"],
  }
);


```

### SpotTradingClient

Example of use of the spot trading client

```typescript
const apiKey = "AB32B3201";
const apiSecret= "21b12401";

// instantiate a spot trading websocket client with a window of 10 seconds
const wsclient = new WSTradingClient(apiKey, apiSecret, 10_000);

// connect the client (and authenticate it automatically)
await wsclient.connect();

// get all the spot trading balances
const balanceList = await tradingClient.getSpotTradingBalances()
console.log(balanceList);


let clientOrderID = Math.floor(Date.now() / 1000).toString();
// make a spot order
const report = await tradingClient.createSpotOrder({
  clientOrderId: clientOrderID,
  symbol: "EOSETH",
  side: "sell",
  quantity: "0.01",
  price: "1000",
}
console.log(report);
```

### WalletClient

Example of use of the wallet client

```typescript
// instantiate a wallet websocket client with a default window of 10 seconds
const wsclient = new WSWalletClient(keys.apiKey, keys.apiSecret);

// get a list of transactions
const transactionList = await walletClient.getTransactions({
  currencies: ["EOS"],
  limit: 3,
});
console.log(transactionList);

// subscribe to a feed of transactions
await walletClient.subscribeToTransactions((notification, type) => {
  if (type === NOTIFICATION_TYPE.UPDATE) {
    console.log("this subscription only recieves update notifications");
  }
  console.log(notification);
});
```

## error handling

```typescript

{ CryptomarketSDKException, Client, WSMarketDataClient } = require('cryptomarket')
// exceptions derive from the CryptomarketSDKException class.

const client = new Client()
// catch a failed transaction
try {
    const order = await client.createOrder({
        'symbol':'EOSETHH',  // non existant symbol
        'side':'sell',
        'quantity':'10',
        'price':'10'})
} catch (error) {
    console.log(error)
}

const wsclient = new WSMarketDataClient()
await wsclient.connect();

// catch missing arguments
try {
    await wsclient.subscribeToMiniTickers()
} catch (error) {
    console.log(error)
}
```

# Constants

All constants used for calls are in the `constants` module.

# Checkout our other SDKs

[python sdk](https://github.com/cryptomkt/cryptomkt-python)

[java sdk](https://github.com/cryptomkt/cryptomkt-java)

[go sdk](https://github.com/cryptomkt/cryptomkt-go)

[ruby sdk](https://github.com/cryptomkt/cryptomkt-ruby)
