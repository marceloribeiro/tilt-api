exports.up = function(knex) {
  return knex.schema
    .createTable('livestreams', table => {
      table.increments('id').primary();
      table.integer('room_id').unsigned().notNullable();
      table.integer('host_id').unsigned().notNullable();
      table.string('name').notNullable();
      table.string('description').notNullable();
      table.string('url').notNullable();
      table.string('thumbnail_url').notNullable();
      table.string('status').notNullable();
      table.dateTime('starts_at').notNullable();
      table.dateTime('ends_at').notNullable();
      table.timestamps(true, true);

      table.foreign('room_id').references('rooms.id').onDelete('CASCADE');
      table.foreign('host_id').references('users.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('livestreams')
};