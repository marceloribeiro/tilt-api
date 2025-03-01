const { faker } = require('@faker-js/faker');
const User = require('../../src/app/models/user');

class UserFactory {
  static async createUser(overrides = {}) {
    const defaultAttributes = {
      phone_number: faker.phone.number('+1##########'),
      email: faker.internet.email(),
      user_name: faker.internet.username(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      is_admin: false,
      confirmation_code: '123456'
    };

    return await User.query().insert({
      ...defaultAttributes,
      ...overrides
    });
  }
}

module.exports = UserFactory;