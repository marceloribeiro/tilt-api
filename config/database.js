const { Model } = require('objection');
const Knex = require('knex');
require('dotenv').config();

// Initialize knex
const knex = Knex({
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

// Give the knex instance to objection
Model.knex(knex);

module.exports = knex;