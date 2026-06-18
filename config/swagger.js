const swaggerJSDoc = require('swagger-jsdoc');

// Swagger definition
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'EventRegistration API',
        version: '1.0.0',
        description: 'API documentation for CodeAlpha EventRegistration',
    },
    servers: [{ url: '/api' }]
};

// Options for swagger-jsdoc
const options = {
    definition: swaggerDefinition,
    apis: ['./docs/openapi.yaml']
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;