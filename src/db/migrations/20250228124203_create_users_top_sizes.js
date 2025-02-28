exports.up = function(knex) {
  return knex.schema
    .createTable('users_top_sizes', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.integer('top_size_id').unsigned().notNullable();
      table.timestamps(true, true);

      table.foreign('user_id').references('users.id').onDelete('CASCADE');
      table.foreign('top_size_id').references('top_sizes.id').onDelete('CASCADE');
      table.unique(['user_id', 'top_size_id']);
    })
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('users_top_sizes')
};