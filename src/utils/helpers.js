/**
 * Send consistent API response
 * @param {Response} res 
 * @param {Number} status 
 * @param {Boolean} success 
 * @param {String} message 
 * @param {Object} data 
 */
const sendResponse = (res, status, success, message, data = null) => {
    const responseBody = {
        success,
    };

    if (message) {
        responseBody.message = message;
    }

    if (data) {
        responseBody.data = data;
    }

    return res.status(status).json(responseBody);
};

/**
 * Handle async route errors
 * @param {Function} fn 
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    sendResponse,
    asyncHandler
};
