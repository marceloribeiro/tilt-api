exports.seed = async function(knex) {
  await knex('styles').del();

  await knex('styles').insert([
    { name: 'Footwear' },
    { name: 'Designer' },
    { name: 'Vintage' },
    { name: 'Streetwear' },
    { name: 'Athletic' },
    { name: 'Casual' },
    { name: 'Formal' },
    { name: 'Boots' },
    { name: 'Sandals' },
    { name: 'Sneakers' }
  ]);
};