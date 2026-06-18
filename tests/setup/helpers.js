const request = require('supertest');
const app = require('../../app');

let userCounter = 0;

// Creates a user via the real HTTP stack and returns { user, token }
const createUser = async (overrides = {}) => {
    userCounter += 1;
    const defaults = {
        name: `Test User ${userCounter}`,
        email: `testuser${userCounter}@example.com`,
        password: 'Password1!',
        role: 'attendee',
    };
    const body = { ...defaults, ...overrides };

    const res = await request(app).post('/api/auth/register').send(body);
    if (res.status !== 201) {
        throw new Error(`createUser failed: ${JSON.stringify(res.body)}`);
    }
    return res.body.data;
};

// Returns an Authorization header object for use with supertest .set()
const getAuthHeader = (token) => ({ Authorization: `Bearer ${token}` });

// Creates an event via the real HTTP stack and returns the event object
const createEvent = async (token, overrides = {}) => {
    const defaults = {
        title: 'Test Event',
        description: 'A test event with enough description',
        location: 'Test Venue',
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        capacity: 2, // Small capacity so waitlist tests work with few users
    };
    const body = { ...defaults, ...overrides };

    const res = await request(app)
        .post('/api/events')
        .set(getAuthHeader(token))
        .send(body);
    if (res.status !== 201) {
        throw new Error(`createEvent failed: ${JSON.stringify(res.body)}`);
    }
    return res.body.data;
};

module.exports = { createUser, getAuthHeader, createEvent };
