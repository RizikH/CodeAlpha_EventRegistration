require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

const query = (text, params) => pool.query(text, params);

// Verifies DB connectivity on startup
const connect = async () => {
    const client = await pool.connect();
    console.log('PostgreSQL connected');
    client.release();
};

module.exports = { query, connect, pool };
