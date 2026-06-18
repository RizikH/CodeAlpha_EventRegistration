module.exports = {
    testEnvironment: 'node',
    globalSetup: './tests/setup/globalSetup.js',
    globalTeardown: './tests/setup/globalTeardown.js',
    setupFilesAfterEnv: ['./tests/setup/jestSetup.js'],
    testMatch: ['**/tests/**/*.test.js'],
    testTimeout: 30000,
};
