const assign = require('object-assign');

class Base {

	hasField(obj, field) {
		return (obj && obj.hasOwnProperty(field) && obj[field]);
	}

	getProps() {
		var tmp = {};
		assign(tmp, this);
		delete tmp.client;
		delete tmp.account;
		return tmp;
	};

	dumpJSON() {
		return JSON.stringify(this.getProps());
	};

	toString() {
		return this.dumpJSON();
	};
}

module.exports = Base;