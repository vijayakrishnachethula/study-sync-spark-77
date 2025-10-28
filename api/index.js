const app = require('../backend/serverless-app');

module.exports = (req, res) => {
  return app(req, res);
};


