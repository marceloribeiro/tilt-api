const { faker } = require('@faker-js/faker');
const RoomUser = require('../../src/app/models/room_user');

class RoomUserFactory {
  static async createRoomUser(overrides = {}) {
    const defaultAttributes = {
      status: faker.helpers.arrayElement(['active', 'inactive', 'banned']),
      joined_at: faker.date.past().toISOString(),
      left_at: faker.helpers.arrayElement([null, faker.date.recent().toISOString()])
    };

    return await RoomUser.query().insert({
      ...defaultAttributes,
      ...overrides
    });
  }
}

module.exports = RoomUserFactory;