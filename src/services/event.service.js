const { pool } = require('../../config/db');

const eventModel = require('../models/event.model');
const registrationModel = require('../models/registration.model');

// --- Read ---

const getAllEvents = async () => {
    return eventModel.findAll();
};

const getEventById = async (id) => {
    const event = await eventModel.findById(id);
    if (!event) throw new Error('The requested event does not exist or has been deleted.');
    return event;
};

// --- Write ---

const createEvent = async (user, body) => {
    const { title, description, location, eventDate, capacity } = body;
    return eventModel.create(title, description, location, eventDate, capacity, user.id);
};

const updateEvent = async (user, eventId, fields) => {
    const event = await eventModel.findById(eventId);
    if (!event) throw new Error('The requested event does not exist or has been deleted.');
    if (user.role !== 'admin' && event.organizerid !== user.id)
        throw new Error('Access denied. You can only manage events that you created.');
    return eventModel.update(eventId, fields);
};

const deleteEvent = async (user, eventId) => {
    const event = await eventModel.findById(eventId);
    if (!event) throw new Error('The requested event does not exist or has been deleted.');
    if (user.role !== 'admin' && event.organizerid !== user.id)
        throw new Error('Access denied. You can only manage events that you created.');

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await registrationModel.cancelAllForEvent(eventId, client);
        const deleted = await eventModel.softDelete(eventId, client);
        await client.query('COMMIT');
        return deleted;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent };
