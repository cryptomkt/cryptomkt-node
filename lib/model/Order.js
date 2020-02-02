"use strict";

const BaseModel = require('./BaseModel');
const {
	handleError,
} = require('../ErrorHandler');

class Order extends BaseModel {
	constructor(client, data, pagination) {
		super(client, data);
		this.pagination = pagination;
	}
}

module.exports = Order;