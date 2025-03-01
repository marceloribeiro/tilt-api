exports.up = function(knex) {
  return knex.schema
    .createTable('rooms', table => {
      table.increments('id').primary();
      table.integer('host_id').unsigned().notNullable();
      table.string('name').notNullable();
      table.string('description').notNullable();
      table.string('image_url').notNullable();
      table.string('location').notNullable();
      table.float('latitude').notNullable();
      table.float('longitude').notNullable();
      table.timestamps(true, true);

      table.foreign('host_id').references('users.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('rooms')
};