exports.seed = async function(knex) {
  await knex('categories').del();

  await knex('categories').insert([
    { name: 'Menswear' },
    { name: 'Womenswear' },
    { name: 'Kidswear' },
    { name: 'Footwear' },
    { name: 'Accessories' }
  ]);
};