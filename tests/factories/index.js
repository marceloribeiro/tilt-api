const { faker } = require('@faker-js/faker');
const User = require('../../src/app/models/user');

class Factory {
  static async createUser(overrides = {}) {
    const defaultAttributes = {
      phone_number: faker.phone.number('+1##########'),
      email: faker.internet.email(),
      user_name: faker.internet.username(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      confirmation_code: '123456' // Default test confirmation code
    };

    return await User.query().insert({
      ...defaultAttributes,
      ...overrides
    });
  }

  static async createUserWithProfile(overrides = {}) {
    const user = await this.createUser(overrides);
    // const profile = await Profile.query().insert({
    //   user_id: user.id,
    //   bio: faker.lorem.paragraph(),
    //   // ... other profile fields
    // });
    const profile = null;
    return { user, profile };
  }

  // Add more factory methods for other models
}

module.exports = Factory;