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
***Expected output***
```javascript
"ETHCLP"
"ETHARS"
"ETHEUR"
"ETHBRL"
"ETHMXN"
"BTCCLP"
"BTCARS"
"BTCEUR"
"BTCBRL"
"BTCMXN"
...
```

**Obtain Book**
```javascript
//receives a Js dictionary ("market" and "side" are mandatory, ex: {"market": "XLMCLP","side":"sell"}).
client.getBook(dictionary, (err, output) => {
   if(err){
   console.log('error');
   }
   console.log(output);
});
```
***Expected output***
```javascript
{
   "status": "success",
   "pagination": {
      "previous": 0,
      "limit": 20,
      "page": 0,
      "next": "null"
   },
   "data": [
    BaseModel {
      client: [Client],
      price: '59.8',
      amount: '20025.749',
      timestamp: '2020-02-21T04:16:07.789000'
    },
    BaseModel {
      client: [Client],
      price: '59.8',
      amount: '29736.0992',
      timestamp: '2020-02-21T04:20:30.925000'
    },
    BaseModel {
      client: [Client],
      price: '59.8',
      amount: '24229.3228',
      timestamp: '2020-02-21T04:32:26.686000'
    }
    ...    
   	]
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
***Expected output***
```javascript
{
  "status": "success",
  "data": [
    {
      client: [Client],
      timestamp: '2020-02-21T04:52:17.416448',
      market: 'XLMCLP',
      bid: '58.2',
      ask: '68.4',
      last_price: '59.75',
      low: '56',
      high: '58.3',
      volume: '87572.82220768983161'
    }
  ]
} 
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
***Expected output***
```javascript
output example:
{
  name: 'John Doe',
  email: 'john.doe@gmail.com',
  rate: BaseModel {
    client: <ref *1> Client {
      baseApiUri: 'https://beta.cryptomkt.com/v2/',
      strictSSL: true,
      timeout: 5000,
      apiKey: 'FS24FJ7',
      apiSecret: 'SFT23GSD',
      api: true,
      socket: [Socket]
    },
    market_maker: '0.0039',
    market_taker: '0.0068'
  },
  bank_accounts: [
    BaseModel {
      client: [Client],
      id: 00001,
      bank: 'BANCO DE CHILE - EDWARDS',
      description: '',
      country: 'CL',
      number: '1234567890',
      dv: null,
      agency: null,
      clabe: ''
    }
  ]
}
```
**Create an order**
```javascript
//receives a Js dictionary ("market","type","side" and "amount" are mandatory, ex: {"amount": 1, "market": "XLMCLP",  "price": 50.5, "type": "limit", "side": "sell"}).
client.createOrder(order, (err, output) => {
   if(err){
   console.log('error´);
   }
   console.log(output);
});
```
***Expected output***
```javascript
response: {
    status: 'success',
    data: {
      id: 'O000001',
      amount: [Object],
      price: '50.5',
      stop: null,
      avg_execution_price: '0',
      market: 'XLMCLP',
      type: 'limit',
      side: 'sell',
      fee: '0',
      created_at: '2020-02-21T05:08:58.700000',
      updated_at: '2020-02-21T05:08:58.768314',
      status: 'filled'
    }
  }
```


**Create multiple orders**
```javascript
//receives dictionary array that contains multiple orders ("market","type","side" and "amount" are mandatory).
client.createMultiOrders(orders, (err, output) => {
   if(err){
   console.log('error');
   }
   console.log(output);
});
```
***Expected output***
```javascript
response: {
	status: 'success',
	data: {
	created: [{Order1},{Order2},...],
	not_created: [] 
    }
  }
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
***Expected output***
```javascript
{
  status: 'success',
  pagination: { page: 0, limit: 20, next: null, previous: null },
  data: [
    BaseModel {
      client: [Client],
      id: 'O000001',
      amount: [BaseModel],
      price: '72',
      stop: null,
      avg_execution_price: '0',
      market: 'XLMCLP',
      type: 'limit',
      side: 'sell',
      fee: '0',
      created_at: '2020-02-21T14:05:30.313000',
      updated_at: '2020-02-21T14:05:30.334726',
      status: 'queued'
    },
    BaseModel {
      client: [Client],
      id: 'O000002',
      amount: [BaseModel],
      price: '71',
      stop: null,
      avg_execution_price: '0',
      market: 'XLMCLP',
      type: 'limit',
      side: 'sell',
      fee: '0',
      created_at: '2020-02-21T14:05:30.216000',
      updated_at: '2020-02-21T14:05:30.245189',
      status: 'queued'
    }
    ...
    ]
    }
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
***Expected output***
```javascript
response: {
    status: 'success',
    data: {
      id: 'O000004',
      amount: [Object],
      price: '72',
      stop: null,
      avg_execution_price: '0',
      market: 'XLMCLP',
      type: 'limit',
      side: 'sell',
      fee: '0',
      created_at: '2020-02-21T14:05:30.313000',
      updated_at: '2020-02-21T14:24:08.897689',
      status: 'cancelled'
    }
  }
}
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
***Expected output***
```javascript
response: {
status: 'success',
data: { canceled: [{Order1},{Order2},...], not_canceled: [] } }
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
***Expected output***
```javascript

```

