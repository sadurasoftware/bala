const rateLimit = require('express-rate-limit');

const rateLimitMiddleware = rateLimit({
    windowMs: 10 * 60 * 1000, 
    max: 50, 
    message: "Too many requests, please try again later."
});

module.exports = rateLimitMiddleware;
