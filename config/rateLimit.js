const rateLimit = require('express-rate-limit');
const { sendErrorResponse } = require('../helpers/response');

const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 5, // limit each IP to 5 requests per windowMs
    handler: function (req, res) {
        sendErrorResponse(res, 'Too many accounts created from this IP, please try again after an hour', 429);
    }
});

const loginRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes window
    max: 3, // start blocking after 3 requests
    handler: function (req, res) {
        sendErrorResponse(res, 'Too many login attempts from this IP, please try again after 10 minutes', 429);
    }
});

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 10, // limit each IP to 10 requests per windowMs
    handler: function (req, res) {
        sendErrorResponse(res, 'Too many requests for forgot password from this IP, please try again after 15 minutes', 429);
    }
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 100, // limit each IP to 100 requests per windowMs
    handler: function (req, res) {
        sendErrorResponse(res, 'Too many requests from this IP, please try again after 15 minutes', 429);
    }
});

module.exports = { createAccountLimiter, loginRateLimiter, forgotPasswordLimiter, generalLimiter };