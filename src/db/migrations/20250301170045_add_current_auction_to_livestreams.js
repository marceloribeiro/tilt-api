exports.up = function(knex) {
  return knex.schema.alterTable('livestreams', (table) => {
    table.integer('current_auction_id')
      .unsigned()
      .references('id')
      .inTable('auctions')
      .onDelete('SET NULL');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('livestreams', (table) => {
    table.dropColumn('current_auction_id');
  });
};
