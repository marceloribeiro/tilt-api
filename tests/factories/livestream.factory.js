const { faker } = require('@faker-js/faker');
const Livestream = require('../../src/app/models/livestream');

class LivestreamFactory {
  static async createLivestream(overrides = {}) {
    const startDate = faker.date.future();
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2); // Default 2-hour livestream

    const defaultAttributes = {
      name: faker.commerce.productName(),
      description: faker.lorem.sentence(),
      url: faker.internet.url(),
      thumbnail_url: faker.image.url(),
      status: faker.helpers.arrayElement(['scheduled', 'live', 'ended']),
      starts_at: startDate.toISOString(),
      ends_at: endDate.toISOString()
    };

    return await Livestream.query().insert({
      ...defaultAttributes,
      ...overrides
    });
  }
}

module.exports = LivestreamFactory;