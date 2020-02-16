# cryptomkt-node

## Installation

`npm install cryptomarket`

## Quick Start

The first thing you'll need to do is [sign up for cryptomkt](https://www.cryptomkt.com).

## API Key

If you're writing code for your own CryptoMarket account, [enable an API key](https://www.cryptomkt.com/platform/account#api_tab). Next, create a ``Client`` object for interacting with the API:


```javascript
var { Client } = require('cryptomarket');
var client = new Client({'apiKey': mykey, 'apiSecret': mysecret});
```

## Making API Calls

With a `client instance`, you can now make API calls. We've included some examples below.  Each API method returns an ``object`` representing the JSON response from the API.

### Public endpoints

**Listing available markets**

```javascript
var { Client } = require('cryptomarket');
var client   = new Client({'apiKey': mykey, 'apiSecret': mysecret});

client.getMarkets()
    .then((obj) => {
        const data = obj.data;
        data.forEach((market) => {
			console.log(market);
		});
    }).catch((err) => {
        console.error(err);
    })
```
**Obtain Book**
```javascript
//receives a Js dictionary ("market" and "side" are mandatory).
client.getBook(dictionary, (err, output) => {
   if(err){
   console.log('error');
   }
   console.log(output);
});
```
**Obtain ticker info**
```javascript
//receives an object that contains the market (ex: {"market":"XLMARS"})
client.getTicker(market, (err, output) => {
   if(err){
   console.log('error');
   }
   console.log(output);
});
```

### Authenticated endpoints

**Get account info**
```javascript
var { Client } = require('cryptomarket');
var client   = new Client({'apiKey': mykey, 'apiSecret': mysecret});

client.getAccount()
    .then((obj) => {
        const data = obj.data;
        console.log(data);
    }).catch((err) => {
        console.error(err);
    })
```
**Create an order**
```javascript
//receives a Js dictionary ("market","type","side" and "amount" are mandatory).
client.createOrder(order, (err, output) => {
   if(err){
   console.log('error´);
   }
   console.log(output);
});
```
**Create multiple orders**
```javascript
//receives dictionary array that contains multiple orders ("market","type","side" and "amount" are mandatory).
client.createMultiOrders(orders, (err, output) => {
   if(err){
   console.log('error´);
   }
   console.log(output);
});
```
**Obtain active orders**
```javascript
//receives an object that contains the market (ex: {"market":"XLMCLP"})
client.getActiveOrders(market, (err, output) => {
   if(err){
   console.log('error');
   }
   console.log(output);
});
```
**Cancel an order**
```javascript
//receives object that contains the order's ID (ex: {"id":"O000004"}).
client.cancelOrder(order, (err, output) => {
   if(err){
   console.log('error');
   }
   console.log(output);
});
```
**Cancel multiple orders**
```javascript
//receives dictionary array that contains multiple order's IDs (ex: [{"id":"O000001"},{"id":"O000002"},...]).
client.cancelMultiOrders(orders, (err, output) => {
   if(err){
   console.log('error');
   }
   console.log(output);
});
```
**Make a transfer**
```javascript
//receives a Js dictionary ("currency", "address", and "amount" are mandatory).
client.transfer(transfer, (err, output) => {
   if(err){
   console.log('error');
   }
   console.log(output);
});
```

**Obtain executed orders**
```javascript
//receives an object that contains the market (ex: {"market":"BTCCLP"})
client.getExecutedOrders(market, (err, output) => {
   if(err){
   console.log('error');
   }
   console.log(output);
});
```
**Obtain order status**
```javascript
//receives an object that contains the ID (ex: {"id":"O000005"})
client.getOrderStatus(id, (err, output) => {
   if(err){
   console.log('error');
   }
   console.log(output);
});
```
**Obtain account balance**
```javascript
client.getBalance((err, output) => {
    if(err){
        console.log('error');
        return
    }
    console.log(output);
});

```


## Using socket

### Get socket instance

```javascript
var { Client } = require('cryptomarket');
var client = new Client({'apiKey': mykey, 'apiSecret': mysecret});

var socket;
client.socket.connect()
    .then((skt) => {
        socket = skt
    }).catch((err) => {
        console.error(err);
    });

//or

var socket= await client.socket.connect();
```

### Receive socket events

```javascript
// market subscription
socket.subscribe('ETHCLP');

// unsubscribe from market
socket.unsubscribe('ETHCLP');

// with subscription, receive open book info
socket.on('open-book', (data) => {
    console.log('open-book', data);
});

// with subscription, receive historical book info
socket.on('historical-book', (data) => {
    console.log('historical-book', data);
});

// with subscription, receive candles info
socket.on('candles', (data) => {
    console.log('candles', data);
});

// ticker info
socket.on('ticker', (data) => {
    console.log('ticker', data);
});

// balance info
socket.on('balances', (data) => {
    console.log('balances', data);
});

// open user orders info
socket.on('open-orders', (data) => {
    console.log('open-orders', data);
});

// historical user orders info
socket.on('historical-orders', (data) => {
    console.log('historical-orders', data);
});

// user's operated volume
socket.on('operated', (data) => {
    console.log('operated', data);
});
```
