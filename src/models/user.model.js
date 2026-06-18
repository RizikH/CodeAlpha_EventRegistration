const { query } = require('../../config/db');

// --- Read ---

const findAll = async (role) => {
    if (role) {
        const result = await query(
            'SELECT * FROM users WHERE role = $1 AND deletedat IS NULL ORDER BY createdat DESC',
            [role]
        );
        return result.rows;
    }
    const result = await query(
        'SELECT * FROM users WHERE deletedat IS NULL ORDER BY createdat DESC'
    );
    return result.rows;
};

const findByEmail = async (email) => {
    const result = await query(
        'SELECT * FROM users WHERE email = $1 AND deletedat IS NULL',
        [email]
    );
    return result.rows[0];
};

const findById = async (id) => {
    const result = await query(
        'SELECT * FROM users WHERE id = $1 AND deletedat IS NULL',
        [id]
    );
    return result.rows[0];
};

// --- Write ---

const create = async (name, email, hashedPassword, role) => {
    const result = await query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, hashedPassword, role]
    );
    return result.rows[0];
};

const updateRole = async (id, role) => {
    const result = await query(
        'UPDATE users SET role = $1 WHERE id = $2 AND deletedat IS NULL RETURNING *',
        [role, id]
    );
    return result.rows[0];
};

const softDelete = async (id, client) => {
    const exec = client ? (t, p) => client.query(t, p) : query;
    const result = await exec(
        'UPDATE users SET deletedat = now() WHERE id = $1 AND deletedat IS NULL RETURNING *',
        [id]
    );
    return result.rows[0];
};

module.exports = { findAll, findByEmail, findById, create, updateRole, softDelete };
