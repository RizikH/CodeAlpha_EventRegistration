const request = require('supertest');
const app = require('../app');
const { truncateAll } = require('./setup/db');
const { createUser, createEvent, getAuthHeader } = require('./setup/helpers');

let organizerToken;
let attendeeToken;
let otherOrganizerToken;
let testEvent;

beforeAll(async () => {
    await truncateAll();

    const organizer = await createUser({ role: 'organizer', email: 'org1@example.com' });
    organizerToken = organizer.token;

    const attendee = await createUser({ role: 'attendee', email: 'att1@example.com' });
    attendeeToken = attendee.token;

    const otherOrganizer = await createUser({ role: 'organizer', email: 'org2@example.com' });
    otherOrganizerToken = otherOrganizer.token;

    testEvent = await createEvent(organizerToken);
});

describe('GET /api/events', () => {
    it('returns 200 with an array of events', async () => {
        const res = await request(app).get('/api/events');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});

describe('GET /api/events/:id', () => {
    it('returns 200 with the event when found', async () => {
        const res = await request(app).get(`/api/events/${testEvent.id}`);
        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(testEvent.id);
    });

    it('returns 404 for a non-existent event', async () => {
        const res = await request(app).get('/api/events/00000000-0000-0000-0000-000000000000');
        expect(res.status).toBe(404);
    });
});

describe('POST /api/events', () => {
    it('allows organizer to create an event and returns 201', async () => {
        const res = await request(app)
            .post('/api/events')
            .set(getAuthHeader(organizerToken))
            .send({
                title: 'New Event',
                description: 'Created in test suite run',
                location: 'Test Hall',
                eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                capacity: 10,
            });
        expect(res.status).toBe(201);
        expect(res.body.data.title).toBe('New Event');
    });

    it('returns 403 when attendee tries to create an event', async () => {
        const res = await request(app)
            .post('/api/events')
            .set(getAuthHeader(attendeeToken))
            .send({
                title: 'Attendee Event',
                description: 'Should not be created',
                location: 'Nowhere',
                eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                capacity: 5,
            });
        expect(res.status).toBe(403);
    });

    it('returns 401 when unauthenticated', async () => {
        const res = await request(app).post('/api/events').send({
            title: 'Unauth Event',
            description: 'No token provided here',
            location: 'Nowhere',
            eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            capacity: 5,
        });
        expect(res.status).toBe(401);
    });

    it('returns 422 when required fields are missing', async () => {
        const res = await request(app)
            .post('/api/events')
            .set(getAuthHeader(organizerToken))
            .send({ title: 'Missing fields' });
        expect(res.status).toBe(422);
    });
});

describe('PATCH /api/events/:id', () => {
    it('allows organizer to update their own event', async () => {
        const res = await request(app)
            .patch(`/api/events/${testEvent.id}`)
            .set(getAuthHeader(organizerToken))
            .send({ title: 'Updated Title' });
        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe('Updated Title');
    });

    it('returns 403 when another organizer tries to update the event', async () => {
        const res = await request(app)
            .patch(`/api/events/${testEvent.id}`)
            .set(getAuthHeader(otherOrganizerToken))
            .send({ title: 'Hijacked Title' });
        expect(res.status).toBe(403);
    });
});

describe('POST /api/events/:id/register', () => {
    let registerEvent;
    let attendee2Token;
    let attendee3Token;
    let firstRegistrationId;

    beforeAll(async () => {
        // Fresh event with capacity=2 for register/waitlist tests
        registerEvent = await createEvent(organizerToken, { title: 'Register Test Event' });

        const att2 = await createUser({ role: 'attendee', email: 'att2@example.com' });
        attendee2Token = att2.token;
        const att3 = await createUser({ role: 'attendee', email: 'att3@example.com' });
        attendee3Token = att3.token;
    });

    it('registers attendee as confirmed when capacity is available', async () => {
        const res = await request(app)
            .post(`/api/events/${registerEvent.id}/register`)
            .set(getAuthHeader(attendeeToken));
        expect(res.status).toBe(201);
        expect(res.body.data.status).toBe('confirmed');
        firstRegistrationId = res.body.data.id;
    });

    it('registers second attendee as confirmed (fills last slot)', async () => {
        const res = await request(app)
            .post(`/api/events/${registerEvent.id}/register`)
            .set(getAuthHeader(attendee2Token));
        expect(res.status).toBe(201);
        expect(res.body.data.status).toBe('confirmed');
    });

    it('puts third attendee on the waitlist when capacity is full', async () => {
        const res = await request(app)
            .post(`/api/events/${registerEvent.id}/register`)
            .set(getAuthHeader(attendee3Token));
        expect(res.status).toBe(201);
        expect(res.body.data.status).toBe('waitlisted');
    });

    it('returns 409 when attendee tries to register again', async () => {
        const res = await request(app)
            .post(`/api/events/${registerEvent.id}/register`)
            .set(getAuthHeader(attendeeToken));
        expect(res.status).toBe(409);
    });

    it('returns 403 when organizer tries to register for their own event', async () => {
        const res = await request(app)
            .post(`/api/events/${registerEvent.id}/register`)
            .set(getAuthHeader(organizerToken));
        expect(res.status).toBe(403);
    });

    it('allows re-registration after cancelling', async () => {
        // Cancel the first registration
        await request(app)
            .patch(`/api/registrations/${firstRegistrationId}/cancel`)
            .set(getAuthHeader(attendeeToken));

        // Re-register — should succeed
        const res = await request(app)
            .post(`/api/events/${registerEvent.id}/register`)
            .set(getAuthHeader(attendeeToken));
        expect(res.status).toBe(201);
    });
});

describe('GET /api/events/:id/registrations', () => {
    it('returns 200 for the organizer of the event', async () => {
        const res = await request(app)
            .get(`/api/events/${testEvent.id}/registrations`)
            .set(getAuthHeader(organizerToken));
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('returns 403 for an attendee', async () => {
        const res = await request(app)
            .get(`/api/events/${testEvent.id}/registrations`)
            .set(getAuthHeader(attendeeToken));
        expect(res.status).toBe(403);
    });
});

describe('DELETE /api/events/:id', () => {
    it('soft-deletes the event and subsequent GET returns 404', async () => {
        const eventToDelete = await createEvent(organizerToken, { title: 'To Delete' });

        const del = await request(app)
            .delete(`/api/events/${eventToDelete.id}`)
            .set(getAuthHeader(organizerToken));
        expect(del.status).toBe(200);

        const get = await request(app).get(`/api/events/${eventToDelete.id}`);
        expect(get.status).toBe(404);
    });
});
