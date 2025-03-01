exports.up = function(knex) {
  return knex.schema
    .createTable('messages', table => {
      table.increments('id').primary();
      table.integer('author_id').unsigned().notNullable();
      table.integer('room_id').unsigned().notNullable();
      table.string('content').notNullable();
      table.string('type').notNullable();
      table.timestamps(true, true);

      table.foreign('author_id').references('users.id').onDelete('CASCADE');
      table.foreign('room_id').references('rooms.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('messages')
};