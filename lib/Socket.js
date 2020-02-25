/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
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
		this.openOrdersData = null;
		this.historicalOrdersData = null;
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
				this.socketClient.emit('user-auth', {
					uid: obj.data.uid,
					socid: obj.data.socid,
				});
			}).catch(() => {});
	}

	_reconnect() {
		this.socketClient = socket(this.urlWorker, {
			forceNew: false,
			reconnectionAttempts: 1,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 15000,
		});
	}

	_setupGeneralEvents() {
		// Fired upon a successful reconnection.
		this.socketClient.on('reconnect', () => {});

		// Fired upon an attempt to reconnect.
		this.socketClient.on('reconnect_attempt', () => {});

		// Fired upon an attempt to reconnect.
		this.socketClient.on('reconnecting', () => {});

		// Fired when couldn’t reconnect within reconnectionAttempts.
		this.socketClient.on('reconnect_failed', () => {
			setTimeout(() => {
				this._reconnect();
			}, 5000 + _.random(0, 5000));
		});


		// Fired upon a disconnection.
		this.socketClient.on('disconnect', (reason) => {
			// the disconnection was initiated by the server, you need to reconnect manually
			// else the socket will automatically try to reconnect
			if (reason === 'io server disconnect' || reason === 'io client disconnect') {
				setTimeout(() => {
					this._reconnect();
				}, 5000 + _.random(0, 5000));
			}
		});
	}

	_setupWorkerEvents() {
		// EVENTS
		// =============================================================================================

		// CURRENCIES
		// ---------------------------------------------------------------------------------------------
		this.socketClient.on('currencies', (data) => {
			this.currenciesData = data;
		});

		this.socketClient.on('currencies-delta', (deltas) => {
			_.forEach(deltas, (delta) => {
				if (this.currenciesData.to_tx !== delta.from_tx) {
					this.socketClient.emit('currencies');
					return false;
				}

				let deltaData = delta.delta_data;
				if (_.isString(deltaData)) {
					deltaData = JSON.parse(deltaData);
				}

				this.currenciesData.data = jsondiffpatch.patch(this.currenciesData.data, deltaData);
				this.currenciesData.to_tx = delta.to_tx;
			});
		});

		// BALANCES
		// ---------------------------------------------------------------------------------------------
		this.socketClient.on('balance', (data) => {
			_.forIn(data.data, (value) => {
				const currency = _.filter(this.currenciesData.data, {
					name: value.currency,
				})[0];
				value.currency_kind = currency.kind;
				value.currency_name = currency.name;
				value.currency_big_name = currency.big_name;
				value.currency_prefix = currency.prefix;
				value.currency_postfix = currency.postfix;
				value.currency_decimals = currency.decimals;
			});
			this.balancesData = data;
			this.eventBus.emit('balance', null, this._deepClone(this.balancesData.data));
		});

		this.socketClient.on('balance-delta', (deltas) => {
			_.forEach(deltas, (delta, index, collection) => {
				if (this.balancesData.to_tx !== delta.from_tx) {
					this.socketClient.emit('balance');
					return false;
				}

				let deltaData = delta.delta_data;
				if (_.isString(deltaData)) {
					deltaData = JSON.parse(deltaData);
				}

				this.balancesData.data = jsondiffpatch.patch(this.balancesData.data, deltaData);
				this.balancesData.to_tx = delta.to_tx;
				if (index === collection.length - 1) {
					_.forIn(this.balancesData.data, (value) => {
						const currency = _.filter(this.currenciesData.data, {
							name: value.currency,
						})[0];
						value.currency_kind = currency.kind;
						value.currency_name = currency.name;
						value.currency_big_name = currency.big_name;
						value.currency_prefix = currency.prefix;
						value.currency_postfix = currency.postfix;
						value.currency_decimals = currency.decimals;
					});

					this.eventBus.emit('balance', null, this._deepClone(this.balancesData.data));
				}
			});
		});

		// OPEN-ORDERS
		// ---------------------------------------------------------------------------------------------
		this.socketClient.on('open-orders', (data) => {
			this.openOrdersData = data;
			this.eventBus.emit('open-orders', null, this._deepClone(data.data));
		});

		this.socketClient.on('open-orders-delta', (deltas) => {
			_.forEach(deltas, (delta, index, collection) => {
				if (this.openOrdersData.to_tx !== delta.from_tx) {
					this.socketClient.emit('open-orders');
					return false;
				}

				let deltaData = delta.delta_data;
				if (_.isString(deltaData)) {
					deltaData = JSON.parse(deltaData);
				}

				this.openOrdersData.data = jsondiffpatch.patch(this.openOrdersData.data, deltaData);
				this.openOrdersData.to_tx = delta.to_tx;
				if (index === collection.length - 1) {
					this.eventBus.emit('open-orders', null, this._deepClone(this.openOrdersData.data));
				}
			});
		});

		// HISTORICAL-ORDERS
		// ---------------------------------------------------------------------------------------------
		this.socketClient.on('historical-orders', (data) => {
			this.historicalOrdersData = data;
			this.eventBus.emit('historical-orders', null, this._deepClone(data.data));
		});

		this.socketClient.on('historical-orders-delta', (deltas) => {
			_.forEach(deltas, (delta, index, collection) => {
				if (this.historicalOrdersData.to_tx !== delta.from_tx) {
					this.socketClient.emit('historical-orders');
					return false;
				}

				let deltaData = delta.delta_data;
				if (_.isString(deltaData)) {
					deltaData = JSON.parse(deltaData);
				}

				this.historicalOrdersData.data = jsondiffpatch.patch(
					this.historicalOrdersData.data,
					deltaData,
				);
				this.historicalOrdersData.to_tx = delta.to_tx;
				if (index === collection.length - 1) {
					this.eventBus.emit('historical-orders', null, this._deepClone(this.historicalOrdersData.data));
				}
			});
		});

		// OPERATED
		// ---------------------------------------------------------------------------------------------
		this.socketClient.on('operated', (data) => {
			this.operatedData = data;
			this.eventBus.emit('operated', null, this._deepClone(this.operatedData.data));
		});

		this.socketClient.on('operated-delta', (deltas) => {
			_.forEach(deltas, (delta, index, collection) => {
				if (this.operatedData.to_tx !== delta.from_tx) {
					this.socketClient.emit('operated');
					return false;
				}

				let deltaData = delta.delta_data;
				if (_.isString(deltaData)) {
					deltaData = JSON.parse(deltaData);
				}

				this.operatedData.data = jsondiffpatch.patch(this.operatedData.data, deltaData);
				this.operatedData.to_tx = delta.to_tx;
				if (index === collection.length - 1) {
					this.eventBus.emit('operated', null, this._deepClone(this.operatedData.data));
				}
			});
		});

		// OPEN-BOOK
		// ---------------------------------------------------------------------------------------------
		this.socketClient.on('open-book', (data) => {
			this.openBookData[data.stock_id] = data;

			const clean = {};
			clean[data.stock_id] = {
				sell: data.data[2],
				buy: data.data[1],
			};

			this.eventBus.emit('open-book', null, this._deepClone(clean));
		});

		this.socketClient.on('open-book-delta', (delta) => {
			const stockId = delta.stock_id;
			if (_.has(this.openBookData, stockId)) {
				if (this.openBookData[stockId].to_tx !== delta.from_tx) {
					this.socketClient.emit('open-book', {
						stockId,
					});
					return;
				}

				let deltaData = delta.delta_data;
				if (_.isString(deltaData)) {
					deltaData = JSON.parse(deltaData);
				}

				this.openBookData[stockId].data = jsondiffpatch.patch(
					this.openBookData[stockId].data,
					deltaData,
				);
				this.openBookData[stockId].to_tx = delta.to_tx;

				const clean = {};
				clean[stockId] = {
					sell: this.openBookData[stockId].data[2],
					buy: this.openBookData[stockId].data[1],
				};

				this.eventBus.emit('open-book', null, this._deepClone(clean));
			} else {
				this.socketClient.emit('open-book', {
					stockId: delta.stock_id,
				});
			}
		});

		// HISTORICAL-BOOK
		// ---------------------------------------------------------------------------------------------
		this.socketClient.on('historical-book', (data) => {
			const stockId = data.stock_id;

			this.historicalBookData[stockId] = data;

			const result = {};
			result[stockId] = this.historicalBookData[stockId].data;

			this.eventBus.emit('historical-book', null, this._deepClone(result));
		});

		this.socketClient.on('historical-book-delta', (delta) => {
			const stockId = delta.stock_id;
			if (_.has(this.historicalBookData, stockId)) {
				if (this.historicalBookData[stockId].to_tx !== delta.from_tx) {
					this.socketClient.emit('historical-book', {
						stockId,
					});
					return;
				}

				let deltaData = delta.delta_data;
				if (_.isString(deltaData)) {
					deltaData = JSON.parse(deltaData);
				}

				this.historicalBookData[stockId].data = jsondiffpatch.patch(
					this.historicalBookData[stockId].data,
					deltaData,
				);
				this.historicalBookData[stockId].to_tx = delta.to_tx;

				const result = {};
				result[stockId] = this.historicalBookData[stockId].data;

				this.eventBus.emit('historical-book', null, this._deepClone(result));
			} else {
				this.socketClient.emit('historical-book', {
					stockId: delta.stock_id,
				});
			}
		});

		// CANDLES
		// ---------------------------------------------------------------------------------------------
		this.socketClient.on('candles', (data) => {
			const stockId = data.stock_id;
			this.candlesData[stockId] = data;

			const result = {};
			result[stockId] = this.candlesData[stockId].data;

			const cloneResult = this._deepClone(result);

			const cleanResult = _.mapValues(cloneResult, (obj) => {
				if (_.has(obj, '1')) {
					obj.buy = obj['1'];
					delete obj['1'];
				}

				if (_.has(obj, '2')) {
					obj.sell = obj['2'];
					delete obj['2'];
				}

				return obj;
			});

			this.eventBus.emit('candles', null, cleanResult);
		});

		this.socketClient.on('candles-delta', (delta) => {
			const stockId = delta.stock_id;
			if (_.has(this.candlesData, stockId)) {
				if (this.candlesData[stockId].to_tx !== delta.from_tx) {
					this.socketClient.emit('candles', {
						stockId,
					});
					return;
				}

				let deltaData = delta.delta_data;
				if (_.isString(deltaData)) {
					deltaData = JSON.parse(deltaData);
				}

				this.candlesData[stockId].data = jsondiffpatch.patch(
					this.candlesData[stockId].data,
					deltaData,
				);
				this.candlesData[stockId].to_tx = delta.to_tx;

				const result = {};
				result[stockId] = this.candlesData[stockId].data;

				const cloneResult = this._deepClone(result);

				const cleanResult = _.mapValues(cloneResult, (obj) => {
					if (_.has(obj, '1')) {
						obj.buy = obj['1'];
						delete obj['1'];
					}

					if (_.has(obj, '2')) {
						obj.sell = obj['2'];
						delete obj['2'];
					}

					return obj;
				});

				this.eventBus.emit('candles', null, cleanResult);
			} else {
				this.socketClient.emit('candles', {
					stockId: delta.stock_id,
				});
			}
		});

		// BOARD
		// ---------------------------------------------------------------------------------------------
		this.socketClient.on('board', (data) => {
			this.boardData = data;
			this.eventBus.emit('ticker', null, this._deepClone(this.boardData.data));
		});

		this.socketClient.on('board-delta', (delta) => {
			if (this.boardData.to_tx !== delta.from_tx) {
				this.socketClient.emit('board');
				return false;
			}

			let deltaData = delta.delta_data;
			if (_.isString(deltaData)) {
				deltaData = JSON.parse(deltaData);
			}

			this.boardData.data = jsondiffpatch.patch(this.boardData.data, deltaData);
			this.boardData.to_tx = delta.to_tx;

			this.eventBus.emit('ticker', null, this._deepClone(this.boardData.data));
		});
	}

	connect() {
		this.socketClient = socket(this.urlWorker, {
			forceNew: false,
			reconnectionAttempts: 1,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 15000,
		});

		this._setupGeneralEvents();
		this._setupWorkerEvents();

		// GENERAL METHODS
		// ===============================================================================
		return new Promise((resolve, reject) => {
			// Fired upon a connection including a successful reconnection.
			this.socketClient.on('connect', () => {
				this._authSocket();
				resolve(this);
			});

			// Fired upon a connection error.
			this.socketClient.on('connect_error', (error) => {
				reject(new Error(error));
			});
		});
	}

	on(event, callback) {
		this.eventBus.on(event, callback);
	}

	subscribe(...pairs) {
		_.forEach(pairs, (pair) => {
			this.socketClient.emit('subscribe', pair);
		});
	}

	unsubscribe(...pairs) {
		_.forEach(pairs, (pair) => {
			this.socketClient.emit('unsubscribe', pair);
		});
	}
}

module.exports = Socket;
