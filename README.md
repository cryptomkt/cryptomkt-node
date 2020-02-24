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

**Using the functions**

```javascript
async function example(){

    // Method 1: standard promise (Then)
    client.getMarkets()
    .then((obj) => {
        const data = obj.data;
        console.log(data);
    }).catch((err) => {
        console.error(err);
    })

    // Method 2: Await promise
    try {
        let result = await client.getMarkets();
        console.log(result);
    } catch (e){
        console.error(err);
    }

    // Method 3: Callback
    client.getMarkets(function(error, result){
        if(error){
            console.error(err);
            return;
        }
        console.log(result);
    })
}

example();
```
***Expected output***
```javascript
//Any of the 3 ways to call the function should return an output like this
response: {
    status: 'success',
    data: [
      'ETHCLP', 'ETHARS', 'ETHEUR',
      'ETHBRL', 'ETHMXN', 'XLMCLP',
      'XLMARS', 'XLMEUR', 'XLMBRL',
      'XLMMXN', 'BTCCLP', 'BTCARS',
      'BTCEUR', 'BTCBRL', 'BTCMXN',
      'EOSCLP', 'EOSARS', 'EOSEUR',
      'EOSBRL', 'EOSMXN'
    ]
  }
````

**Listing available markets**
```javascript
var { Client } = require('cryptomarket');
var client   = new Client({'apiKey': mykey, 'apiSecret': mysecret});

client.getMarkets()
    .then((obj) => {
        const data = obj.data;
			  console.log(data);
    }).catch((err) => {
        console.error(err);
    })
