const serverless = require('serverless-http');
const app = require('../../backend/serverless-app');

// In Netlify, function paths include '/.netlify/functions/api'.
// Configure basePath so Express routes like '/health' and '/api/users' resolve correctly.
module.exports.handler = serverless(app, { basePath: '/.netlify/functions/api' });


