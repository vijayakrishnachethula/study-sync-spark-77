const serverless = require('serverless-http');
const app = require('../backend/serverless-app');

module.exports = serverless(app);


