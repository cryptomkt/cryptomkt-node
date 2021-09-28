const WebSocket = require("ws");
const { EventEmitter } = require("events");

const {
  ArgumentFormatException,
  CryptomarketAPIException,
  CryptomarketSDKException,
} = require("../exceptions");

class WSClientBase {
  constructor(uri, subscriptionKeys = {}) {
    this.uri = uri;
    this.subscriptionKeys = subscriptionKeys;
    this.emitter = new EventEmitter();
    this.nextId = 1;
  }

  getNextId() {
    if (this.nextId < 1) this.nextId = 1;
    let next = this.nextId;
    this.nextId++;
    return next;
  }

  checkDefined(options) {
    for (let key in options) {
      if (options[key] === undefined) {
        throw new ArgumentFormatException(
          `undefined argument, "${key}" is required`
        );
      }
    }
  }

  heartbeat() {
    clearTimeout(this.pingTimeout);
    this.pingTimeout = setTimeout(() => {
      this.ws.terminate();
    }, 30000 + 1000);
  }

  async connect() {
    this.ws = new WebSocket(this.uri);
    this.ws.on("message", (msg) => {
      this.handle(msg);
    });
    this.ws.on("ping", () => {
      this.heartbeat();
    });

    this.ws.on("close", () => {
      clearTimeout(this.pingTimeout);
      this.emitter.emit("close");
    });

    this.ws.on("open", () => {
      this.emitter.emit("open");
    });

    return new Promise((resolve) => {
      this.ws.once("open", () => {
        resolve();
        this.heartbeat;
      });
    });
  }

  onOpen(callback) {
    if (!callback || typeof callback !== 'function') {
      return;
    }

    this.emitter.on("open", () => callback());
  }

  onClose(callback) {
    if (!callback || typeof callback !== 'function') {
      return;
    }

    this.emitter.on("close", () => callback());
  }

  close() {
    this.ws.close();
  }

  sendSubscription(method, callback, params = {}) {
    let key = this.buildKey(method, params);
    if (this.emitter.listenerCount(key) == 1) {
      throw new CryptomarketSDKException(
        "Already subscripted. Unsubscribe first"
      );
    }
    this.emitter.on(key, callback);
    return this.sendById(method, params);
  }

  sendUnsubscription(method, params = {}) {
    let key = this.buildKey(method, params);
    this.emitter.removeAllListeners(key);
    return this.sendById(method, params);
  }

  sendById(method, params = {}) {
    let id = this.getNextId();
    let emitter = this.emitter;
    let promise = new Promise(function (resolve, reject) {
      emitter.once(id, function (response) {
        if ("error" in response) {
          reject(new CryptomarketAPIException(response));
        }
        resolve(response.result);
      });
    });
    let payload = { method, params, id };
    this.ws.send(JSON.stringify(payload));
    return promise;
  }

  handle(msg_json) {
    let message = JSON.parse(msg_json);
    if ("method" in message) {
      this.handleNotification(message);
    } else if ("id" in message) {
      this.handleResponse(message);
    }
  }

  handleNotification(notification) {
    let key = this.buildKey(notification.method);
    this.emitter.emit(key, notification.params);
  }

  handleResponse(response) {
    let id = response["id"];
    if (id === null) return;
    this.emitter.emit(id, response);
  }

  buildKey(method, params) {
    if (method in this.subscriptionKeys) this.subscriptionKeys[method];
    return "";
  }
}

module.exports = {
  WSClientBase,
};
