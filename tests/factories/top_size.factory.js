const { faker } = require('@faker-js/faker');
const TopSize = require('../../src/app/models/top_size');

class TopSizeFactory {
  static async createTopSize(overrides = {}) {
    const defaultAttributes = {
      name: faker.helpers.arrayElement(['XS', 'S', 'M', 'L', 'XL', 'XXL'])
    };

    return await TopSize.query().insert({
      ...defaultAttributes,
      ...overrides
    });
  }
}

module.exports = TopSizeFactory;