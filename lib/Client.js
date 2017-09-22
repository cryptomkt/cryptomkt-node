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
  
  var opts = {
    'path': 'ticker',
    'args': args
  };

  this._getOneHttp(opts, 'base', callback);
};

module.exports = Client;