const { faker } = require('@faker-js/faker');
const Auction = require('../../src/app/models/auction');

class AuctionFactory {
  static async createAuction(overrides = {}) {
    const startDate = faker.date.future();
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + faker.number.int({ min: 1, max: 24 }));

    const startingPrice = parseFloat(faker.commerce.price());
    const currentPrice = overrides.current_price || startingPrice;

    const defaultAttributes = {
      status: faker.helpers.arrayElement(Object.values(Auction.STATUSES)),
      starting_price: startingPrice,
      current_price: currentPrice,
      currency: faker.finance.currencyCode(),
      starts_at: startDate.toISOString(),
      ends_at: endDate.toISOString()
    };

    return await Auction.query().insert({
      ...defaultAttributes,
      ...overrides
    });
  }
}

module.exports = AuctionFactory;