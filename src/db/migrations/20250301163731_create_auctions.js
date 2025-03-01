exports.up = function(knex) {
  return knex.schema
    .createTable('auctions', table => {
      table.increments('id').primary();
      table.integer('owner_id').unsigned().notNullable();
      table.integer('item_id').unsigned().notNullable();
      table.string('status').notNullable();
      table.float('starting_price').notNullable();
      table.float('current_price').notNullable();
      table.string('currency').notNullable();
      table.dateTime('starts_at').notNullable();
      table.dateTime('ends_at').notNullable();
      table.timestamps(true, true);

      table.foreign('owner_id').references('users.id').onDelete('CASCADE');
      table.foreign('item_id').references('items.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('auctions')
};