**Obtain executed orders**
```javascript
//receives an object that contains the market (ex: {"market":"XLMCLP"})
client.getExecutedOrders(market, (err, output) => {
   if(err){
   console.log('error');
   }
   console.log(output);
});
```
***Expected output***
```javascript
{
   "status": "success",
   "pagination": {
      "previous": "null",
      "limit": 20,
      "page": 0,
      "next": "null"
   },
   "data": [
      client: [Client],
      id: 'O000003',
      amount: {
            "original": "1.4044",
            "remaining": "1.4044"
            },
      price: '50.5',
      stop: null,
      avg_execution_price: '58',
      market: 'XLMCLP',
      type: 'limit',
      side: 'sell',
      fee: '0.394',
      created_at: '2020-02-21T05:08:58.700000',
      updated_at: '2020-02-21T05:08:59.549126',
      status: 'filled',
      fills: [Array]
   ]
}
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
***Expected output***
```javascript
response: {
    status: 'success',
    data: {
      id: 'O000005',
      amount: [Object],
      price: '71',
      stop: null,
      avg_execution_price: '0',
      market: 'XLMCLP',
      type: 'limit',
      side: 'sell',
      fee: '0',
      created_at: '2020-02-21T14:05:30.216000',
      updated_at: '2020-02-21T14:05:30.245189',
      status: 'queued',
      fills: []
    }
  }
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

***Expected Output***
```javascript
{
   "status": "success",
   "data": [
      {
         "available": "1203.1231",
         "wallet": "CLP",
         "balance": "120347"
      },
      {
         "available": "10.3399",
         "wallet": "ETH",
         "balance": "11.3399"
      },
      ...
   ]
}
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

**Market subscription**
```javascript
socket.subscribe('ETHCLP');
```

**Unsubscribe from market**
```javascript
socket.unsubscribe('ETHCLP');
```

**Receive open book info**
```javascript
// Subscription required*
socket.on('open-book', (data) => {
    console.log('open-book', data);
});
```
***Expected Output***
```javascript
open-book {
  ETHCLP: {
    sell: [
      [Order], [Order],...
    ],
    buy: [
      [Order], [Order],...
    ]
  }
}
```

**Receive Historical book info**
```javascript
// Subscription required*
socket.on('historical-book', (data) => {
    console.log('historical-book', data);
});
```
***Expected Output***
```javascript
[
{
      requestId: 'OOETHCLP0000249351582205310631',
      tradeId: 'O232937',
      stockId: 'ETHCLP',
      kind: 1,
      type: 2,
      side: 1,
      price: '204820.000000000000000000000000000000',
      limit: null,
      condition: null,
      flag: 'GENERAL',
      amount: '0.00000000000000000000000000000000000',
      initAmount: '2.07330000000000000000000000000000000',
      dateReceived: 1582205310697,
      executed_price: '204820.000000000000000000000000000000',
      executed_amount: '2.07330000000000000000000000000000000',
      executed_date: 1582205310745
    },
    {
      requestId: 'OOETHCLP0000080811582204925567',
      tradeId: 'O232665',
      stockId: 'ETHCLP',
      kind: 1,
      type: 2,
      side: 1,
      price: '201540.000000000000000000000000000000',
      limit: null,
      condition: null,
      flag: 'GENERAL',
      amount: '1.66960000000000000000000000000000000',
      initAmount: '1.92640000000000000000000000000000000',
      dateReceived: 1582204925623,
      executed_price: '201260.000000000000000000000000000000',
      executed_amount: '0.256800000000000000000000000000000000',
      executed_date: 1582204925645
    }
  ]
```

**Receive candles info**
```javascript
// Subscription required*
socket.on('candles', (data) => {
    console.log('candles', data);
});
```
***Expected Output***
```javascript

```

**Receive ticker info**
```javascript
socket.on('ticker', (data) => {
    console.log('ticker', data);
});
```
***Expected Output***
```javascript

```

**Receive balance info**
```javascript
socket.on('balances', (data) => {
    console.log('balances', data);
});
```
***Expected Output***
```javascript

```


**Receive user orders info**
```javascript
socket.on('open-orders', (data) => {
    console.log('open-orders', data);
});
```
***Expected Output***
```javascript

```


**Receive historical user orders info**
```javascript
socket.on('historical-orders', (data) => {
    console.log('historical-orders', data);
});
```
***Expected Output***
```javascript

```


**Receive User´s operated volume**
```javascript
socket.on('operated', (data) => {
    console.log('operated', data);
});
```
***Expected Output***
```javascript

```

