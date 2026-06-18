const eventService = require('../services/event.service');
const { sendSuccess, sendError } = require('../utils/response');

// --- Read ---

const getAllEvents = async (req, res) => {
    try {
        const events = await eventService.getAllEvents();
        sendSuccess(res, events);
    } catch (err) {
        sendError(res, err.message, 500);
    }
};

const getEventById = async (req, res) => {
    try {
        const event = await eventService.getEventById(req.params.id);
        sendSuccess(res, event);
    } catch (err) {
        sendError(res, err.message, 404);
    }
};

// --- Write ---

const createEvent = async (req, res) => {
    try {
        const event = await eventService.createEvent(req.user, req.body);
        sendSuccess(res, event, 201);
    } catch (err) {
        sendError(res, err.message, 400);
    }
};

const updateEvent = async (req, res) => {
    try {
        const event = await eventService.updateEvent(req.user, req.params.id, req.body);
        sendSuccess(res, event);
    } catch (err) {
        const status = err.message === 'Forbidden' ? 403
            : err.message === 'Event not found' ? 404
            : 400;
        sendError(res, err.message, status);
    }
};

const deleteEvent = async (req, res) => {
    try {
        const event = await eventService.deleteEvent(req.user, req.params.id);
        sendSuccess(res, event);
    } catch (err) {
        const status = err.message === 'Forbidden' ? 403
            : err.message === 'Event not found' ? 404
            : 400;
        sendError(res, err.message, status);
    }
};

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent };
