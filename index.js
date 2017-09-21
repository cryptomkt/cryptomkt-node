var Client = require('./exchange/Client.js'),
	Order  = require('./exchange/model/Order.js');

var model = {
	'Order': Order
};

module.exports = {
	'Client': Client,
	'model': model
}