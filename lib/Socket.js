const jsondiffpatch = require('jsondiffpatch').create({});
const socket = require('socket.io-client');
const EventBus = require('js-event-bus');
const _ = require('lodash');

class Socket {
    constructor(client) {
        this.client = client;
        this.eventBus = new EventBus();
        this.urlWorker = 'https://worker.cryptomkt.com';
        this.socket = null;
        this.debugging = true;


        this.currenciesData = null;
        this.balancesData = null;
        this.operatedData = null;
        this.openBookData = {};
        this.historicalBookData = {};
        this.candlesData = {};
        this.boardData = {};
    }

    _deepClone(data) {
        return _.cloneDeep(data);
    }

    _authSocket() {
        this.client._getAuthSocket()
            .then((obj) => {
                if (this.debugging) {
                    console.log('[' + new Date().toUTCString() + '] auth socket success');
                }
                this.socketClient.emit('user-auth', {
                    'uid': obj.data.uid,
                    'socid': obj.data.socid,
                });
            }).catch((err) => {
                if (this.debugging) {
                    console.log('[' + new Date().toUTCString() + '] auth socket', err.toString());
                }
            });
    }

    _reconnect() {
        if (this.debugging) {
            console.log('[' + new Date().toUTCString() + '] socket_reconnect');
        }

        gskt = io.connect(worker, {
            'forceNew': false,
            'reconnectionAttempts': 1,
            'reconnectionDelay': 1000,
            'reconnectionDelayMax': 15000
        });

    }

    _setupGeneralEvents() {
        // Fired upon a successful reconnection.
        this.socketClient.on('reconnect', (attemptNumber) => {
            if (this.debugging) {
                console.log('[' + new Date().toUTCString() + '] Reconnect -> Attempt: ' + attemptNumber);
            }
        });

        // Fired upon an attempt to reconnect.
        this.socketClient.on('reconnect_attempt', (attemptNumber) => {
            if (this.debugging) {
                console.log('[' + new Date().toUTCString() + '] Reconnect attempt -> Attempt: ' + attemptNumber);
            }
        });

        // Fired upon an attempt to reconnect.
        this.socketClient.on('reconnecting', (attemptNumber) => {
            if (this.debugging) {
                console.log('[' + new Date().toUTCString() + '] Reconnecting -> Attempt: ' + attemptNumber);
            }
        });

        // Fired when couldn’t reconnect within reconnectionAttempts.
        this.socketClient.on('reconnect_failed', () => {
            if (this.debugging) {
                console.log('[' + new Date().toUTCString() + '] Reconnect failed');
            }

            setTimeout(() => {
                this._reconnect();
            }, 5000 + getRandomInt(0, 5000));
        });


        // Fired upon a disconnection.
        this.socketClient.on('disconnect', (reason) => {
            if (this.debugging) {
                console.log('[' + new Date().toUTCString() + '] Disconnect -> Reason: ' + reason);
            }

            // the disconnection was initiated by the server, you need to reconnect manually
            // else the socket will automatically try to reconnect
            if (reason === "io server disconnect" || reason === "io client disconnect") {
                setTimeout(() => {
                    this._reconnect();
                }, 5000 + getRandomInt(0, 5000));
            }
        });
    }

