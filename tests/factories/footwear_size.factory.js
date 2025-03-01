const { faker } = require('@faker-js/faker');
const FootwearSize = require('../../src/app/models/footwear_size');

class FootwearSizeFactory {
  static async createFootwearSize(overrides = {}) {
    const defaultAttributes = {
      name: faker.number.int({ min: 35, max: 47 }).toString(),
    };

    return await FootwearSize.query().insert({
      ...defaultAttributes,
      ...overrides
    });
  }
}

module.exports = FootwearSizeFactory;