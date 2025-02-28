exports.up = function(knex) {
  return knex.schema.table('users', table => {
    table.string('hashed_password');
    table.string('salt');
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', table => {
    table.dropColumn('hashed_password');
    table.dropColumn('salt');
  });
};