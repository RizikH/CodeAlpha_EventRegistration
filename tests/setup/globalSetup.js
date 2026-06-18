const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONTAINER = 'pg-test';
const TEST_PORT = 5433;
const TEST_DB = 'event_registration_test';
const PG_USER = 'event_admin';
const PG_PASSWORD = 'event_admin_password';

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = async function globalSetup() {
    // Verify Docker is running
    try {
        execSync('docker info', { stdio: 'pipe' });
    } catch {
        throw new Error('Docker is not running. Start Docker Desktop before running tests.');
    }

    // Remove any leftover container from a previous crashed run
    try {
        execSync(`docker rm -f ${CONTAINER}`, { stdio: 'pipe' });
    } catch {
        // Container didn't exist — that's fine
    }

    // Start the test container on a separate port to avoid conflicts with dev DB
    execSync(
        `docker run --name ${CONTAINER} -d ` +
        `-e POSTGRES_DB=${TEST_DB} ` +
        `-e POSTGRES_USER=${PG_USER} ` +
        `-e POSTGRES_PASSWORD=${PG_PASSWORD} ` +
        `-p ${TEST_PORT}:5432 ` +
        `postgres:15.18`,
        { stdio: 'pipe' },
    );

    // Poll until Postgres is ready to accept connections
    let ready = false;
    for (let i = 0; i < 30; i++) {
        await sleep(500);
        try {
            execSync(
                `docker exec ${CONTAINER} pg_isready -U ${PG_USER} -d ${TEST_DB}`,
                { stdio: 'pipe' },
            );
            ready = true;
            break;
        } catch {
            // Not ready yet
        }
    }

    if (!ready) {
        throw new Error('Test PostgreSQL container did not become ready in time.');
    }

    // Run the migration
    const migrationPath = path.join(__dirname, '../../db/migrations/001_init.sql');
    execSync(
        `docker exec -i ${CONTAINER} psql -U ${PG_USER} -d ${TEST_DB}`,
        {
            input: fs.readFileSync(migrationPath),
            stdio: ['pipe', 'pipe', 'pipe'],
        },
    );

    // Point the test worker pool at the test container
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = String(TEST_PORT);
    process.env.DB_NAME = TEST_DB;
    process.env.DB_USER = PG_USER;
    process.env.DB_PASSWORD = PG_PASSWORD;
};
