const request = require('supertest');
const app = require('../app');
const { truncateAll } = require('./setup/db');
const { createUser, createEvent, getAuthHeader } = require('./setup/helpers');

let adminToken;
let attendeeToken;
let attendeeId;
let organizerId;
let organizerToken;
let createdEventId;

beforeAll(async () => {
    await truncateAll();

    const admin = await createUser({ role: 'admin', email: 'admin@example.com' });
    adminToken = admin.token;

    const attendee = await createUser({ role: 'attendee', email: 'uatt@example.com' });
    attendeeToken = attendee.token;
    attendeeId = attendee.user.id;

    const organizer = await createUser({ role: 'organizer', email: 'uorg@example.com' });
    organizerToken = organizer.token;
    organizerId = organizer.user.id;

    // Organizer creates an event; attendee registers — used in cascade delete test
    const event = await createEvent(organizerToken);
    createdEventId = event.id;

    await request(app)
        .post(`/api/events/${createdEventId}/register`)
        .set(getAuthHeader(attendeeToken));
});

describe('GET /api/users', () => {
    it('returns 200 with all users for admin', async () => {
        const res = await request(app)
            .get('/api/users')
            .set(getAuthHeader(adminToken));
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('returns 403 for an attendee', async () => {
        const res = await request(app)
            .get('/api/users')
            .set(getAuthHeader(attendeeToken));
        expect(res.status).toBe(403);
    });

    it('returns 401 when unauthenticated', async () => {
        const res = await request(app).get('/api/users');
        expect(res.status).toBe(401);
    });
});

describe('GET /api/users/:id', () => {
    it('returns 200 with the user when found', async () => {
        const res = await request(app)
            .get(`/api/users/${attendeeId}`)
            .set(getAuthHeader(adminToken));
        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(attendeeId);
        expect(res.body.data.password).toBeUndefined();
    });

    it('returns 404 for a non-existent user', async () => {
        const res = await request(app)
            .get('/api/users/00000000-0000-0000-0000-000000000000')
            .set(getAuthHeader(adminToken));
        expect(res.status).toBe(404);
    });
});

describe('PATCH /api/users/:id/role', () => {
    it('updates a user\'s role and returns 200', async () => {
        const res = await request(app)
            .patch(`/api/users/${attendeeId}/role`)
            .set(getAuthHeader(adminToken))
            .send({ role: 'organizer' });
        expect(res.status).toBe(200);
        expect(res.body.data.role).toBe('organizer');
    });

    it('returns 422 for an invalid role value', async () => {
        const res = await request(app)
            .patch(`/api/users/${attendeeId}/role`)
            .set(getAuthHeader(adminToken))
            .send({ role: 'superuser' });
        expect(res.status).toBe(422);
    });
});

describe('DELETE /api/users/:id — cascade', () => {
    it('deletes organizer, soft-deletes their event, and returns 200', async () => {
        const res = await request(app)
            .delete(`/api/users/${organizerId}`)
            .set(getAuthHeader(adminToken));
        expect(res.status).toBe(200);

        // Organizer's event should be soft-deleted
        const eventRes = await request(app).get(`/api/events/${createdEventId}`);
        expect(eventRes.status).toBe(404);

        // Organizer account should be soft-deleted
        const userRes = await request(app)
            .get(`/api/users/${organizerId}`)
            .set(getAuthHeader(adminToken));
        expect(userRes.status).toBe(404);
    });
});
