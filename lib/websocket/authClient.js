const CryptoJS = require('crypto-js')
const { WSClientBase } = require("./clientBase")

class AuthClient extends WSClientBase {
    constructor(url, apiKey, apiSecret) {
        super(url)
        this.apiKey = apiKey
        this.apiSecret = apiSecret
    }
    
    async connect() {
        await super.connect()
        await this.authenticate()
    }

    makeNonce(length) {
        let result = []
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let charactersLength = characters.length
        for (let i = 0; i < length; i++ ) {
            result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
        }
        return result.join('')
    }

    /**
     * Authenticates the websocket
     * 
     * https://api.exchange.cryptomkt.com/#socket-session-authentication
     * 
     * @param {function} [callback] Optional. A function to call with the result data. It takes two arguments, err and result. err is None for successful calls, result is None for calls with error: callback(err, result)
     * 
     * @return The transaction status as result argument for the callback.
     */
    authenticate() {
        let nonce = this.makeNonce(30)
        let signature = CryptoJS.HmacSHA256(nonce, this.apiSecret).toString()
        let params = {
            'algo': 'HS256',
            'pKey': this.apiKey,
            'nonce': nonce,
            'signature': signature
        }
        return this.sendById('login', params)
    }
}

module.exports = {
    AuthClient
}