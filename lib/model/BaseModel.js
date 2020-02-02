"use strict";

var Base = require('../Base');
var assign = require('object-assign');
var _ = require('lodash');

class BaseModel extends Base {
	constructor(client, data) {
		super();
		if (_.isNil(client)) {
			throw new Error("client is null");
		}
		if (_.isNil(data)) {
			throw new Error("data is null");
		}
		this.client = client;
		assign(this, data);
	}
}

module.exports = BaseModel;