const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tilt API',
      version: '1.0.0',
      description: 'API documentation for the Tilt application',
      contact: {
        name: 'API Support',
        url: 'http://localhost:3000'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ]
  },
  apis: ['./app/routes/**/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

module.exports = specs;