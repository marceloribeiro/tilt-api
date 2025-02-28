exports.up = function(knex) {
  return knex.schema.table('users', table => {
    table.string('phone_number');
    table.string('confirmation_code');
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', table => {
    table.dropColumn('confirmation_code');
    table.dropColumn('phone_number');
  });
};