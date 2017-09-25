"use strict";

var createError = require('http-errors');

var status_code_to_class = {
    "400" : "InvalidRequestError",
    "401" : "AuthenticationError",
    "402" : "TwoFactorRequiredError",
    "403" : "InvalidScopeError",
    "404" : "NotFoundError",
    "422" : "ValidationError",
    "429" : "RateLimitExceededError",
    "500" : "InternalServerError",
    "503" : "ServiceUnavailableError",
}

function _parseError(error) {

  if (error.errors) {
    return error.errors[0];
  }

  return {
    status: error.status,
    message: error.message
  };
  
};

function handleHttpError(err, response, callback) {
  if (!callback) {
    throw new Error("no callback for http error handler- check method signature");
  }

  if (err) {

    callback(err, null);
    return true;
  }
  if (!response) {
    callback(createError('no response'), null);
    return true;
  }
  if (response.statusCode !== 200 &&
      response.statusCode !== 201 &&
      response.statusCode !== 204) {


    var error;
    try {
      var errorBody = _parseError(JSON.parse(response.body));
      error = createError(response.statusCode,
                          errorBody.message,
                          {name: status_code_to_class[response.statusCode]});
    } catch (ex) {
      error = createError(response.statusCode, response.body);
    }    
    callback(error, null);
    return true;
  }
  return false;
}

function handleError(err, obj, callback) {

  if (!callback) {throw "no callback - check method signature";}
  if (err) {
    callback(err, null);
    return true;
  }
  if (obj.error) {
    callback(createError(obj.error, {name: 'APIError'}), null);
    return true;
  }
  if (obj.errors) {
    callback(createError(obj, {name: 'APIError'}), null);
    return true;
  }
  if (obj.success !== undefined && obj.success !== true) {
    callback(createError(obj, {name: 'APIError'}), null);
    return true;
  }
  return false;
}

module.exports.handleError     = handleError;
module.exports.handleHttpError = handleHttpError;