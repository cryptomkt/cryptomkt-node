/* eslint-disable no-underscore-dangle */

const ClientBase = require('./ClientBase');
const Socket = require('./Socket');
// const {
// 	Order,
// } = require('./model');


class Client extends ClientBase {
	constructor(opts) {
		super(opts);
		this.socket = new Socket(this);
	}

	// REST
	// ===============================================================================================

	getMarkets(callback = null) {
		const opts = {
			path: 'market',
		};

		return this._getOneHttp(opts, 'base', callback);
	}

	getTicker(args, callback) {
		// if (!args.market) throw new Error('market not provided');

		const opts = {
			path: 'ticker',
			params: args,
		};

		return this._getOneHttp(opts, 'base', callback);
	}

	getBook(args, callback) {
		if (!args.market) throw new Error('market not provided');
		if (!args.side) throw new Error('type not provided');

		const opts = {
			path: 'book',
			params: args,
		};

		return this._getOneHttp(opts, 'base', callback);
	}

	getTrades(args, callback) {
		if (!args.market) throw new Error('market not provided');

		const opts = {
			path: 'trades',
			params: args,
		};

		return this._getOneHttp(opts, 'base', callback);
	}

	getActiveOrders(args, callback) {
		if (!args.market) throw new Error('market not provided');

		const opts = {
			path: 'orders/active',
			params: args,
		};

		return this._getOneHttp(opts, 'base', callback);
	}

	getExecutedOrders(args, callback) {
		if (!args.market) throw new Error('market not provided');

		const opts = {
			path: 'orders/executed',
			params: args,
		};

		return this._getOneHttp(opts, 'base', callback);
	}

	createOrder(args, callback) {
		if (!args.market) throw new Error('market not provided');
		if (!args.type) throw new Error('type not provided');
		if (!args.side) throw new Error('side not provided');
		if (!args.amount) throw new Error('amount not provided');

		// optional args.price. required for limit and stop-limit order
		// optional args.limit. required for limit order

		const opts = {
			path: 'orders/create',
			params: args,

			// 'colName'  : 'orders',
			// 'ObjFunc' : Order,
		};

		return this._postOneHttp(opts, 'base', callback);
	}

	getOrderStatus(args, callback) {
		if (!args.id) throw new Error('order id not provided');

		const opts = {
			path: 'orders/status',
			params: args,
		};

		return this._getOneHttp(opts, 'base', callback);
	}

	cancelOrder(args, callback) {
		if (!args.id) throw new Error('order id not provided');

		const opts = {
			path: 'orders/cancel',
			params: args,
		};

		return this._postOneHttp(opts, 'base', callback);
	}

	transfer(args, callback) {
		if (!args.currency) throw new Error('address not provided');
		if (!args.address) throw new Error('address not provided');
		if (!args.amount) throw new Error('address not provided');

		// optional args.memo

		const opts = {
			path: 'transfer',
			params: args,
		};

		return this._postOneHttp(opts, 'base', callback);
	}

	notifyDeposit(args, callback) {
		if (!args.bank_account) throw new Error('bank_account not provided');
		if (!args.amount) throw new Error('amount not provided');

		// optional args.tracking_code. required for mxn
		// optional args.date. required for mxn
		// optional args.voucher. required for mxn, brl, ars, eur

		const opts = {
			path: 'deposit',
			params: args,
		};

		return this._postOneHttp(opts, 'base', callback);
	}

	notifyWithdrawal(args, callback) {
		if (!args.bank_account) throw new Error('bank_account not provided');
		if (!args.amount) throw new Error('amount not provided');

		const opts = {
			path: 'withdrawal',
			params: args,
		};

		return this._postOneHttp(opts, 'base', callback);
	}

	getAccount(callback) {
		const opts = {
			path: 'account',
		};

		return this._getOneHttp(opts, 'base', callback);
	}

	getTransactions(args, callback) {
		if (!args.currency) throw new Error('currency not provided');

		const opts = {
			path: 'transactions',
			params: args,
		};

		return this._getOneHttp(opts, 'base', callback);
	}

	getBalance(callback) {
		const opts = {
			path: 'balance',
		};

		return this._getOneHttp(opts, 'base', callback);
	}

	// SOCKET
	// ======================================================================
	_getAuthSocket() {
		const opts = {
			path: 'socket/auth',
		};

		return this._getOneHttp(opts, 'base');
	}
}

module.exports = Client;
