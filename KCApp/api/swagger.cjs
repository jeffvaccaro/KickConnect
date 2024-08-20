const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'KickConnectAPI',
            version: '1.0.0',
            description: 'API Documentation',
            contact: {
                name: 'Jeff',
                email: 'jeff.vaccaro@live.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            }
        ],
        components: {
            schemas: {
                Location: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'The location ID',
                            example: 1
                        },
                        name: {
                            type: 'string',
                            description: 'The location name',
                            example: 'Denver'
                        }
                    }
                }
            }
        }
    },
    apis: ['./server.cjs','./auth.cjs'] // Path to your API routes
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};
