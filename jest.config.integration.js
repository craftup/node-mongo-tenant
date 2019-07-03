const testConfig = require('./jest.config');
module.exports = {
  ...testConfig,
  testMatch: ['**/?(*.)+(test.integration).js'],
};
