/* eslint-disable class-methods-use-this */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-underscore-dangle */
const request = require('request');
const crypto = require('crypto');
const _ = require('lodash');
const assign = require('object-assign');

const Base = require('./Base');
const {
    BaseModel,
    Order,
} = require('./model');
const {
    handleError,
    handleHttpError,
} = require('./ErrorHandler');

const BASE_URI = 'https://api.cryptomkt.com/v2/';

const MODELS = {
    base: BaseModel,
    order: Order,
};

//
// constructor
//
// opts = {
//   'apiKey'       : apyKey,
//   'apiSecret'    : apySecret,
//   'baseApiUri'   : baseApiUri,
// };

let apiKey;
let apiSecret;

class ClientBase extends Base {
    constructor(opts) {
        super();

        this.setCredentials(opts.apiKey, opts.apiSecret);
        this.api = !!(apiKey && apiSecret);

        if (!(this.api)) {
            throw new Error('you must either provide the "apiKey" & "apiSecret" parameters');
        }

        delete opts.apiKey;
        delete opts.apiSecret;
        assign(this, {
            baseApiUri: BASE_URI,
            strictSSL: true,
            timeout: 5000,
        }, opts);
    }

    setCredentials(key, secret) {
        if (!key || !secret) {
            throw Error("Debes especificar los api key y secret");
        }

        apiKey = key;
        apiSecret = secret;
    }

    _generateSignature(path, bodyStr) {
        let values = '';
        const keys = [];

        _.forIn(bodyStr, (value, key) => {
            keys.push(key);
        });

        keys.sort();

        for (let i = 0; i < keys.length; i += 1) {
            values += bodyStr[keys[i]];
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const message = `${timestamp}/v2/${path}${values}`;
        const signature = crypto.createHmac('sha384', apiSecret).update(message).digest('hex');

        return {
            digest: signature,
            timestamp,
        };
    }

    _generateReqOptions(method, url, path, params, headers) {
        const parameters = params || {};

        // specify the options
        const options = {
            url: url + path,
            strictSSL: this.strictSSL,
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
                'User-Agent': 'cryptomkt/node/1.0.0',
            },
        };

        if (method === 'get') {
            options.qs = parameters;
        } else if (method === 'post') {
            options.form = parameters;
        }

        options.headers = headers || {};

        if (apiSecret && apiKey) {
            let sig;
            if (method === 'get') {
                sig = this._generateSignature(path, {});
            } else {
                sig = this._generateSignature(path, params);
            }

            options.headers = assign(options.headers, {
                'X-MKT-SIGNATURE': sig.digest,
                'X-MKT-TIMESTAMP': sig.timestamp,
                'X-MKT-APIKEY': apiKey,
            });
        }

        return options;
    }

    _newApiObject(client, obj, cls) {
        let Cls = cls;

        if (obj instanceof Array) {
            return obj.map((x) => this._newApiObject(client, x, Cls));
        }

        if (typeof obj === 'string') {
            if (obj === 'null') return null;
            return obj;
        }

        if (obj === null) {
            return obj;
        }

        if (typeof obj === 'number') {
            return obj;
        }

        if (!Cls) {
            Cls = BaseModel;
        }

        const result = {};
        const keys = _.keys(obj);
        for (let i = 0; i < keys.length; i += 1) {
            const key = keys[i];
            if (obj.hasOwnProperty(key)) {
                result[key] = this._newApiObject(client, obj[key]);
            }
        }
        return new Cls(client, result);
    }

    _makeApiObject(response, model) {
        const _response = {
            response,
        };
        if (response.pagination) {
            _response.pagination = response.pagination;
        }

        let obj;

        if (response.data instanceof Array) {
            const ObjFunc = this._stringToClass('base');
            obj = new ObjFunc(this, _response);
            assign(obj, {
                data: this._newApiObject(this, response.data, model),
            });
        } else {
            obj = { data: this._newApiObject(this, response.data, model) };
            assign(obj, _response);
        }

        return obj;
    }

    _getHttp(path, args, callback, headers) {
        let params = {};
        if (args && !_.isEmpty(args)) {
            params = args;
        }

        const url = this.baseApiUri;
        const opts = this._generateReqOptions('get', url, path, params, headers);

        request.get(opts, (err, response, body) => {
            const error = handleHttpError(err, response);
            if (!_.isNil(error)) {
                callback(error, null);
            } else if (!body) {
                callback(new Error('empty response'), null);
            } else {
                const obj = JSON.parse(body);
                callback(null, obj);
            }
        });
    }

    _postHttp(path, args, callback, headers) {
        let params = {};
        if (args && !_.isEmpty(args)) {
            params = args;
        }

        const url = this.baseApiUri;

        const options = this._generateReqOptions('post', url, path, params, headers);

        request.post(options, (err, response, body) => {
            const error = handleHttpError(err, response);
            if (!_.isNil(error)) {
                callback(error, null);
            } else if (!body) {
                callback(new Error('empty response'), null);
            } else {
                const obj = JSON.parse(body);
                callback(null, obj);
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
        const cb = callback || function() {};
        return new Promise((resolve, reject) => {
            this._getHttp(args.path, args.params, (err, obj) => {
                const error = handleError(err, obj);
                if (!_.isNil(error)) {
                    reject(error);
                    cb(error, null);
                } else if (obj.data) {
                    const ObjFunc = this._stringToClass(model);
                    resolve(this._makeApiObject(obj, ObjFunc));
                    // resolve(new ObjFunc(this, obj.data));
                    cb(null, this._makeApiObject(obj, ObjFunc));
                    // callback(null, new ObjFunc(this, obj.data));
                } else {
                    resolve(obj);
                    cb(null, obj);
                }
            }, headers);
        });
    }

    _postOneHttp(args, model, callback, headers) {
        const cb = callback || function() {};
        return new Promise((resolve, reject) => {
            this._postHttp(args.path, args.params, (err, obj) => {
                const error = handleError(err, obj);
                if (!_.isNil(error)) {
                    reject(error);
                    callback(error, null);
                } else if (obj.data) {
                    const ObjFunc = this._stringToClass(model);
                    // resolve(new ObjFunc(this, obj.data));
                    // resolve(new ObjFunc(this, obj.data));
                    // callback(null, new ObjFunc(this, obj.data));
                    // cb(null, new ObjFunc(this, obj.data));
                    resolve(this._makeApiObject(obj, ObjFunc));
                    // resolve(new ObjFunc(this, obj.data));
                    cb(null, this._makeApiObject(obj, ObjFunc));
                    // callback(null, new ObjFunc(this, obj.data));
                } else {
                    resolve(obj);
                    cb(null, obj);
                }
            }, headers);
        });
    }

    _stringToClass(name) {
        return MODELS[name];
    }
}

module.exports = ClientBase;