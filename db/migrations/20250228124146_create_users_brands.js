exports.up = function(knex) {
  return knex.schema
    .createTable('users_brands', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.integer('brand_id').unsigned().notNullable();
      table.timestamps(true, true);

      table.foreign('user_id').references('users.id').onDelete('CASCADE');
      table.foreign('brand_id').references('brands.id').onDelete('CASCADE');
      table.unique(['user_id', 'brand_id']);
    })
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('users_brands')
};