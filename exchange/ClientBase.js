"use strict";

var request = require('request'),
	Base    = require('./Base'),
	Order   = require('./model/Order'),
	crypto  = require('crypto'),
 	_       = require('lodash'),
    qs      = require('querystring'),
    assign  = require('object-assign');

var BASE_URI = 'https://api.cryptomkt.com/v1/';

var MODELS = {
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
}

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

ClientBase.prototype._generateSignature = function(path, method, body) {
	var timestamp = Math.floor(Date.now() / 1000);
	var message = timestamp + method + '/v1/' + path + bodyStr; //revisar valores
	var signature = crypto.createHmac('sha384', this.apiSecret).update(message).digest('hex');

	return {
	    'digest': signature,
	    'timestamp': timestamp
	};
};


ClientBase.prototype._generateReqOptions = function(url, path, body, mehod, headers) {
	var bodyStr = body ? JSON.stringify(body) : '';

	// specify the options
	var options = {
	    'url': url,
	    'body': bodyStr,
	    'method': method
	};

	options.headers = headers;

	if (this.apiSecret && this.apiKey) {
	    var sig = this._generateSignature(path, method, bodyStr);

	    // add signature and nonce to the header
	    options.headers = assign(options.headers, {
				'X-MKT-SIGNATURE': sig.digest,
				'X-MKT-TIMESTAMP': sig.timestamp,
				'X-MKT-APIKEY': this.apiKey,
			});
	}

  	return options;
};


ClientBase.prototype._getHttp = function(path, args, callback, headers) {
  var params = '';
  if (args && !_.isEmpty(args)) {
    params = '?' + qs.stringify(args);
  }

  var url = this.baseApiUri + this._setAccessToken(path + params);
  var opts = this._generateReqOptions(url, path + params, null, 'GET', headers);

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

  var options = this._generateReqOptions(url, path, body, 'POST', headers);

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

ClientBase.prototype._stringToClass = function(name) {
  return MODELS[name]
};

module.exports = ClientBase;