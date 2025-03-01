const { faker } = require('@faker-js/faker');
const Contact = require('../../src/app/models/contact');
const UserFactory = require('./user.factory');

class ContactFactory {
  static async createContact(overrides = {}) {
    if (!overrides.user_id) {
      const user = await UserFactory.createUser();
      overrides.user_id = user.id;
    }

    const defaultAttributes = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone_number: faker.phone.number('+1##########'),
      user_id: overrides.user_id
    };

    return await Contact.query().insert({
      ...defaultAttributes,
      ...overrides
    });
  }
}

module.exports = ContactFactory;