exports.up = function(knex) {
  return knex.schema
    .createTable('items', table => {
      table.increments('id').primary();
      table.integer('owner_id').unsigned().notNullable();
      table.integer('category_id').unsigned().notNullable();
      table.integer('brand_id').unsigned().notNullable();
      table.integer('style_id').unsigned().notNullable();
      table.integer('footwear_size_id').unsigned().notNullable();
      table.integer('top_size_id').unsigned().notNullable();
      table.string('name').notNullable();
      table.string('description').notNullable();
      table.string('image_url').notNullable();
      table.string('location').notNullable();
      table.float('latitude').notNullable();
      table.float('longitude').notNullable();
      table.string('status').notNullable();
      table.float('price').notNullable();
      table.string('currency').notNullable();
      table.timestamps(true, true);

      table.foreign('owner_id').references('users.id').onDelete('CASCADE');
      table.foreign('category_id').references('categories.id').onDelete('CASCADE');
      table.foreign('brand_id').references('brands.id').onDelete('CASCADE');
      table.foreign('style_id').references('styles.id').onDelete('CASCADE');
      table.foreign('footwear_size_id').references('footwear_sizes.id').onDelete('CASCADE');
      table.foreign('top_size_id').references('top_sizes.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('items')
};