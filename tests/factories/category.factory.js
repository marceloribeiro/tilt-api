const { faker } = require('@faker-js/faker');
const Category = require('../../src/app/models/category');

class CategoryFactory {
  static async createCategory(overrides = {}) {
    const defaultAttributes = {
      name: faker.commerce.department()
    };

    return await Category.query().insert({
      ...defaultAttributes,
      ...overrides
    });
  }
}

module.exports = CategoryFactory;