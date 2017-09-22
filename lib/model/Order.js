"use strict";

var BaseModel   = require('./BaseModel'),
	handleError = require('../ErrorHandler').handleError;

function Order(client, data) {
  if (!(this instanceof Order)) {
    return new Order(client, data);
  }
  BaseModel.call(this, client, data);
}

Order.prototype = Object.create(BaseModel.prototype);

module.exports = Order;