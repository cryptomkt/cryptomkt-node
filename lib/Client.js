
const ClientBase = require('./ClientBase');
const {
	Order,
} = require("./model");


class Client extends ClientBase {
	constructor(opts) {
		super(opts);
	}

	getMarkets(callback = null) {

		var opts = {
			'path': 'market',
		};

		return this._getOneHttp(opts, 'base', callback);
	};

	getTicker(args, callback) {

		if (!args.market) throw new Error("market not provided");

		var opts = {
			'path': 'ticker',
			'params': args
		};

		return this._getOneHttp(opts, 'base', callback);
	};

	getOrders(args, callback) {

		if (!args.market) throw new Error("market not provided");
		if (!args.type) throw new Error("type not provided");

		var opts = {
			'path': 'book',
			'params': args
		};

		return this._getOneHttp(opts, 'base', callback);
	};

	getTrades(args, callback) {

		if (!args.market) throw new Error("market not provided");

		var opts = {
			'path': 'trades',
			'params': args
		};

		return this._getOneHttp(opts, 'base', callback);
	}

	getActiveOrders(args, callback) {

		if (!args.market) throw new Error("market not provided");

		var opts = {
			'path': 'orders/active',
			'params': args,
		};

		return this._getOneHttp(opts, 'base', callback);
	};

	getExecutedOrders(args, callback) {

		if (!args.market) throw new Error("market not provided");

		var opts = {
			'path': 'orders/executed',
			'params': args,
		};

		return this._getOneHttp(opts, 'base', callback);
	};

	getExecutedOrders(args, callback) {

		if (!args.market) throw new Error("market not provided");

		var opts = {
			'path': 'orders/executed',
			'params': args,
		};

		return this._getOneHttp(opts, 'base', callback);
	};

	createOrder(args, callback) {

		if (!args.market) throw new Error("market not provided");
		if (!args.amount) throw new Error("amount not provided");
		if (!args.price) throw new Error("price not provided");
		if (!args.type) throw new Error("type not provided");

		var opts = {
			'path': 'orders/create',
			'params': args

			// 'colName'  : 'orders',
    		// 'ObjFunc' : Order,
		};

		return this._postOneHttp(opts, 'base', callback);
	};

	getOrderStatus(args, callback) {

		if (!args.id) throw new Error("order id not provided");

		var opts = {
			'path': 'orders/status',
			'params': args,
		};

		return this._getOneHttp(opts, 'base', callback);
	};

	cancelOrder(args, callback) {

		if (!args.id) throw new Error("order id not provided");

		var opts = {
			'path': 'orders/cancel',
			'params': args
		};

		return this._postOneHttp(opts, 'base', callback);
	};

	getBalance(args, callback) {

		var opts = {
			'path': 'balance',
			'params': args
		};

		return this._getOneHttp(opts, 'base', callback);
	};
}

module.exports = Client;