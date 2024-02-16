const rateLimit = require('express-rate-limit');

const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many accounts created from this IP, please try again after an hour'
});

const loginRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes window
    max: 3, // start blocking after 3 requests
    message: 'Too many login attempts from this IP, please try again after 10 minutes'
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

module.exports = { createAccountLimiter, loginRateLimiter, generalLimiter };
