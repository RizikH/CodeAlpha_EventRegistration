const request = require('supertest');
const app = require('../app');
const { truncateAll } = require('./setup/db');
const { createUser, createEvent, getAuthHeader } = require('./setup/helpers');

let attendee1Token;
let attendee2Token;
let attendee3Token;
let attendee1Id;
let registration1Id;
let registration2Id;
let registration3Id;

beforeAll(async () => {
    await truncateAll();

    const organizer = await createUser({ role: 'organizer', email: 'rorg@example.com' });
    const event = await createEvent(organizer.token, { capacity: 2 });

    const att1 = await createUser({ role: 'attendee', email: 'ratt1@example.com' });
    attendee1Token = att1.token;
    attendee1Id = att1.user.id;

    const att2 = await createUser({ role: 'attendee', email: 'ratt2@example.com' });
    attendee2Token = att2.token;

    const att3 = await createUser({ role: 'attendee', email: 'ratt3@example.com' });
    attendee3Token = att3.token;

    // Pre-register all three: att1 + att2 → confirmed, att3 → waitlisted
    const r1 = await request(app)
        .post(`/api/events/${event.id}/register`)
        .set(getAuthHeader(attendee1Token));
    registration1Id = r1.body.data.id;

    const r2 = await request(app)
        .post(`/api/events/${event.id}/register`)
        .set(getAuthHeader(attendee2Token));
    registration2Id = r2.body.data.id;

    const r3 = await request(app)
        .post(`/api/events/${event.id}/register`)
        .set(getAuthHeader(attendee3Token));
    registration3Id = r3.body.data.id;
});

describe('GET /api/registrations/me', () => {
    it('returns the authenticated user\'s registrations', async () => {
        const res = await request(app)
            .get('/api/registrations/me')
            .set(getAuthHeader(attendee1Token));
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.some((r) => r.id === registration1Id)).toBe(true);
    });

    it('returns 401 when unauthenticated', async () => {
        const res = await request(app).get('/api/registrations/me');
        expect(res.status).toBe(401);
    });
});

describe('PATCH /api/registrations/:id/cancel', () => {
    it('cancels a confirmed registration and promotes the waitlisted attendee', async () => {
        // Cancel attendee1's confirmed registration
        const cancel = await request(app)
            .patch(`/api/registrations/${registration1Id}/cancel`)
            .set(getAuthHeader(attendee1Token));
        expect(cancel.status).toBe(200);
        expect(cancel.body.data.status).toBe('cancelled');

        // Attendee3 (was waitlisted) should now be confirmed
        const me = await request(app)
            .get('/api/registrations/me')
            .set(getAuthHeader(attendee3Token));
        const promoted = me.body.data.find((r) => r.id === registration3Id);
        expect(promoted.status).toBe('confirmed');
    });

    it('returns 409 when trying to cancel an already-cancelled registration', async () => {
        const res = await request(app)
            .patch(`/api/registrations/${registration1Id}/cancel`)
            .set(getAuthHeader(attendee1Token));
        expect(res.status).toBe(409);
    });

    it('returns 403 when trying to cancel another user\'s registration', async () => {
        const res = await request(app)
            .patch(`/api/registrations/${registration2Id}/cancel`)
            .set(getAuthHeader(attendee1Token));
        expect(res.status).toBe(403);
    });
});
