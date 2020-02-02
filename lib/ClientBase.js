"use strict";

const request = require('request');
const crypto = require('crypto');
const _ = require('lodash');
const qs = require('querystring');
const assign = require('object-assign');

const Base = require('./Base');
const {
	BaseModel,
	Order
} = require('./model');
const {
	handleError,
	handleHttpError
} = require('./ErrorHandler');

const BASE_URI = 'https://api.cryptomkt.com/v1/';

const MODELS = {
	'base': BaseModel,
	'order': Order
};

//
// constructor
//
// opts = {
//   'apiKey'       : apyKey,
//   'apiSecret'    : apySecret,
//   'baseApiUri'   : baseApiUri,
// };

class ClientBase extends Base {
	constructor(opts) {
		super();
		assign(this, {
			baseApiUri: BASE_URI,
			strictSSL: true,
			timeout: 5000,
		}, opts);
		this.api = !!(this.apiKey && this.apiSecret);

		if (!(this.api)) {
			throw new Error('you must either provide the "apiKey" & "apiSecret" parameters');
		}
	}

	_generateSignature(path, bodyStr) {
		var values = "";
		var keys = [];

		for (var key in bodyStr) {
			keys.push(key);
		}

		keys.sort();

		for (var i = 0; i < keys.length; i++) {
			values += bodyStr[keys[i]];
		}

		var timestamp = Math.floor(Date.now() / 1000);
		var message = timestamp + '/v1/' + path + values;
		var signature = crypto.createHmac('sha384', this.apiSecret).update(message).digest('hex');

		return {
			'digest': signature,
			'timestamp': timestamp
		};
	}

	_generateReqOptions(method, url, path, params, headers) {
		var params = params || {};

		// specify the options
		var options = {
			'url': url + path,
			'strictSSL': this.strictSSL,
			'timeout': this.timeout,
			'headers': {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Accept': 'application/json',
				'User-Agent': 'cryptomkt/node/1.0.0'
			}
		};

		if (method === 'get') {
			options['qs'] = params;
		} else if (method === 'post') {
			options['form'] = params;
		}

		options.headers = headers || {};

		if (this.apiSecret && this.apiKey) {
			var sig = this._generateSignature(path, params);

			options.headers = assign(options.headers, {
				'X-MKT-SIGNATURE': sig.digest,
				'X-MKT-TIMESTAMP': sig.timestamp,
				'X-MKT-APIKEY': this.apiKey,
			});
		}

		return options;
	}

	_newApiObject(client, obj, cls) {
		if (obj instanceof Array) {
			return obj.map((x) => {
				return this._newApiObject(client, x, cls);
			});
		} else if (typeof obj === "string") {
			if (obj === "null") console.log("is null");
			return obj;
		} else {
			if (!cls)
				cls = BaseModel;
			var result = {};
			var keys = _.keys(obj);
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				if (obj.hasOwnProperty(key)) {
					var dict = {};
					result['' + key + ''] = this._newApiObject(client, obj[key]);
				}
			}
			return new cls(client, result);
		}
	}

	_makeApiObject(response, model) {
		var _response = {
			'response': response,
			//'pagination': response.pagination || this._newApiObject(null, response.pagination, BaseModel),
			'pagination': response.pagination,
		}

		if (response.data instanceof Array) {
			var ObjFunc = this._stringToClass('base');
			var obj = new ObjFunc(this, _response);
			assign(obj, {
				"data": this._newApiObject(this, response.data, model)
			});
		} else {
			var obj = this._newApiObject(this, response.data, model);
			assign(obj, _response);
		}

		return obj;
	}

	_getHttp(path, args, callback, headers) {
		var params = {};
		if (args && !_.isEmpty(args)) {
			params = args;
		}

		var url = this.baseApiUri;
		var opts = this._generateReqOptions('get', url, path, params, headers);

		request.get(opts, (err, response, body) => {
			var error = handleHttpError(err, response);
			if (!_.isNil(error)) {
				callback(error, null);
			} else {
				if (!body) {
					callback(new Error("empty response"), null);
				} else {
					var obj = JSON.parse(body);
					callback(null, obj);
				}
			}		
		});
	}

	_postHttp(path, args, callback, headers) {
		var params = {};
		if (args && !_.isEmpty(args)) {
			params = args;
		}

		var url = this.baseApiUri;

		var options = this._generateReqOptions('post', url, path, params, headers);

		request.post(options, (err, response, body) => {
			var error = handleHttpError(err, response);
			if (!_.isNil(error)) {
				callback(error, null);
			} else {
				if (!body) {
					callback(new Error("empty response"), null);
				} else {
					var obj = JSON.parse(body);
					callback(null, obj);
				}
			}
		});
	}

	/**
	 * args = {
	 * 	'path'   : path,
	 * 	'params' : params,
	 * }
	 */
	_getOneHttp(args, model, callback, headers) {
		callback = callback || function () {};
		return new Promise((resolve, reject) => {
			this._getHttp(args.path, args.params, (err, obj) => {
				const error = handleError(err, obj);
				if (!_.isNil(error)) {
					reject(error);
					callback(error, null);
				} else {
					if (obj.data) {
						var ObjFunc = this._stringToClass(model);
						resolve(this._makeApiObject(obj, ObjFunc));
						// resolve(new ObjFunc(this, obj.data));
						callback(null, this._makeApiObject(obj, ObjFunc));
						// callback(null, new ObjFunc(this, obj.data));
					}else {
						resolve(obj);
						callback(null, obj);
					}
				}
			}, headers);
		});
	}

	_postOneHttp(args, model, callback, headers) {
		callback = callback || function () {};
		return new Promise((resolve, reject) => {
			this._postHttp(args.path, args.params, (err, obj) => {
				const error = handleError(err, obj);
				if (!_.isNil(error)) {
					reject(error);
					callback(error, null);
				} else {
					if (obj.data) {
						var ObjFunc = this._stringToClass(model);
						//resolve(new ObjFunc(this, obj.data));
						resolve(new ObjFunc(this, obj.data));
						//callback(null, new ObjFunc(this, obj.data));
						callback(null, new ObjFunc(this, obj.data));
					} else {
						resolve(obj);
						callback(null, obj);
					}
				}
			}, headers);
		});	
	}

	_stringToClass(name) {
		return MODELS[name];
	}
}

module.exports = ClientBase;