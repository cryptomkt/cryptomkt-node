"use strict";

var ClientBase    = require('./ClientBase'),
    request       = require("request"),
    handleError   = require('./ErrorHandler').handleError,
    Order         = require("./model/Order"),
    crypto        = require("crypto"),
    _             = require("lodash"),
    qs            = require("querystring"),
    assign        = require("object-assign");

function Client(opts) {

  if (!(this instanceof Client)) {
    return new Client(opts);
  }
  ClientBase.call(this, opts);
}

Client.prototype = Object.create(ClientBase.prototype);

Client.prototype.getMarkets = function(args, callback) {

	var opts = {
		'path': 'market',
	};

	this._getOneHttp(opts, 'base', callback);
};

Client.prototype.getTicker = function(args, callback) {

  if(!args.market) throw new Error("market not provided");  
  
  var opts = {
    'path': 'ticker',
    'params': args
  };

  this._getOneHttp(opts, 'base', callback);
};

Client.prototype.getOrders = function(args, callback) {

  if(!args.market) throw new Error("market not provided");
  if(!args.type) throw new Error("type not provided");

  var opts = {
      'path': 'book',
      'params': args
  };

  this._getOneHttp(opts, 'base', callback);
};

Client.prototype.getTrades = function(args, callback) {

  if(!args.market) throw new Error("market not provided");

  var opts = {
      'path': 'trades',
      'params': args
  };

  this._getOneHttp(opts, 'base', callback);
}

Client.prototype.getActiveOrders = function(args, callback) {

  if(!args.market) throw new Error("market not provided");

  var opts = {
    'path': 'orders/active',
    'params': args,
  };

  this._getOneHttp(opts, 'base', callback);
};

Client.prototype.getExecutedOrders = function(args, callback) {

  if(!args.market) throw new Error("market not provided");

  var opts = {
    'path': 'orders/executed',
    'params': args,
  };

  this._getOneHttp(opts, 'base', callback);
};

Client.prototype.getExecutedOrders = function(args, callback) {

  if(!args.market) throw new Error("market not provided");

  var opts = {
    'path': 'orders/executed',
    'params': args,
  };

  this._getOneHttp(opts, 'base', callback);
};

Client.prototype.createOrder = function(args, callback) {

  if(!args.market) throw new Error("market not provided");
  if(!args.amount) throw new Error("amount not provided");
  if(!args.price) throw new Error("price not provided");
  if(!args.type) throw new Error("type not provided");

  var opts = {
    'path': 'orders/create',
    'params': args
  };

  this._postOneHttp(opts, 'base', callback);
};

Client.prototype.getOrderStatus = function(args, callback) {

  if(!args.id) throw new Error("order id not provided");

  var opts = {
    'path': 'orders/status',
    'params': args,
  };

  this._getOneHttp(opts, 'base', callback);
};

Client.prototype.cancelOrder = function(args, callback) {

  if(!args.id) throw new Error("order id not provided");

  var opts = {
    'path': 'orders/cancel',
    'params': args
  };

  this._postOneHttp(opts, 'base', callback);
};

Client.prototype.getBalance = function(args, callback) {

  var opts = {
    'path': 'balance',
    'params': args
  };

  this._getOneHttp(opts, 'base', callback);
};

module.exports = Client;