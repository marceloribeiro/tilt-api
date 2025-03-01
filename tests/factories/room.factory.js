const { faker } = require('@faker-js/faker');
const Room = require('../../src/app/models/room');

class RoomFactory {
  static async createRoom(overrides = {}) {
    const defaultAttributes = {
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      image_url: faker.image.url(),
      location: faker.location.city(),
      latitude: parseFloat(faker.location.latitude()),
      longitude: parseFloat(faker.location.longitude())
    };

    return await Room.query().insert({
      ...defaultAttributes,
      ...overrides
    });
  }
}

module.exports = RoomFactory;