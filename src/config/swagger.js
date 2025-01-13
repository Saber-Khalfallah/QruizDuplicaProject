const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Qruiz API Documentation',
            version: '1.0.0',
            description: 'Automatically generated API documentation using Swagger',
        },
        servers: [
            {
                url: 'https://qruizduplicaproject.onrender.com/', 
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token in the format: Bearer <token>',
                },
            },
        },
    },
    apis: ['./src/routes/*.js'], // Path to your route files
};

const specs = swaggerJsdoc(swaggerOptions);

module.exports = specs;
