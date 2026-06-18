const { rateLimit } = require('express-rate-limit');
const response = require('../utils/response');

const createLimiter = ({ windowMs, max, message }) => {
    return rateLimit({
        windowMs,
        max,
        message: { error: message || 'Too many requests, please try again later.' },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res, next, options) => {
            response.sendError(res, options.message.error, 429);
        },
    });
};

const limiters = {
    auth: createLimiter({
        windowMs: 15 * 60 * 1000, // 15 min
        max: 5,
        message: 'Too many login attempts. Please try again in 15 minutes.',
    }),
    api: createLimiter({
        windowMs: 15 * 60 * 1000, // 15 min
        max: 100,
        message: 'Too many API requests. Please slow down.',
    }),
    downloads: createLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 20,
        message: 'Download limit reached for this hour.',
    }),
};

// In test mode, bypass all rate limiting so tests run without throttling
if (process.env.NODE_ENV === 'test') {
    const noop = (req, res, next) => next();
    module.exports = { api: noop, auth: noop, downloads: noop };
} else {
    module.exports = limiters;
}
