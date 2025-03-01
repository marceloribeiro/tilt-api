const knex = require('knex');
const { Model } = require('objection');
const knexConfig = require('../knexfile');

// Initialize knex with test config
const testKnex = knex(knexConfig.test);
Model.knex(testKnex);

// Export knex instance for use in factories
module.exports = testKnex;