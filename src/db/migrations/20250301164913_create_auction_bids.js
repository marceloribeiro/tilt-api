exports.up = function(knex) {
  return knex.schema
    .createTable('auction_bids', table => {
      table.increments('id').primary();
      table.integer('auction_id').unsigned().notNullable();
      table.integer('bidder_id').unsigned().notNullable();
      table.string('status').notNullable();
      table.float('amount').notNullable();
      table.string('currency').notNullable();

      table.timestamps(true, true);
      table.foreign('auction_id').references('auctions.id').onDelete('CASCADE');
      table.foreign('bidder_id').references('users.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('auction_bids')
};