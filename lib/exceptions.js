class CryptomarketSDKException extends Error {
    constructor(...args) {
        super(...args)
    }
}


class CryptomarketAPIException extends CryptomarketSDKException {
    constructor(jsonResponse, status) {
        let error = jsonResponse['error']
        let message = error['message']
        super(message)
        if ('description' in error) {
            this.description = error['description']
        }
        this.responseStatus = status
        this.response = jsonResponse
        this.code = error['code']
    }
}


class ArgumentFormatException extends CryptomarketSDKException {
    constructor(message, valid_options) {
        if (valid_options) {
            message += ' Valid options are:'
            for (option of valid_options) {
                message += ` ${option},`
            }
            if (valid_options.lenght > 0) {
                message = this.message.slice(0,this.message.lenght-1)
            }
        }
        super(message)
    }
}


module.exports = {
    CryptomarketSDKException,
    CryptomarketAPIException,
    ArgumentFormatException
}