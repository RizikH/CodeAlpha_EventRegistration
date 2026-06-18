// findByUserAndEvent intentionally omits soft-delete filter to allow re-registration of cancelled rows
const { query } = require('../../config/db');

// Routes queries through a transaction client when provided
const db = (client) => client || { query: (text, params) => query(text, params) };

// --- Read ---

const findById = async (id) => {
    const result = await query(
        'SELECT * FROM registrations WHERE id = $1',
        [id]
    );
    return result.rows[0];
};

const findByUserAndEvent = async (userId, eventId) => {
    const result = await query(
        'SELECT * FROM registrations WHERE userid = $1 AND eventid = $2',
        [userId, eventId]
    );
    return result.rows[0];
};

const findByUser = async (userId) => {
    const result = await query(
        'SELECT * FROM registrations WHERE userid = $1 ORDER BY registeredat DESC',
        [userId]
    );
    return result.rows;
};

const findByEvent = async (eventId) => {
    const result = await query(
        'SELECT * FROM registrations WHERE eventid = $1 ORDER BY registeredat ASC',
        [eventId]
    );
    return result.rows;
};

// --- Aggregates ---

const findOldestWaitlisted = async (eventId, client) => {
    const result = await db(client).query(
        'SELECT * FROM registrations WHERE eventid = $1 AND status = $2 ORDER BY registeredat ASC LIMIT 1',
        [eventId, 'waitlisted']
    );
    return result.rows[0];
};

const countConfirmed = async (eventId, client) => {
    const result = await db(client).query(
        'SELECT COUNT(*) FROM registrations WHERE eventid = $1 AND status = $2',
        [eventId, 'confirmed']
    );
    return parseInt(result.rows[0].count);
};

// --- Write ---

const create = async (userId, eventId, status, client) => {
    const result = await db(client).query(
        'INSERT INTO registrations (userid, eventid, status) VALUES ($1, $2, $3) RETURNING *',
        [userId, eventId, status]
    );
    return result.rows[0];
};

const updateStatus = async (id, status, client) => {
    const result = await db(client).query(
        'UPDATE registrations SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
    );
    return result.rows[0];
};

// --- Bulk Operations ---

const cancelAllForEvent = async (eventId, client) => {
    const result = await db(client).query(
        "UPDATE registrations SET status = 'cancelled' WHERE eventid = $1 AND status != 'cancelled' RETURNING *",
        [eventId]
    );
    return result.rows;
};

const cancelAllForUser = async (userId, client) => {
    const result = await db(client).query(
        "UPDATE registrations SET status = 'cancelled' WHERE userid = $1 AND status != 'cancelled' RETURNING *",
        [userId]
    );
    return result.rows;
};

module.exports = {
    findById,
    findByUserAndEvent,
    findByUser,
    findByEvent,
    findOldestWaitlisted,
    countConfirmed,
    create,
    updateStatus,
    cancelAllForEvent,
    cancelAllForUser,
};
