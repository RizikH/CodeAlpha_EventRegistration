const Joi = require('joi');
const { sendError } = require('../utils/response');

// --- Schemas ---

const createEventSchema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().min(10).required(),
    location: Joi.string().required(),
    eventDate: Joi.date().iso().greater('now').required().messages({
        'date.greater': 'eventDate must be in the future',
    }),
    capacity: Joi.number().integer().min(1).required(),
});

const updateEventSchema = Joi.object({
    title: Joi.string().min(3).optional(),
    description: Joi.string().min(10).optional(),
    location: Joi.string().optional(),
    eventDate: Joi.date().iso().greater('now').optional().messages({
        'date.greater': 'eventDate must be in the future',
    }),
    capacity: Joi.number().integer().min(1).optional(),
}).min(1);

// --- Middleware ---

const validateCreateEvent = (req, res, next) => {
    const { error } = createEventSchema.validate(req.body, { abortEarly: false });
    if (error) return sendError(res, error.details.map(d => d.message).join(', '), 422);
    next();
};

const validateUpdateEvent = (req, res, next) => {
    const { error } = updateEventSchema.validate(req.body, { abortEarly: false });
    if (error) return sendError(res, error.details.map(d => d.message).join(', '), 422);
    next();
};

module.exports = { validateCreateEvent, validateUpdateEvent };
