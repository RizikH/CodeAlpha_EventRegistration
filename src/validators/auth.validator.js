const Joi = require('joi');
const { sendError } = require('../utils/response');

// --- Schemas ---

const passwordRules = Joi.string()
    .min(8)
    .pattern(/[A-Z]/, 'uppercase')
    .pattern(/[a-z]/, 'lowercase')
    .pattern(/[!@#$%^&*]/, 'special character')
    .required()
    .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.pattern.name': 'Password must contain at least one {#name}',
    });

const registerSchema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: passwordRules,
    role: Joi.string().valid('admin', 'organizer', 'attendee').default('attendee'),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

// --- Middleware ---

const validateRegister = (req, res, next) => {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) return sendError(res, error.details.map(d => d.message).join(', '), 422);
    req.body = value; // Apply Joi defaults (e.g. role → 'attendee')
    next();
};

const validateLogin = (req, res, next) => {
    const { error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) return sendError(res, error.details.map(d => d.message).join(', '), 422);
    next();
};

module.exports = { validateRegister, validateLogin };
