"use strict";

var request         = require('request'),
	handleError     = require('./ErrorHandler').handleError,
    handleHttpError = require('./ErrorHandler').handleHttpError,
    BaseModel 		= require('./model/BaseModel'),
	Base      		= require('./Base'),
	Order   		= require('./model/Order'),
	crypto  		= require('crypto'),
	_       		= require('lodash'),
	qs      		= require('querystring'),
	assign  		= require('object-assign');

var BASE_URI = 'https://api.cryptomkt.com/v1/';

var MODELS = {
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

function ClientBase(opts) {
	if (!(this instanceof ClientBase)) {
		return new ClientBase(opts);
	}

  	// assign defaults and options to the context
  	assign(this, {
  		baseApiUri: BASE_URI
  	}, opts);

	// check for the different auth strategies
	var api = !!(this.apiKey && this.apiSecret)
};

ClientBase.prototype = Object.create(Base.prototype);

// private methods

ClientBase.prototype._setAccessToken = function(path) {

  // OAuth access token
  if (this.accessToken) {
  	if (path.indexOf('?') > -1) {
  		return path + '&access_token=' + this.accessToken;
  	}
  	return path + '?access_token=' + this.accessToken;
  }
  return path
};

ClientBase.prototype._generateSignature = function(path, bodyStr) {
	var timestamp = Math.floor(Date.now() / 1000);
	var message = timestamp + '/v1/' + path + bodyStr; //revisar valores
	var signature = crypto.createHmac('sha384', this.apiSecret).update(message).digest('hex');

	return {
		'digest': signature,
		'timestamp': timestamp
	};
};


ClientBase.prototype._generateReqOptions = function(url, path, body, headers) {
	var bodyStr = body ? JSON.stringify(body) : '';

	// specify the options
	var options = {
		'url': url,
		'body': bodyStr,
	};

	options.headers = headers || {};

	if (this.apiSecret && this.apiKey) {
		var sig = this._generateSignature(path, bodyStr);

		options.headers = assign(options.headers, {
			'X-MKT-SIGNATURE': sig.digest,
			'X-MKT-TIMESTAMP': sig.timestamp,
			'X-MKT-APIKEY': this.apiKey,
		});
	}

	return options;
};

ClientBase.prototype._newApiObject = function(client, obj, cls){
	var self = this;
	
	if(obj instanceof Array){
		return obj.map(function(x){
			return self._newApiObject(client, x, cls);
		});
	}else if(typeof obj === "string"){
		return obj;
	}else{
		if(!cls)
			cls = BaseModel;

		var result = new cls(client);
		var keys = _.keys(obj);
		for (var i = 0; i < keys.length; i++) {	
			var key = keys[i];
			if (obj.hasOwnProperty(key)) {
				var dict = {};
				dict[''+ key + ''] = self._newApiObject(client, obj[key]);
				assign(result, dict);
			}
		}
		return result;
	}

	return obj;
};

ClientBase.prototype._makeApiObject = function(response, model) {

	var _response = {
		'response': response,
		'pagination': response.pagination || this._newApiObject(null, response.pagination, BaseModel),
	}

	if(response.data instanceof Array){
		var ObjFunc = this._stringToClass('base');
		var obj = new ObjFunc(this, _response);
		assign(obj, {"data": this._newApiObject(this, response.data, model)});
	}else{
		var obj = this._newApiObject(this, response.data, model);
		assign(obj, _response);
	}

	return obj;
};

ClientBase.prototype._getHttp = function(path, args, callback, headers) {
	var params = '';
	if (args && !_.isEmpty(args)) {
		params = '?' + qs.stringify(args);
	}

	var url = this.baseApiUri + this._setAccessToken(path + params);
	var opts = this._generateReqOptions(url, path + params, null, headers);

	request.get(opts, function onGet(err, response, body) {
		if (!handleHttpError(err, response, callback)) {
			if (!body) {
				callback(new Error("empty response"), null);
			} else {
				var obj = JSON.parse(body);
				callback(null, obj);
			}
		}
	});
};

ClientBase.prototype._postHttp = function(path, body, callback, headers) {

	var url = this.baseApiUri + this._setAccessToken(path);
	body = body || {}

	var options = this._generateReqOptions(url, path, body, headers);

	request.post(options, function onPost(err, response, body) {
		if (!handleHttpError(err, response, callback)) {
			if (body) {
				var obj = JSON.parse(body);
				callback(null, obj);
			} else {
				callback(null, body);
			}
		}
	});
};

//
// args = {
// 'path'     : path,
// 'params'   : params,
// }
//
ClientBase.prototype._getOneHttp = function(args, model, callback, headers) {
	var self = this;
	this._getHttp(args.path, args.params, function onGet(err, obj) {
		if (!handleError(err, obj, callback)) {
			if (obj.data) {
			 	var ObjFunc = self._stringToClass(model);
				callback(null, self._makeApiObject(obj, ObjFunc))
			} else {
				callback(null, obj);
			}
		}
	}, headers);
};

//
// opts = {
// 'path'     : path,
// 'params'   : args
// }
//
ClientBase.prototype._postOneHttp = function(opts, model, callback, headers) {
	var self = this;
	var body = opts.params;
	this._postHttp(opts.colName, body, function onPost(err, obj) {
		if (!handleError(err, obj, callback)) {
			if (obj.data) {
				var ObjFunc = self._stringToClass(model);
				callback(null, new ObjFunc(self, obj.data, obj.pagination, obj.warning));
			} else {
				callback(null, obj);
			}
		}
	}, headers);
};

ClientBase.prototype._stringToClass = function(name) {
	return MODELS[name]
};

module.exports = ClientBase;