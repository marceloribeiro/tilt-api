const { faker } = require('@faker-js/faker');
const Contact = require('../../src/app/models/contact');
const UserFactory = require('./user.factory');

class ContactFactory {
  static async createContact(overrides = {}) {
    const user = overrides.user_id ? null : await UserFactory.createUser();

    const defaultAttributes = {
      user_id: user ? user.id : overrides.user_id,
      name: faker.person.fullName(),
      phone_number: faker.phone.number('+1##########'),
      email: faker.internet.email(),
    };

    return await Contact.query().insert({
      ...defaultAttributes,
      ...overrides
    });
  }
}

module.exports = ContactFactory;