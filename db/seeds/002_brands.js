exports.seed = async function(knex) {
  await knex('brands').del();

  await knex('brands').insert([
    { name: 'Nike' },
    { name: 'Adidas' },
    { name: 'Puma' },
    { name: 'Converse' },
    { name: 'Vans' },
    { name: 'New Balance' },
    { name: 'Reebok' }
  ]);
};