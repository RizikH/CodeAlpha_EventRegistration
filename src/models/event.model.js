const { query } = require('../../config/db');

// --- Read ---

const findAll = async () => {
    const result = await query(
        'SELECT * FROM events WHERE deletedat IS NULL ORDER BY eventdate ASC'
    );
    return result.rows;
};

const findById = async (id) => {
    const result = await query(
        'SELECT * FROM events WHERE id = $1 AND deletedat IS NULL',
        [id]
    );
    return result.rows[0];
};

const findByOrganizer = async (organizerId) => {
    const result = await query(
        'SELECT * FROM events WHERE organizerid = $1 AND deletedat IS NULL ORDER BY eventdate ASC',
        [organizerId]
    );
    return result.rows;
};

// --- Write ---

const create = async (title, description, location, eventDate, capacity, organizerId) => {
    const result = await query(
        `INSERT INTO events (title, description, location, eventdate, capacity, organizerid)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [title, description, location, eventDate, capacity, organizerId]
    );
    return result.rows[0];
};

const update = async (id, fields) => {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClauses = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    values.push(id);
    const result = await query(
        `UPDATE events SET ${setClauses} WHERE id = $${values.length} AND deletedat IS NULL RETURNING *`,
        values
    );
    return result.rows[0];
};

const softDelete = async (id, client) => {
    const exec = client ? (t, p) => client.query(t, p) : query;
    const result = await exec(
        'UPDATE events SET deletedat = now() WHERE id = $1 AND deletedat IS NULL RETURNING *',
        [id]
    );
    return result.rows[0];
};

module.exports = { findAll, findById, findByOrganizer, create, update, softDelete };
