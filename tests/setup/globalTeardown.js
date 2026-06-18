const { execSync } = require('child_process');

const CONTAINER = 'pg-test';

module.exports = async function globalTeardown() {
    try {
        execSync(`docker stop ${CONTAINER}`, { stdio: 'pipe' });
    } catch (err) {
        console.warn(`[teardown] Could not stop container: ${err.message}`);
    }

    try {
        execSync(`docker rm ${CONTAINER}`, { stdio: 'pipe' });
    } catch (err) {
        console.warn(`[teardown] Could not remove container: ${err.message}`);
    }
};
