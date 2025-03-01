const { faker } = require('@faker-js/faker');
const Style = require('../../src/app/models/style');

class StyleFactory {
  static async createStyle(overrides = {}) {
    const defaultAttributes = {
      name: faker.commerce.productAdjective(),
    };

    return await Style.query().insert({
      ...defaultAttributes,
      ...overrides
    });
  }
}

module.exports = StyleFactory;