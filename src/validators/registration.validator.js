const Joi = require('joi');
const { sendError } = require('../utils/response');

// --- Schemas ---

const uuidSchema = Joi.object({ id: Joi.string().uuid().required() });

// --- Middleware ---

const validateEventId = (req, res, next) => {
    const { error } = uuidSchema.validate(req.params);
    if (error) return sendError(res, 'Invalid event ID format.', 422);
    next();
};

const validateRegistrationId = (req, res, next) => {
    const { error } = uuidSchema.validate(req.params);
    if (error) return sendError(res, 'Invalid registration ID format.', 422);
    next();
};

module.exports = { validateEventId, validateRegistrationId };
