const { pool } = require('../../config/db');

const registrationModel = require('../models/registration.model');
const eventModel = require('../models/event.model');

// --- Mutations ---

const registerForEvent = async (user, eventId) => {
    const event = await eventModel.findById(eventId);
    if (!event) throw new Error('The requested event does not exist or has been deleted.');
    if (event.organizerid === user.id)
        throw new Error('You cannot register for an event you created.');

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const confirmed = await registrationModel.countConfirmed(eventId, client);
        const newStatus = confirmed < event.capacity ? 'confirmed' : 'waitlisted';

        const existing = await registrationModel.findByUserAndEvent(user.id, eventId);
        let registration;

        if (existing) {
            if (existing.status !== 'cancelled') {
                throw new Error('You are already registered for this event.');
            }
            registration = await registrationModel.updateStatus(existing.id, newStatus, client);
        } else {
            registration = await registrationModel.create(user.id, eventId, newStatus, client);
        }

        await client.query('COMMIT');
        return registration;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const cancelRegistration = async (user, registrationId) => {
    const registration = await registrationModel.findById(registrationId);
    if (!registration) throw new Error('Registration not found.');
    if (registration.userid !== user.id && user.role !== 'admin') {
        throw new Error('Access denied. You can only cancel your own registrations.');
    }
    if (registration.status === 'cancelled') {
        throw new Error('This registration has already been cancelled.');
    }

    const wasConfirmed = registration.status === 'confirmed';
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const cancelled = await registrationModel.updateStatus(registrationId, 'cancelled', client);

        // Promote the oldest waitlisted attendee when a confirmed spot opens up
        if (wasConfirmed) {
            const oldest = await registrationModel.findOldestWaitlisted(registration.eventid, client);
            if (oldest) {
                await registrationModel.updateStatus(oldest.id, 'confirmed', client);
            }
        }

        await client.query('COMMIT');
        return cancelled;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// --- Queries ---

const getMyRegistrations = async (userId) => {
    return registrationModel.findByUser(userId);
};

const getEventRegistrations = async (user, eventId) => {
    const event = await eventModel.findById(eventId);
    if (!event) throw new Error('The requested event does not exist or has been deleted.');
    if (user.role !== 'admin' && event.organizerid !== user.id) {
        throw new Error('Access denied. You can only view registrations for events you created.');
    }
    return registrationModel.findByEvent(eventId);
};

module.exports = { registerForEvent, cancelRegistration, getMyRegistrations, getEventRegistrations };
