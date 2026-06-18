require('dotenv').config();

const express = require('express');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const limiters = require('./src/middlewares/rateLimiter.middleware');

const app = express();

app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
    app.use(limiters.api);
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/events', require('./src/routes/event.routes'));
app.use('/api/registrations', require('./src/routes/registration.routes'));
app.use('/api/users', require('./src/routes/user.routes'));

module.exports = app;