```
***Expected output***
```javascript
[
  'ETHCLP', 'ETHARS', 'ETHEUR',
  'ETHBRL', 'ETHMXN', 'XLMCLP',
  'XLMARS', 'XLMEUR', 'XLMBRL',
  'XLMMXN', 'BTCCLP', 'BTCARS',
  'BTCEUR', 'BTCBRL', 'BTCMXN',
  'EOSCLP', 'EOSARS', 'EOSEUR',
  'EOSBRL', 'EOSMXN'
]
...
```

**Obtain Book**
```javascript
//receives a Js object. "market" and "side" are mandatory (ex: {"market": "XLMCLP","side":"sell"}).
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
//receives a Js object that contains the market. (ex: {"market":"XLMARS"})
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
{
  name: 'John Doe',
  email: 'john.doe@gmail.com',
  rate: BaseModel {
    client: <ref *1> Client {
      baseApiUri: 'https://api.cryptomkt.com/v2/',
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
//receives a Js object. "market","type","side" and "amount" are mandatory. (ex: {"amount": 1, "market": "XLMCLP", "price": 50.5, "type": "limit", "side": "sell"}).
client.createOrder(order, (err, output) => {
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
//receives object array that contains multiple orders. "market","type","side" and "amount" are mandatory. (ex: [{"amount": 1, "market": "XLMCLP", "price": 50.5, "type": "limit", "side": "sell"},{Order2},...]).
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
//receives a Js object that contains the market (ex: {"market":"XLMCLP"})
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
```
**Cancel multiple orders**
```javascript
//receives object array that contains multiple order's IDs (ex: [{"id":"O000001"},{"id":"O000002"},...]).
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
//receives a Js object. "currency", "address", and "amount" are mandatory. (ex: {"currency":'ETH',"address":'0xf2ec...',"amount":0.02}).
client.transfer(transfer, (err, output) => {
   if(err){
   console.log('error');
   }
   console.log(output);
});

```
***Expected output***
```javascript
{ status: 'success', data: '' }
```

**Obtain executed orders**
```javascript
//receives a Js object that contains the market (ex: {"market":"XLMCLP"})
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
//receives a Js object that contains the ID (ex: {"id":"O000005"})
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
      [Order1], [Order2],...
    ],
    buy: [
      [Order1], [Order2],...
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
      requestId: 'OOETHCLP0000000000000000000001',
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
      requestId: 'OOETHCLP0000000000000000000002',
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
candles {
  'buy': {
    '1': [
        [{
      date: '21/02/2020 04:56:00',
      stockId: 'ETHCLP',
      type: 1,
      timeFrame: 1,
      lowPrice: 212060,
      hightPrice: 212060,
      openPrice: 212060,
      closePrice: 212100,
      count: 3,
      volume: 0,
      lastBuyPrice: 217900,
      lastSellPrice: 227220
    }],[Object],...],
  '5': [[Object],[Object],...],
  '15':[[Object],[Object],...],
  '60': [[Object],[Object],...],
  '240':[[Object],[Object],...],
  '1440':[[Object],[Object],...],
  '10080':[[Object],[Object],...],
  '44640':[[Object],[Object],...]
}

'sell':{
  '1':[[Object],...],
  '5':...
},
lastBuyPrice: 218880,lastSellPrice: 227220
}
```

**Receive ticker info**
```javascript
socket.on('ticker', (data) => {
    console.log('ticker', data);
});
```
***Expected Output***
```javascript
ticker {
  EOSARS: {
    BID: 346.95,
    ASK: 364.65,
    delta1d: -13.04511278195489,
    delta7d: -21.928442844284426
  },
  BTCCLP: {
    BID: 7914600,
    ASK: 8038600,
    delta1d: -2.4334319526627217,
    delta7d: -2.1318164956102383
  },
  ETHCLP: {
    BID: 213600,
    ASK: 218880,
    delta1d: 1.0598031794095382,
    delta7d: 0.6692430954849656
  },
  ...
}
```

**Receive balance info**
```javascript
socket.on('balance', (data) => {
    console.log('balance', data);
});
```
***Expected Output***
```javascript
balance {
  ETH: {
    currency: 'ETH',
    countable: '0.0700000000000000000000000000000000000',
    available: '0.0700000000000000000000000000000000000',
    currency_kind: 1,
    currency_name: 'ETH',
    currency_big_name: 'Ether',
    currency_prefix: '',
    currency_postfix: ' ETH',
    currency_decimals: 4
  },
  ...
}
```


**Receive user orders info**
```javascript
socket.on('open-orders', (data) => {
    console.log('open-orders', data);
});
```
***Expected Output***
```javascript
open-orders [
  {
    requestId: 'OOXLMCLP0000000000000000000001',
    tradeId: 'O000001',
    traderId: '2',
    stockId: 'XLMCLP',
    kind: 2,
    type: 2,
    side: 2,
    price: '80.0000000000000000000000000000000000',
    limit: null,
    condition: null,
    flag: 'GENERAL',
    amount: '1.00000000000000000000000000000000000',
    initAmount: '1.00000000000000000000000000000000000',
    dateReceived: 1582301424510
  },
  {Order2},...
]
```

**Receive historical user orders info**
```javascript
socket.on('historical-orders', (data) => {
    console.log('historical-orders', data);
});
```

***Expected Output***
```javascript
historical-orders [
  {
    requestId: 'OOXLMCLP000000000000000000001',
    tradeId: 'O000001',
    traderId: '1',
    stockId: 'XLMCLP',
    kind: 2,
    type: 2,
    side: 2,
    price: '50.5000000000000000000000000000000000',
    limit: null,
    condition: null,
    flag: 'GENERAL',
    amount: '0.00000000000000000000000000000000000',
    initAmount: '1.00000000000000000000000000000000000',
    dateReceived: 1582261738700
  },
  {
    requestId: 'OOXLMCLP000000000000000000002',
    tradeId: 'O0000022',
    traderId: '1',
    stockId: 'XLMCLP',
    kind: 2,
    type: 2,
    side: 2,
    price: '72.0000000000000000000000000000000000',
    limit: null,
    condition: null,
    flag: 'GENERAL',
    amount: '1.00000000000000000000000000000000000',
    initAmount: '1.00000000000000000000000000000000000',
    dateReceived: 1582293930313,
    dateTriggered: null
  },
  ...
  ]
```


**Receive User´s operated volume**
```javascript
socket.on('operated', (data) => {
    console.log('operated', data);
});
```
***Expected Output***
```javascript
operated {
  flag: 'L0',
  threshold: '0.00000000000000000000000000000000000',
  traded: '0.0718085391503182500000000000000000000',
  tk: '0.00680000000000000000000000000000000000',
  mk: '0.00390000000000000000000000000000000000'
}
```

