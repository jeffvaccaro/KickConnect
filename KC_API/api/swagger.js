const swaggerAutogen = require('swagger-autogen')();

const env = process.env.NODE_ENV || 'development';
const isLocal = env === 'development';

const doc = {
  info: {
    title: 'KickConnect API',
    description: 'Auto-generated Swagger documentation',
  },
  host: isLocal ? 'localhost:3000' : 'api.kickconnect.net',
  schemes: isLocal ? ['http'] : ['https'],
  tags: [
  
    { name: 'Login' },
    { name: 'Location' },
    { name: 'Staff' },
    { name: 'Membership' },
    { name: 'Membership Attendance' },
    { name: 'Membership Plan' },    
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
  './staff.js',
  './login.js',
  './location.js',
  './membership.js',
  './membership-attendance.js',
  './membership-plan.js',
  './schedule.js',
  './role.cjs',
  './event.js',
  './zipcode.js',
  './account.js',
  './skill.js',
  './html-generator.js',
];

swaggerAutogen(outputFile, endpointsFiles, doc);