const knex = require('knex');
const { Model } = require('objection');
const knexConfig = require('../knexfile');

// Initialize knex with test config
const testKnex = knex(knexConfig.test);
Model.knex(testKnex);

// Global setup
beforeAll(async () => {
  // Run migrations
  await testKnex.migrate.latest();
});

// Clean up after each test
afterEach(async () => {
  const tables = ['users']; // Add your table names
  for (const table of tables) {
    await testKnex.raw(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
  }
});

// Cleanup after all tests
afterAll(async () => {
  await testKnex.destroy();
});

// Export knex instance for use in factories
module.exports = testKnex;