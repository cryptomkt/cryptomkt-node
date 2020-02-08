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
```
