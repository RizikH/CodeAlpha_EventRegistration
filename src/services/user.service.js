const { pool } = require('../../config/db');

const userModel = require('../models/user.model');
const eventModel = require('../models/event.model');
const registrationModel = require('../models/registration.model');

// Removes password field before returning user data to callers
const strip = ({ password, ...rest }) => rest;

// --- Read ---

const getAllUsers = async (role) => {
    const users = await userModel.findAll(role);
    return users.map(strip);
};

const getUserById = async (id) => {
    const user = await userModel.findById(id);
    if (!user) throw new Error('User not found.');
    return strip(user);
};

// --- Write ---

const updateUserRole = async (id, role) => {
    const user = await userModel.findById(id);
    if (!user) throw new Error('User not found.');
    const updated = await userModel.updateRole(id, role);
    return strip(updated);
};

const deleteUser = async (id) => {
    const user = await userModel.findById(id);
    if (!user) throw new Error('User not found.');

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Cascade: cancel event registrations and soft-delete events owned by this organizer
        if (user.role === 'organizer') {
            const events = await eventModel.findByOrganizer(id);
            for (const event of events) {
                await registrationModel.cancelAllForEvent(event.id, client);
                await eventModel.softDelete(event.id, client);
            }
        }

        await registrationModel.cancelAllForUser(id, client);
        const deleted = await userModel.softDelete(id, client);

        await client.query('COMMIT');
        return strip(deleted);
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

module.exports = { getAllUsers, getUserById, updateUserRole, deleteUser };
