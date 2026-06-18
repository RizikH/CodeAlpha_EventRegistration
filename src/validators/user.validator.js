const Joi = require('joi');
const { sendError } = require('../utils/response');

// --- Schemas ---

const updateRoleSchema = Joi.object({
    role: Joi.string().valid('admin', 'organizer', 'attendee').required(),
});

const userIdSchema = Joi.object({ id: Joi.string().uuid().required() });

// --- Middleware ---

const validateUpdateRole = (req, res, next) => {
    const { error } = updateRoleSchema.validate(req.body, { abortEarly: false });
    if (error) return sendError(res, error.details.map(d => d.message).join(', '), 422);
    next();
};

const validateUserId = (req, res, next) => {
    const { error } = userIdSchema.validate(req.params);
    if (error) return sendError(res, 'Invalid user ID format.', 422);
    next();
};

module.exports = { validateUpdateRole, validateUserId };
