const { faker } = require('@faker-js/faker');
const Item = require('../../src/app/models/item');

class ItemFactory {
  static async createItem(overrides = {}) {
    const defaultAttributes = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      image_url: faker.image.url(),
      location: faker.location.city(),
      latitude: parseFloat(faker.location.latitude()),
      longitude: parseFloat(faker.location.longitude()),
      status: faker.helpers.arrayElement(Object.values(Item.STATUSES)),
      price: parseFloat(faker.commerce.price()),
      currency: faker.finance.currencyCode()
    };

    return await Item.query().insert({
      ...defaultAttributes,
      ...overrides
    });
  }
}

module.exports = ItemFactory;