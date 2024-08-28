const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


const swaggerOptions = {
    definition: {
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
        tags: [
            {
                name: 'Login',
            },
            {
                name: 'Account',
            },
            {
                name: 'Location',
            },            
            {
                name: 'User',
            },
            {
                name: 'Role',
            },
            {
                name: 'Class',
            }                       
        ]
    },
    apis: ['./*.cjs'],
};


const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    app.get('/json-docs/openapi.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerDocs);
        console.log("json output");
    });
};