# CodeAlpha Event Registration API

A RESTful API for managing events and attendee registrations, built as part of the CodeAlpha internship program (Task 2).

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-38%20tests-C21325?logo=jest&logoColor=white)

---

## Overview

The Event Registration API allows organizers to create and manage events, attendees to register for them, and admins to oversee the entire system. Built with Node.js, Express 5, and raw PostgreSQL via `pg` — no ORM. Authentication is JWT-based with role-gated endpoints, and the registration system includes automatic waitlisting and promotion when a confirmed spot opens up.

---

## Features

- JWT authentication with three roles: **admin**, **organizer**, **attendee**
- Full event lifecycle: create, update, delete (soft), list, and view
- Registration with automatic **waitlist promotion** when a confirmed spot is cancelled
- **Cascade delete**: removing an organizer cancels their events' registrations and soft-deletes their events
- Joi validation on all request bodies with descriptive error messages
- Rate limiting: 5 login attempts / 15 min, 100 API requests / 15 min
- Swagger UI docs at `/api-docs`
- Integration test suite: spins up an ephemeral Docker PostgreSQL container, runs 38 tests, tears it down — no manual DB setup needed

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for the dev database and test suite)

---

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=event_registration
DB_USER=event_admin
DB_PASSWORD=event_admin_password
JWT_SECRET=your_64_char_hex_secret_here
PORT=3000
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Start the database

```bash
docker compose up -d
```

### 4. Run the migration

```bash
docker exec -i $(docker compose ps -q postgres) psql -U event_admin -d event_registration < db/migrations/001_init.sql
```

### 5. Start the server

```bash
pnpm dev       # development (nodemon)
pnpm start     # production
```

The API will be available at `http://localhost:3000`.  
Swagger docs: `http://localhost:3000/api-docs`

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `event_registration` |
| `DB_USER` | Database user | `event_admin` |
| `DB_PASSWORD` | Database password | `event_admin_password` |
| `JWT_SECRET` | Secret for signing JWTs (min 64 chars) | `97cb761a...` |
| `PORT` | HTTP server port | `3000` |

---

## API Reference

All responses follow the shape:
```json
{ "success": true,  "data": { ... } }
{ "success": false, "message": "..." }
```

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | None | Register a new user |
| POST | `/login` | None | Login and receive a JWT |

**Register body:**
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "Password1!",
  "role": "attendee"
}
```
Password rules: min 8 chars, at least one uppercase, one lowercase, one special character (`!@#$%^&*`). Role defaults to `attendee` if omitted.

---

### Events — `/api/events`

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/` | None | Any | List all active events |
| GET | `/:id` | None | Any | Get event by ID |
| POST | `/` | Bearer | organizer, admin | Create an event |
| PATCH | `/:id` | Bearer | organizer, admin | Update own event |
| DELETE | `/:id` | Bearer | organizer, admin | Soft-delete own event (cancels all registrations) |
| GET | `/:id/registrations` | Bearer | organizer, admin | List registrations for own event |
| POST | `/:id/register` | Bearer | Any | Register for an event |

**Create/update event body:**
```json
{
  "title": "Tech Conference 2025",
  "description": "Annual developer conference",
  "location": "Dubai World Trade Centre",
  "eventDate": "2025-12-01T09:00:00.000Z",
  "capacity": 100
}
```

---

### Registrations — `/api/registrations`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/me` | Bearer | Get your own registrations |
| PATCH | `/:id/cancel` | Bearer | Cancel a registration (promotes oldest waitlisted) |

---

### Users — `/api/users`

All endpoints require admin role.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Bearer (admin) | List all users (optional `?role=` filter) |
| GET | `/:id` | Bearer (admin) | Get user by ID |
| PATCH | `/:id/role` | Bearer (admin) | Update user role |
| DELETE | `/:id` | Bearer (admin) | Cascade-delete user |

---

## Roles & Permissions

| Role | Capabilities |
|---|---|
| **attendee** | Register/cancel for events, view own registrations |
| **organizer** | Everything attendee can do + create/update/delete own events, view own event registrations |
| **admin** | Full access to all endpoints including user management |

---

## Running Tests

Make sure Docker Desktop is running, then:

```bash
pnpm test
```

The test suite will:
1. Start a fresh PostgreSQL container (`pg-test`) on port **5433**
2. Run the migration against it
3. Execute 38 integration tests across 4 suites (auth, events, registrations, users)
4. Stop and remove the container

All tests run serially (`--runInBand`) against a real database — no mocks.

---

## Project Structure

```
├── app.js                        # Express app (no listen — for Supertest compatibility)
├── server.js                     # Entry point — connects DB then starts server
├── jest.config.js                # Jest configuration
├── docker-compose.yml            # Dev PostgreSQL container
├── db/
│   └── migrations/
│       └── 001_init.sql          # Schema: users, events, registrations
├── config/
│   ├── db.js                     # pg Pool + connect helper
│   └── swagger.js                # Swagger/OpenAPI spec config
├── src/
│   ├── models/                   # Raw SQL queries via pg
│   │   ├── user.model.js
│   │   ├── event.model.js
│   │   └── registration.model.js
│   ├── services/                 # Business logic + transactions
│   │   ├── auth.service.js
│   │   ├── event.service.js
│   │   ├── registration.service.js
│   │   └── user.service.js
│   ├── controllers/              # Request/response handlers
│   │   ├── auth.controller.js
│   │   ├── event.controller.js
│   │   ├── registration.controller.js
│   │   └── user.controller.js
│   ├── routes/                   # Express routers
│   │   ├── auth.routes.js
│   │   ├── event.routes.js
│   │   ├── registration.routes.js
│   │   └── user.routes.js
│   ├── validators/               # Joi validation middleware
│   │   ├── auth.validator.js
│   │   ├── event.validator.js
│   │   ├── registration.validator.js
│   │   └── user.validator.js
│   ├── middlewares/
│   │   ├── auth.middleware.js    # JWT verification
│   │   ├── role.middleware.js    # Role-based access control
│   │   └── rateLimiter.middleware.js
│   └── utils/
│       ├── jwt.js                # generateToken / verifyToken
│       └── response.js           # sendSuccess / sendError
└── tests/
    ├── setup/                    # Docker lifecycle + test helpers
    └── *.test.js                 # Integration test suites
```

---

## License

ISC
