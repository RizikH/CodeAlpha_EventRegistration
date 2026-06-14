CREATE TYPE user_role AS ENUM ('admin', 'organizer', 'attendee');

CREATE TYPE registration_status AS ENUM ('confirmed', 'waitlisted', 'cancelled');

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(225) NOT NULL,
    email VARCHAR(225) NOT NULL UNIQUE,
    password VARCHAR(225) NOT NULL,
    role user_role NOT NULL DEFAULT 'attendee',
    createdAt TIMESTAMP DEFAULT now (),
    deletedAt TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    title VARCHAR(225) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(225) NOT NULL,
    eventDate TIMESTAMP NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    organizerId UUID NOT NULL,
    createdAt TIMESTAMP DEFAULT now (),
    deletedAt TIMESTAMP NULL,
    FOREIGN KEY (organizerId) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    userId UUID NOT NULL,
    eventId UUID NOT NULL,
    status registration_status NOT NULL,
    registeredAt TIMESTAMP DEFAULT now (),
    FOREIGN KEY (userId) REFERENCES users (id),
    FOREIGN KEY (eventId) REFERENCES events (id),
    CONSTRAINT uq_user_event UNIQUE (userId, eventId)
);