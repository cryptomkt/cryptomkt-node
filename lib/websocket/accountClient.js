const { AuthClient } = require("./authClient")

/**
 * AccountClient connects via websocket to cryptomarket to get account information of the user. uses SHA256 as auth method and authenticates automatically.
 */
class AccountClient extends AuthClient {
    constructor(apiKey, apiSecret) {
        super(
            "wss://api.exchange.cryptomkt.com/api/2/ws/account", 
            apiKey, 
            apiSecret,
            {
                // transaction
                "unsubscribeTransactions":"transaction",
                "subscribeTransactions":"transaction",
                "updateTransaction":"transaction",
                // balance
                "unsubscribeBalance":"balance", 
                "subscribeBalance":"balance",
                "balance":"balance",
            },
        )
    }

    /**
     * Get the user account balance.
     *
     * https://api.exchange.cryptomkt.com/#request-balance
     * 
     * @return {Promise<[object]>} A Promise of the list of balances of the account. Non-zero balances only
     */
    getAccountBalance() {
        return this.sendById('getBalance')
    }

    /**
     * Get a list of transactions of the account. Accepts only filtering by Datetime
     * 
     * https://api.exchange.cryptomkt.com/#find-transactions
     * 
     * @param {string} currency Currency code to get the transaction history
     * @param {string} sort Optional. a Sort enum type. Sort.ASC (ascending) or Sort.DESC (descending). Default is Sort.DESC. sorting direction
     * @param {string} from Optional. Initial value of the queried interval. As timestamp
     * @param {number} till Optional. Last value of the queried interval. As timestamp
     * @param {number} limit Optional. Trades per query. Defaul is 100. Max is 1000
     * @param {string} offset Optional. Default is 0. Max is 100000
     * @param {boolean} showSenders Optional. If True, show the sender address for payins.
     * @return {Promise<[object]>} A Promise of the list with the transactions in the interval.
     */
    findTransactions(params) {
        return this.sendById('findTransactions', params)
    }

    /**
     * Get a list of transactions of the account. Accepts only filtering by Index.
     *
     * https://api.exchange.cryptomkt.com/#load-transactions
     * 
     * @param {string} currency Currency code to get the transaction history
     * @param {string} sort Optional. a Sort enum type. Sort.ASC (ascending) or Sort.DESC (descending). Default is Sort.ASC. sorting direction
     * @param {string} from Optional. Initial value of the queried interval. As id
     * @param {number} till Optional. Last value of the queried interval. As id
     * @param {number} limit Optional. Trades per query. Defaul is 100. Max is 1000
     * @param {string} offset Optional. Default is 0. Max is 100000
     * @param {boolean} showSenders Optional. If True, show the sender address for payins.
     * @return {Promise<[object]>} A Promise of the list with the transactions in the interval.
     */
    loadTransactions(params) {
        return this.sendById('loadTransactions', params)
    }

    ///////////////////
    // subscriptions //
    ///////////////////

    /**
     * Subscribe to a feed of trading events of the account
     * 
     * https://api.exchange.cryptomkt.com/#subscribe-to-reports
     * 
     * 
     * @param {function} callback A function to call with the feed data. It takes one argument.
     * @return {Promise<Boolean>} A Promise of the subscription result. True if success
     */
    subscribeToTransactions(callback) {
        this.checkDefined({callback})
        return this.sendSubscription('subscribeTransactions', callback)
    }

    /**
     * unsubscribe to the transaction feed.
     * 
     * https://api.exchange.cryptomkt.com/#subscription-to-the-transactions
     * 
     * @return {Promise<Boolean>} A Promise of the unsubscription result. True if success
     */
    unsubscribeToTransactions() {
        return this.sendUnsubscription('unsubscribeTransactions')
    }

    /**
     * Subscribe to a feed of the balances of the account
     * 
     * https://api.exchange.cryptomkt.com/#subscription-to-the-balance
     * 
     * @param {function} callback A function to call with the feed data. It takes one argument.
     * @return {Promise<Boolean>} A Promise of the subscription result. True if success
     */
     subscribeToBalance(callback) {
        this.checkDefined({callback})
        return this.sendSubscription('subscribeBalance', callback)
    }

    /**
     * unsubscribe to the balance feed.
     * 
     * https://api.exchange.cryptomkt.com/#subscription-to-the-balance
     * 
     * @return {Promise<Boolean>} A Promise of the unsubscription result. True if success
     */
    unsubscribeToBalance() {
        return this.sendUnsubscription('unsubscribeBalance')
    }

}

module.exports = {
    AccountClient
}