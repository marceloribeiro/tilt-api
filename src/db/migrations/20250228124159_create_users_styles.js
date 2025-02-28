exports.up = function(knex) {
  return knex.schema
    .createTable('users_styles', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.integer('style_id').unsigned().notNullable();
      table.timestamps(true, true);

      table.foreign('user_id').references('users.id').onDelete('CASCADE');
      table.foreign('style_id').references('styles.id').onDelete('CASCADE');
      table.unique(['user_id', 'style_id']);
    })
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('users_styles')
};