    _setupWorkerEvents() {
        // EVENTS
        // =================================================================================================================

        // CURRENCIES
        // -----------------------------------------------------------------------------------------------------------------
        this.socketClient.on('currencies', (data) => {
            if (this.debugging) {
                console.log('[' + new Date().toUTCString() + '] currencies');
            }
            this.currenciesData = data;
            // eventBus.publish('currencies', deepClone(currenciesData.data));
        });

        this.socketClient.on('currencies-delta', (deltas) => {
            if (this.debugging) {
                console.log('[' + new Date().toUTCString() + '] currencies-delta');
            }

            _.forEach(deltas, (delta, index, collection) => {
                if (this.currenciesData["to_tx"] !== delta["from_tx"]) {
                    this.socketClient.emit("currencies");
                    return false;
                }

                var delta_data = delta["delta_data"];
                if (_.isString(delta_data)) {
                    delta_data = JSON.parse(delta_data);
                }

                this.currenciesData["data"] = jsondiffpatch.patch(this.currenciesData["data"], delta_data);
                this.currenciesData["to_tx"] = delta["to_tx"];
                // if (index === collection.length - 1) {
                //     this.eventBus.emit('currencies', null, deepClone(this.currenciesData.data));
                // }
            });
        });

        // BALANCES
        // -----------------------------------------------------------------------------------------------------------------
        this.socketClient.on('balance', (data) => {
            if (this.debugging) {
                console.log('[' + new Date().toUTCString() + '] balance');
            }

            _.forIn(data.data, (value, key) => {
                var currency = _.filter(this.currenciesData.data, {
                    'name': value["currency"]
                })[0];
                value["currency_kind"] = currency["kind"];
                value["currency_name"] = currency["name"];
                value["currency_big_name"] = currency["big_name"];
                value["currency_prefix"] = currency["prefix"];
                value["currency_postfix"] = currency["postfix"];
                value["currency_decimals"] = currency["decimals"];
            });
            this.balancesData = data;
            this.eventBus.emit('balance-fees', null, this._deepClone(this.balancesData.data));
        });

        this.socketClient.on('balance-delta', (deltas) => {
            if (this.debugging) {
                console.log('[' + new Date().toUTCString() + '] balance-delta');
            }

            _.forEach(deltas, (delta, index, collection) => {
                if (this.balancesData["to_tx"] !== delta["from_tx"]) {
                    this.socketClient.emit("balance");
                    return false;
                }

                var delta_data = delta["delta_data"];
                if (_.isString(delta_data)) {
                    delta_data = JSON.parse(delta_data);
                }

                this.balancesData["data"] = jsondiffpatch.patch(this.balancesData["data"], delta_data);
                this.balancesData["to_tx"] = delta["to_tx"];
                if (index === collection.length - 1) {
                    _.forIn(this.balancesData.data, (value, key) => {
                        var currency = _.filter(this.currenciesData.data, {
                            'name': value["currency"]
                        })[0];
                        value["currency_kind"] = currency["kind"];
                        value["currency_name"] = currency["name"];
                        value["currency_big_name"] = currency["big_name"];
                        value["currency_prefix"] = currency["prefix"];
                        value["currency_postfix"] = currency["postfix"];
                        value["currency_decimals"] = currency["decimals"];
                    });

                    this.eventBus.emit('balances', null, this._deepClone(this.balancesData.data));
                }
            });

        });

        this.socketClient.on('operated', (data) => {
            if (this.debugging) {
                console.log('[' + new Date().toUTCString() + '] operated');
            }
            this.operatedData = data;
            this.eventBus.emit('operated', null, this._deepClone(this.operatedData.data));
        });

        this.socketClient.on('operated-delta', (deltas) => {
            if (this.debugging) {
                console.log('[' + new Date().toUTCString() + '] operated-delta');
            }

            _.forEach(deltas, (delta, index, collection) => {
                if (this.operatedData["to_tx"] !== delta["from_tx"]) {
                    this.socketClient.emit("operated");
                    return false;
                }

                var delta_data = delta["delta_data"];
                if (_.isString(delta_data)) {
                    delta_data = JSON.parse(delta_data);
                }

                this.operatedData["data"] = jsondiffpatch.patch(this.operatedData["data"], delta_data);
                this.operatedData["to_tx"] = delta["to_tx"];
                if (index === collection.length - 1) {
                    this.eventBus.emit('operated', null, this._deepClone(this.operatedData.data));
                }
            });
        });

        // OPEN-BOOK
        // -----------------------------------------------------------------------------------------------------------------
        this.socketClient.on('open-book', (data) => {
            if (this.debugging) {
                console.log('[' + new Date().toUTCString() + '] open-book');
            }
            this.openBookData[data["stock_id"]] = data;

            var clean = {};
            clean[data["stock_id"]] = {
                "sell": data.data[2],
                "buy": data.data[1]
            };

            this.eventBus.emit('open-book', null, this._deepClone(clean));
        });

        this.socketClient.on('open-book-delta', (delta) => {
            if (this.debugging) {
                console.log('[' + new Date().toUTCString() + '] open-book-delta');
            }

            var stockId = delta['stock_id'];
            if (_.has(this.openBookData, stockId)) {
                if (this.openBookData[stockId].to_tx !== delta.from_tx) {
                    this.socketClient.emit("open-book", {
                        stockId: stockId
                    });
                    return;
                }

                var delta_data = delta["delta_data"];
                if (_.isString(delta_data)) {
                    delta_data = JSON.parse(delta_data);
                }

                this.openBookData[stockId].data = jsondiffpatch.patch(this.openBookData[stockId]["data"], delta_data);
                this.openBookData[stockId]["to_tx"] = delta["to_tx"];

                var clean = {};
                clean[stockId] = {
                    "sell": this.openBookData[stockId].data[2],
                    "buy": this.openBookData[stockId].data[1]
                };

                this.eventBus.emit('open-book', null, this._deepClone(clean));
            } else {
                this.socketClient.emit("open-book", {
                    stockId: delta['stock_id']
                });
            }
        });

        // HISTORICAL-BOOK
        // -----------------------------------------------------------------------------------------------------------------
        this.socketClient.on('historical-book', (data) => {
            if (this.debugging) {
                console.log('[' + new Date().toUTCString() + '] historical-book');
            }
            var stockId = data["stock_id"];

            this.historicalBookData[stockId] = data;

            var result = {};
            result[stockId] = this.historicalBookData[stockId].data;

            this.eventBus.emit('historical-book', null, this._deepClone(result));
        });

        this.socketClient.on('historical-book-delta', (delta) => {
            if (this.debugging) {
                console.log('[' + new Date().toUTCString() + '] historical-book-delta');
            }

            var stockId = delta['stock_id'];
            if (_.has(this.historicalBookData, stockId)) {
                if (this.historicalBookData[stockId].to_tx !== delta.from_tx) {
                    this.socketClient.emit("historical-book", {
                        stockId: stockId
                    });
                    return;
                }

                var delta_data = delta["delta_data"];
                if (_.isString(delta_data)) {
                    delta_data = JSON.parse(delta_data);
                }

                this.historicalBookData[stockId].data = jsondiffpatch.patch(this.historicalBookData[stockId]["data"], delta_data);
                this.historicalBookData[stockId]["to_tx"] = delta["to_tx"];

                var result = {};
                result[stockId] = this.historicalBookData[stockId].data;

                this.eventBus.emit('historical-book', null, this._deepClone(result));
            } else {
                this.socketClient.emit("historical-book", {
                    stockId: delta['stock_id']
                });
            }
        });

        // CANDLES
        // -----------------------------------------------------------------------------------------------------------------
        this.socketClient.on('candles', (data) => {
            if (this.debugging) {
                console.log('[' + new Date().toUTCString() + '] candles');
            }
            var stockId = data["stock_id"];
            this.candlesData[stockId] = data;

            var result = {};
            result[stockId] = this.candlesData[stockId].data;

            this.eventBus.emit('candles', null, this._deepClone(result));
        });

        this.socketClient.on('candles-delta', (delta) => {
            if (this.debugging) {
                console.log('[' + new Date().toUTCString() + '] candles-delta');
            }

            var stockId = delta['stock_id'];
            if (_.has(this.candlesData, stockId)) {
                if (this.candlesData[stockId].to_tx !== delta.from_tx) {
                    this.socketClient.emit("candles", {
                        stockId: stockId
                    });
                    return;
                }

                var delta_data = delta["delta_data"];
                if (_.isString(delta_data)) {
                    delta_data = JSON.parse(delta_data);
                }

                this.candlesData[stockId].data = jsondiffpatch.patch(this.candlesData[stockId]["data"], delta_data);
                this.candlesData[stockId]["to_tx"] = delta["to_tx"];

                var result = {};
                result[stockId] = this.candlesData[stockId].data;

                this.eventBus.emit('candles', null, this._deepClone(result));
            } else {
                this.socketClient.emit("candles", {
                    stockId: delta['stock_id']
                });
            }
        });

        // BOARD
        // -----------------------------------------------------------------------------------------------------------------
        this.socketClient.on('board', (data) => {
            if (this.debugging) {
                console.log('[' + new Date().toUTCString() + '] board');
            }

            this.boardData = data;
            this.eventBus.emit('ticker', null, this._deepClone(this.boardData.data));
        });

        this.socketClient.on('board-delta', (delta) => {
            if (this.debugging) {
                console.log('[' + new Date().toUTCString() + '] board-delta');
            }

            if (this.boardData["to_tx"] !== delta["from_tx"]) {
                this.socketClient.emit("board");
                return false;
            }

            var delta_data = delta["delta_data"];
            if (_.isString(delta_data)) {
                delta_data = JSON.parse(delta_data);
            }

            this.boardData["data"] = jsondiffpatch.patch(this.boardData["data"], delta_data);
            this.boardData["to_tx"] = delta["to_tx"];

            this.eventBus.emit('ticker', null, this._deepClone(this.boardData.data));
        });
    }

    connect() {
        if (this.debugging) {
            console.log('[' + new Date().toUTCString() + '] socket connect');
        }

        this.socketClient = socket(this.urlWorker, {
            'forceNew': false,
            'reconnectionAttempts': 1,
            'reconnectionDelay': 1000,
            'reconnectionDelayMax': 15000
        });

        this._setupGeneralEvents();
        this._setupWorkerEvents();

        // GENERAL METHODS
        // ===============================================================================
        return new Promise((resolve, reject) => {
            // Fired upon a connection including a successful reconnection.
            this.socketClient.on('connect', () => {
                if (this.debugging) {
                    console.log('[' + new Date().toUTCString() + '] connect');
                }

                this._authSocket();
                resolve(this);
            });

            // Fired upon a connection error.
            this.socketClient.on('connect_error', (error) => {
                if (this.debugging) {
                    console.log('[' + new Date().toUTCString() + '] Connect error -> Error: ' + error);
                }

                reject(new Eror(error));
            });
        });
    }

    on(event, callback) {
        this.eventBus.on(event, callback);
    }
}

module.exports = Socket;