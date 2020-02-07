const assign = require('object-assign');
const _ = require('lodash');

const Base = require('../Base');


class BaseModel extends Base {
	constructor(client, data) {
		super();
		if (_.isNil(client)) {
			throw new Error('client is null');
		}
		if (_.isNil(data)) {
			throw new Error('data is null');
		}
		this.client = client;
		assign(this, data);
	}
}

module.exports = BaseModel;
