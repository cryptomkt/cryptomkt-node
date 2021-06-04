const { PublicClient } = require("../lib/websocket/publicClient")
const { fail } = require("assert");
const check = require("./test_helpers")
const { ArgumentFormatException, CryptomarketAPIException, CryptomarketSDKException } = require('../lib/exceptions')

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const second = 1000
const minute = 60 * second

class TimeFlow {
    constructor() {
        this.oldTimestamp = null
    }

    checkNextTimestamp(timestamp) {
        let dtimestamp = new Date(timestamp)
        let goodFlow = true
        if (this.oldTimestamp && this.oldTimestamp.getTime() > dtimestamp.getTime()) {
            goodFlow = false
        }
        this.oldTimestamp = dtimestamp
        return goodFlow
    }
}

class SequenceFlow {
    constructor() {
        this.lastSequence = null
    }
    
    checkNextSequence(sequence) {
        let goodFlow = true
        if (this.sequence && sequence - this.lastSequence != 1) {
            console.log(`failing time: ${Date.now()}`)
            console.log(`last: ${this.lastSequence}\tnew: ${sequence}`)
            goodFlow = false
        }
        this.lastSequence = sequence
        return goodFlow
    }
}

function handleErr(err) {
    if (err instanceof CryptomarketAPIException) {
        fail("api exception. " + err)
    } else if (err instanceof ArgumentFormatException) {
        fail("argument format exception." + err)
    } else if (err instanceof CryptomarketSDKException) {
        fail("sdk exception. " + err)
    } else {
        fail("exception. " + err)
    }
}


describe('missing callback', function() {    
    it('should succeed', async function() {
        this.timeout(0)
        let wsclient = new PublicClient()
        try {
            await wsclient.connect()
            await wsclient.subscribeToOrderbook('ETHBTC') // needs a callback
            fail("missing callback")
        } catch (error) {
        }
        wsclient.close()
    })
})


// describe('Subscribe to ticker', function() {    
//     it('should succeed', async function() {
//         this.timeout(0)
//         let wsclient = new PublicClient()
//         let checker = new TimeFlow()
//         try {
//             await wsclient.connect()
//             await wsclient.subscribeToTicker('EOSETH', (ticker) => {
//                 if (!checker.checkNextTimestamp(ticker.timestamp)) fail()
//                 console.log("ticker: " + Date.now())
//                 console.log(ticker)
//             })
//             await timeout(2 * minute)

//             console.log('unsubcribing')
//             await wsclient.unsubscribeToTicker('EOSETH')
//             console.log('unsubscribed')
//             await timeout(5 * second)
//         } catch (err) {
//             handleErr(err)
//         }      
//         wsclient.close()
//     })
// })

// describe('Subscribe to orderbook', function() {    
//     it('should succeed', async function() {
//         this.timeout(0)
//         checker = new SequenceFlow()
//         let wsclient = new PublicClient()
//         try {
//             await wsclient.connect()
//             console.log("connected")
//         } catch (err) {
//                 console.log("failed to connect")
//                 handleErr(err)
//         } try {
//             console.log(`start time: ${Date.now()}`)
//             await wsclient.subscribeToOrderbook('EOSETH', (ob) => {
//                 checker.checkNextSequence(ob.sequence)
//                 for (let side of [ob.bid, ob.ask]) {
//                     for ({price, size} of side) {
//                         if (size === '0.00') fail('bad book')
//                     }
//                 }
//                 if (!check.goodOrderbook(ob)) fail( "should be a good orderbook")
//             })
//             await timeout(5 * minute)
//             console.log('unsubcribing')
//             await wsclient.unsubscribeToOrderbook('EOSETH')
//             console.log("unsubscribed")
//             await timeout(5 * second)
//         } catch (err) {
//             handleErr(err)
//         }
//         wsclient.close()
//     })
// })

// describe('Subscribe to trades', function() {    
//     it('should succeed', async function() {
//         this.timeout(0)
//         let wsclient = new PublicClient()
//         try {
//             await wsclient.connect()
//             wsclient.subscribeToTrades('ETHBTC', 2, (trades) => {
//                 console.log("trades: " + Date.now())
//                 console.log(trades)
//                 for(trade of trades) if(!check.goodPublicTrade(trade)) fail("not a good trade")
//             })
//             await timeout(2 * minute)
//             console.log("unsubcribing")
//             wsclient.unsubscribeToTrades('ETHBTC')
//             console.log("unsubscribed")
//             await timeout(5 * second)
//         } catch (err) {
//             handleErr(err)
//         }
//         wsclient.close()
//     })
// })

// describe('Subscribe to candles', function() {    
//     it('should succeed', async function() {
//         this.timeout(0)
//         let wsclient = new PublicClient()
//         try {
//             await wsclient.connect()
//             await wsclient.subscribeToCandles('ETHBTC', 'M1', null, (candles) => {
//                 console.log("candles: " + Date.now())
//                 if (!check.goodCandleList(candles)) fail("not good")
//             })
//             await timeout(2 * minute)
//             console.log('unsubcribing')
//             wsclient.unsubscribeToCandles('ETHBTC', 'M1')
//             console.log("unsubscribed")
//             await timeout(5 * second)
//         } catch (err) {
//             handleErr(err)
//         }
//         wsclient.close()
//     })
// })