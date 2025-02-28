exports.up = function(knex) {
  return knex.schema.createTable('contacts', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.string('name').notNullable();
    table.string('email');
    table.string('phone_number');
    table.timestamps(true, true);

    // Foreign key constraint
    table.foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('contacts');
};