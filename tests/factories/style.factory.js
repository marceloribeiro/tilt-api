const { faker } = require('@faker-js/faker');
const Style = require('../../src/app/models/style');

class StyleFactory {
  static async createStyle(overrides = {}) {
    const styles = [
      'Footwear',
      'Designer',
      'Vintage',
      'Streetwear',
      'Athletic',
      'Casual',
      'Formal',
      'Boots',
      'Sandals',
      'Sneakers'
    ];

    const defaultAttributes = {
      name: faker.helpers.arrayElement(styles)
    };

    return await Style.query().insert({
      ...defaultAttributes,
      ...overrides
    });
  }
}

module.exports = StyleFactory;