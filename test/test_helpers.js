// defined checks if a key is present in a dict, and if its value is str, checks if its defined.
// return false when the key is not present or when the value is an empty string, return true otherwise.
function defined(anObject, key) {
    if (!(key in anObject)) return false
    val = anObject[key]
    if ((typeof val === 'string' || val instanceof String) && val === "") return false
    return true
}

// goodObject checks all of the values in the fields list to be present in the dict, and if they are 
// present, check the defined() condition to be true. if any of the fields fails to be defined(), then 
// this function returns false
function goodObject(anObject, fields) {
    if (!(anObject)) return false
    if (!(typeof anObject === 'object' || anObject instanceof Object)) return false
    for (field of fields) {
        if (!defined(anObject, field)) return false
    }
    return true
}


// goodCurrency checks the precence of every field in the currency dict
function goodCurrency(currency) {
    return goodObject(currency,
        [
            "id",
            "fullName",
            "crypto",
            "payinEnabled",
            "payinPaymentId",
            "payinConfirmations",
            "payoutEnabled",
            "payoutIsPaymentId",
            "transferEnabled",
            "delisted",
            // "precisionPayout",
            // "precisionTransfer",
        ]
    )
}

// goodSymbol check the precence of every field in the symbol dict
function goodSymbol(symbol) {
    return goodObject(symbol, 
        [
            'id',
            'baseCurrency',
            'quoteCurrency',
            'quantityIncrement',
            'tickSize',
            'takeLiquidityRate',
            'provideLiquidityRate',
            // 'feeCurrency'
        ]
    )
}


// goodTicker check the precence of every field in the ticker dict
function goodTicker(ticker) {
    return goodObject(ticker, 
        [
            "symbol",
            "ask",
            "bid",
            "last",
            "low",
            "high",
            "open",
            "volume",
            "volumeQuote",
            "timestamp",
        ]
    )
}


// goodPublicTrade check the precence of every field in the trade dict
function goodPublicTrade(trade) {
    return goodObject(trade, 
        [
            "id",
            "price",
            "quantity",
            "side",
            "timestamp",
        ]
    )
}

// goodOrderbookLevel check the precence of every field in the level dict
function goodOrderbookLevel(level) {
    return goodObject(level, 
        [
            "price",
            "size",
        ]
    )
}

// goodOrderbook check the precence of every field in the orderbook dict
// and the fields of each level in each side of the orderbook
function goodOrderbook(orderbook) {
    goodOrderbook = goodObject(orderbook, 
        [
            "symbol",
            "timestamp",
            // "batchingTime",
            "ask",
            "bid",
        ]
    )
    if (!goodOrderbook) return false

    for (level of orderbook["ask"]) {
        if (!goodOrderbookLevel(level)) return false
    }
    for (level of orderbook["bid"]) {
        if (!goodOrderbookLevel(level)) return false
    }
    return true
}


// goodCandle check the precence of every field in the candle dict
function goodCandle(candle) {
    return goodObject(candle, 
        [
            "timestamp",
            "open",
            "close",
            "min",
            "max",
            "volume",
            "volumeQuote",
        ]
    )
}


// goodCandleList check the precence of every field of the candle dict in every candle of the candle list.
function goodCandleList(candles) {
    for (candle of candles) {
        if (!goodCandle(candle)) return false
    }
    return true
}


// goodBalances check the precence of every field on every balance dict
function goodBalances(balances) {
    for (balance of balances) {
        goodBalance = goodObject(balance, 
            [
                "currency",
                "available",
                "reserved",
            ]
        )
        if (!goodBalance) return false
    }
    return true
}


// goodOrder check the precence of every field in the order dict
function goodOrder(order) {
    return goodObject(order, 
        [
            "id",
            "clientOrderId",
            "symbol",
            "side",
            "status",
            "type",
            "timeInForce",
            "quantity",
            "price",
            "cumQuantity",
            // "postOnly", // does not appears in the orders in orders history
            "createdAt",
            "updatedAt",
        ]
    )
}


// goodOrderList check the precence of every field of the order dict in every order of the order list.
function goodOrderList(orders) {
    for (order of orders){
        if (!goodOrder(order)) return false
    }
    return true
}

// goodTrade check the precence of every field in the trade dict
function goodTrade(trade) {
    return goodObject(trade, 
        [
            "id",
            "orderId",
            "clientOrderId",
            "symbol",
            "side",
            "quantity",
            "price",
            "fee",
            "timestamp",
        ]
    )
}



// goodTransaction check the precence of every field in the transaction dict
function goodTransaction(transaction) {
    return goodObject(transaction, 
        [
            "id",
            "index",
            "currency",
            "amount",
            // "fee",
            // "address",
            // "hash",
            "status",
            "type",
            "createdAt",
            "updatedAt",
        ]
    )
}

function goodReport(report) {
    return goodObject(report, 
        [
            "id",
            "clientOrderId",
            "symbol",
            "side",
            "status",
            "type",
            "timeInForce",
            "quantity",
            "price",
            "cumQuantity",
            // "postOnly", // does not appears in the orders in orders history
            "createdAt",
            "updatedAt",
            "reportType",
        ]
    )
}

module.exports = {
    goodBalances,
    goodCandle,
    goodCandleList,
    goodCurrency,
    goodOrder,
    goodOrderList,
    goodOrderbook,
    goodPublicTrade,
    goodSymbol,
    goodTicker,
    goodTrade,
    goodTransaction,
    goodReport
}