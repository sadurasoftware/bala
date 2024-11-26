const rateLimit = require('express-rate-limit');

const rateLimitMiddleware = rateLimit({
    windowMs: 10 * 60 * 1000, 
    max: 100, 
    message: "Too many requests, please try again later."
});

module.exports = rateLimitMiddleware;
