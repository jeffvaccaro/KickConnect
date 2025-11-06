const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'KickConnect API',
    description: 'Auto-generated Swagger documentation',
  },
  host: 'localhost:3000',
  schemes: ['http'],
  tags: [
    { name: 'User' },
    { name: 'Login' },
    { name: 'Location' },
    { name: 'Membership' },
    { name: 'Schedule' },
    { name: 'Role' },
    { name: 'Event' },
    { name: 'Common' },
    { name: 'Account' },
    { name: 'Skill' },
    { name: 'HTML Generator' },
  ],
};

const outputFile = './swagger-output.json';
const endpointsFiles = [
  './server.js',
  './user.js',
  './login.js',
  './location.js',
  './membership.js',
  './schedule.js',
  './role.cjs',
  './event.js',
  './zipcode.js',
  './account.js',
  './skill.js',
  './html-generator.js',
];

swaggerAutogen(outputFile, endpointsFiles, doc);