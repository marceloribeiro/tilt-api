exports.seed = async function(knex) {
  await knex('top_sizes').del();

  await knex('top_sizes').insert([
    { name: 'S' },
    { name: 'M' },
    { name: 'L' },
    { name: 'XL' }
  ]);
};