const { faker } = require('@faker-js/faker');
const TopSize = require('../../src/app/models/top_size');

class TopSizeFactory {
  static async createTopSize(overrides = {}) {
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    const defaultAttributes = {
      name: faker.helpers.arrayElement(sizes)
    };

    return await TopSize.query().insert({
      ...defaultAttributes,
      ...overrides
    });
  }
}

module.exports = TopSizeFactory;