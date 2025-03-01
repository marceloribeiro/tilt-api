exports.up = function(knex) {
  return knex.schema.alterTable('auctions', (table) => {
    table.integer('highest_auction_bid_id')
      .unsigned()
      .references('id')
      .inTable('auction_bids')
      .onDelete('SET NULL');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('auctions', (table) => {
    table.dropColumn('highest_auction_bid_id');
  });
};
