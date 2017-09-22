var Client = require('./lib/Client.js'),
	Order  = require('./lib/model/Order.js');

var model = {
	'Order': Order
};

module.exports = {
	'Client': Client,
	'model': model
};