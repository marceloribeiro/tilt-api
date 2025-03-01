const { faker } = require('@faker-js/faker');
const FootwearSize = require('../../src/app/models/footwear_size');

class FootwearSizeFactory {
  static async createFootwearSize(overrides = {}) {
    const sizes = ['US 6', 'US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'];

    const defaultAttributes = {
      name: faker.helpers.arrayElement(sizes)
    };

    return await FootwearSize.query().insert({
      ...defaultAttributes,
      ...overrides
    });
  }
}

module.exports = FootwearSizeFactory;