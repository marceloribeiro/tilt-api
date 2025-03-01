const { faker } = require('@faker-js/faker');
const AuctionBid = require('../../src/app/models/auction_bid');

class AuctionBidFactory {
  static async createAuctionBid(overrides = {}) {
    const defaultAttributes = {
      status: faker.helpers.arrayElement(Object.values(AuctionBid.STATUSES)),
      amount: parseFloat(faker.commerce.price({ min: 100, max: 10000 })),
      currency: faker.finance.currencyCode()
    };

    return await AuctionBid.query().insert({
      ...defaultAttributes,
      ...overrides
    });
  }
}

module.exports = AuctionBidFactory;