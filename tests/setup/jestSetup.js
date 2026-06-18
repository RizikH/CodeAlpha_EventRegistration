// Drains the pg connection pool after all tests complete so Jest exits cleanly
const { pool } = require('../../config/db');

afterAll(async () => {
    await pool.end();
});
