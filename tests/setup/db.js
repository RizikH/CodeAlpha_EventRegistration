const { query } = require('../../config/db');

// Wipes all tables between test files — foreign-key order handled by CASCADE
const truncateAll = async () => {
    await query('TRUNCATE TABLE registrations, events, users RESTART IDENTITY CASCADE');
};

module.exports = { truncateAll };
