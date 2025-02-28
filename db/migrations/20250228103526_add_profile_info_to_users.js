exports.up = function(knex) {
  return knex.schema.table('users', table => {
    table.string('user_name');
    table.string('first_name');
    table.string('last_name');
    table.string('email');
    table.string('referral_code');

  });
};

exports.down = function(knex) {
  return knex.schema.table('users', table => {
    table.string('referral_code');
    table.string('email');
    table.string('last_name');
    table.string('first_name');
    table.string('user_name');
  });
};