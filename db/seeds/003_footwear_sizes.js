exports.seed = async function(knex) {
  await knex('footwear_sizes').del();

  await knex('footwear_sizes').insert([
    { name: 'US 8' },
    { name: 'US 9' },
    { name: 'US 10' },
    { name: 'US 11' }
  ]);
};