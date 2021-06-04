var bigdecimal = require("bigdecimal");

// orderbook states
const UPDATING = 0
const WAITING = 1
const BROKEN = 2

// ordering of side of orderbook
const ASCENDING = 3
const DESCENDING = 4

class OrderbookCache {

    constructor() {
        this.orderbooks = new Object()
        this.orderbookStates = new Object() // one of the three: UPDATING, WAITING, BROKEN
    }

    update(method, key, updateData) {
        switch (method) {
        case 'snapshotOrderbook':
            this.orderbookStates[key] = UPDATING
            this.orderbooks[key] = updateData
            break
        case 'updateOrderbook':
            if (this.orderbookStates[key] !== UPDATING) return
            let oldOrderbook = this.orderbooks[key]
            if (updateData['sequence'] - oldOrderbook['sequence'] != 1) {
                this.orderbookStates[key] = BROKEN
                return
            }
            oldOrderbook['sequence'] = updateData['sequence']
            oldOrderbook['timestamp'] = updateData['timestamp']
            if ('ask' in updateData) {
                oldOrderbook['ask'] = this.updateBookSide(oldOrderbook['ask'], updateData['ask'], ASCENDING)
            }
            if ('bid' in updateData) {
                oldOrderbook['bid'] = this.updateBookSide(oldOrderbook['bid'], updateData['bid'], DESCENDING)
            }
            break
        }
    }

    updateBookSide(oldList, updateList, sortDirection) {
        let newList = []
        let oldEntry
        let oldIdx = 0
        let updateEntry
        let updateIdx = 0
        let order
        while (oldIdx < oldList.length && updateIdx < updateList.length) {
            updateEntry = updateList[updateIdx]
            oldEntry = oldList[oldIdx]
            order = this.priceOrder(oldEntry, updateEntry, sortDirection)
            if (order == 0) {
                if (!this.zeroSize(updateEntry)) newList.push(updateEntry)
                updateIdx++
                oldIdx++
            } else if (order == 1) {
                newList.push(oldEntry)
                oldIdx++
            } else {
                newList.push(updateEntry)
                updateIdx++
            }
        }
        if (updateIdx == updateList.length) {
            for (let idx = oldIdx; idx < oldList.length; idx++) {
                oldEntry = oldList[idx]
                newList.push(oldEntry)
            }
        }
        if (oldIdx == oldList.length) {
            for (let idx = updateIdx; idx < updateList.length; idx++) {
                updateEntry = updateList[idx]
                if (!this.zeroSize(updateEntry)) newList.push(updateEntry)
            }
        } 
        return newList
    }

    zeroSize(entry) {
        let size = new bigdecimal.BigDecimal(entry['size'])
        return size.compareTo(new bigdecimal.BigDecimal('0.00')) == 0
    }

    priceOrder(oldEntry, updateEntry, sortDirection) {
        let oldPrice = new bigdecimal.BigDecimal(oldEntry['price'])
        let updatePrice = new bigdecimal.BigDecimal(updateEntry['price'])
        let direction = oldPrice.compareTo(updatePrice)
        if (sortDirection === ASCENDING) return -direction
        return direction
    }

    getOrderbook(key) {
        return Object.assign({}, this.orderbooks[key]) // a copy
    }

    orderbookWaiting(key) {
        return this.orderbookStates[key] === WAITING
    }

    orderbookBroken(key) {
        return this.orderbookStates[key] === BROKEN
    }

    waitOrderbookSnapshot(key) {
        this.orderbookStates[key] = WAITING
    }
}

module.exports = {
    OrderbookCache
}