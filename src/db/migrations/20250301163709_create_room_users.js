exports.up = function(knex) {
  return knex.schema
    .createTable('room_users', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.integer('room_id').unsigned().notNullable();
      table.string('status').notNullable();
      table.dateTime('joined_at').notNullable();
      table.dateTime('left_at').nullable();
      table.timestamps(true, true);

      table.foreign('user_id').references('users.id').onDelete('CASCADE');
      table.foreign('room_id').references('rooms.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('room_users')
};