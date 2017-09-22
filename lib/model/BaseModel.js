"use strict";

var Base = require('../Base');
var assign = require('object-assign');

function BaseModel(client, data, pagination, warning) {
  if (!(this instanceof BaseModel)) {
    return new BaseModel(client, data);
  }
  // this.client = client;
  assign(this, data);
}

BaseModel.prototype = Object.create(Base.prototype);

module.exports = BaseModel;