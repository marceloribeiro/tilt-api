const { faker } = require('@faker-js/faker');
const Brand = require('../../src/app/models/brand');

class BrandFactory {
  static async createBrand(overrides = {}) {
    const defaultAttributes = {
      name: faker.company.name()
    };

    return await Brand.query().insert({
      ...defaultAttributes,
      ...overrides
    });
  }
}

module.exports = BrandFactory;