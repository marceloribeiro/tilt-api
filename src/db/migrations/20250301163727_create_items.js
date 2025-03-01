exports.up = function(knex) {
  return knex.schema
    .createTable('items', table => {
      table.increments('id').primary();
      table.integer('owner_id').unsigned().nullable();
      table.integer('category_id').unsigned().nullable();
      table.integer('brand_id').unsigned().nullable();
      table.integer('style_id').unsigned().nullable();
      table.integer('footwear_size_id').unsigned().nullable();
      table.integer('top_size_id').unsigned().nullable();
      table.string('name').nullable();
      table.string('description').nullable();
      table.string('image_url').nullable();
      table.string('location').nullable();
      table.float('latitude').nullable();
      table.float('longitude').nullable();
      table.string('status').nullable();
      table.float('price').nullable();
      table.string('currency').nullable();
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