const request = require('supertest');
const app = require('../app');
const { truncateAll } = require('./setup/db');

beforeAll(async () => {
    await truncateAll();
});

describe('POST /api/auth/register', () => {
    it('registers a new user and returns 201 with token', async () => {
        const res = await request(app).post('/api/auth/register').send({
            name: 'Alice',
            email: 'alice@example.com',
            password: 'Password1!',
            role: 'attendee',
        });
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.user.email).toBe('alice@example.com');
        expect(res.body.data.token).toBeDefined();
        expect(res.body.data.user.password).toBeUndefined();
    });

    it('returns 400 on duplicate email', async () => {
        await request(app).post('/api/auth/register').send({
            name: 'Alice2',
            email: 'alice@example.com',
            password: 'Password1!',
        });
        const res = await request(app).post('/api/auth/register').send({
            name: 'Alice Duplicate',
            email: 'alice@example.com',
            password: 'Password1!',
        });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('returns 422 when password is too weak', async () => {
        const res = await request(app).post('/api/auth/register').send({
            name: 'Bob',
            email: 'bob@example.com',
            password: 'weak',
        });
        expect(res.status).toBe(422);
        expect(res.body.success).toBe(false);
    });

    it('returns 422 when password lacks uppercase', async () => {
        const res = await request(app).post('/api/auth/register').send({
            name: 'Bob',
            email: 'bob2@example.com',
            password: 'password1!',
        });
        expect(res.status).toBe(422);
    });
});

describe('POST /api/auth/login', () => {
    const loginEmail = `carol_${Date.now()}@example.com`;

    beforeAll(async () => {
        const reg = await request(app).post('/api/auth/register').send({
            name: 'Carol',
            email: loginEmail,
            password: 'Password1!',
        });
        if (reg.status !== 201) {
            throw new Error(`Login test setup failed: could not register carol (${reg.status}): ${JSON.stringify(reg.body)}`);
        }
    });

    it('returns 200 with token on valid credentials', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: loginEmail,
            password: 'Password1!',
        });
        expect(res.status).toBe(200);
        expect(res.body.data.token).toBeDefined();
    });

    it('returns 401 on wrong password', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: loginEmail,
            password: 'WrongPass1!',
        });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it('returns 401 on unknown email', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: 'nobody@example.com',
            password: 'Password1!',
        });
        expect(res.status).toBe(401);
    });
});
