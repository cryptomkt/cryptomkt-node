/* eslint-disable no-underscore-dangle */
const createError = require('http-errors');

const statusCodeToClass = {
	400: 'InvalidRequestError',
	401: 'AuthenticationError',
	402: 'TwoFactorRequiredError',
	403: 'InvalidScopeError',
	404: 'NotFoundError',
	422: 'ValidationError',
	429: 'RateLimitExceededError',
	500: 'InternalServerError',
	503: 'ServiceUnavailableError',
};

function _parseError(error) {
	if (error.errors) {
		return error.errors[0];
	}

	return {
		status: error.status,
		message: error.message,
	};
}

function handleHttpError(err, response) {
	if (err) {
		return err;
	}
	if (!response) {
		return createError('no response');
	}
	if (response.statusCode !== 200 && response.statusCode !== 201 && response.statusCode !== 204) {
		let error;
		try {
			const errorBody = _parseError(JSON.parse(response.body));
			error = createError(response.statusCode,
				errorBody.message, {
					name: statusCodeToClass[response.statusCode],
				});
		} catch (ex) {
			error = createError(response.statusCode, response.body);
		}
		return error;
	}
	return null;
}

function handleError(err, obj) {
	if (err) {
		return err;
	}
	if (obj.error) {
		return createError(obj.error, {
			name: 'APIError',
		});
	}
	if (obj.errors) {
		return createError(obj, {
			name: 'APIError',
		});
	}
	if (obj.success !== undefined && obj.success !== true) {
		return createError(obj, {
			name: 'APIError',
		});
	}

	return null;
}

module.exports = {
	handleError,
	handleHttpError,
};
