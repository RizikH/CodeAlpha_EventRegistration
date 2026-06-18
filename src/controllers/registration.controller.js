const registrationService = require('../services/registration.service');
const { sendSuccess, sendError } = require('../utils/response');

// --- Helpers ---

// Maps a substring of an error message to an HTTP status code
const getStatus = (message, map) => {
    for (const [key, code] of Object.entries(map)) {
        if (message.includes(key)) return code;
    }
    return 400;
};

// --- Handlers ---

const registerForEvent = async (req, res) => {
    try {
        const registration = await registrationService.registerForEvent(req.user, req.params.id);
        sendSuccess(res, registration, 201);
    } catch (err) {
        const status = getStatus(err.message, {
            'already registered': 409,
            'own event': 403,
            'does not exist': 404,
        });
        sendError(res, err.message, status);
    }
};

const cancelRegistration = async (req, res) => {
    try {
        const registration = await registrationService.cancelRegistration(req.user, req.params.id);
        sendSuccess(res, registration);
    } catch (err) {
        const status = getStatus(err.message, {
            'Access denied': 403,
            'not found': 404,
            'already been cancelled': 409,
        });
        sendError(res, err.message, status);
    }
};

const getMyRegistrations = async (req, res) => {
    try {
        const registrations = await registrationService.getMyRegistrations(req.user.id);
        sendSuccess(res, registrations);
    } catch (err) {
        sendError(res, err.message, 500);
    }
};

const getEventRegistrations = async (req, res) => {
    try {
        const registrations = await registrationService.getEventRegistrations(req.user, req.params.id);
        sendSuccess(res, registrations);
    } catch (err) {
        const status = getStatus(err.message, {
            'Access denied': 403,
            'does not exist': 404,
        });
        sendError(res, err.message, status);
    }
};

module.exports = { registerForEvent, cancelRegistration, getMyRegistrations, getEventRegistrations };
