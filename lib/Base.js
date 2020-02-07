/* eslint-disable no-prototype-builtins */
/* eslint-disable class-methods-use-this */
const assign = require('object-assign');

class Base {
	hasField(obj, field) {
		return (obj && obj.hasOwnProperty(field) && obj[field]);
	}

	getProps() {
		const tmp = {};
		assign(tmp, this);
		delete tmp.client;
		delete tmp.account;
		return tmp;
	}

	dumpJSON() {
		return JSON.stringify(this.getProps());
	}

	toString() {
		return this.dumpJSON();
	}
}

module.exports = Base;
