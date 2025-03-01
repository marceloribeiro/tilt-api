const { faker } = require('@faker-js/faker');
const Message = require('../../src/app/models/message');

class MessageFactory {
  static async createMessage(overrides = {}) {
    const defaultAttributes = {
      content: faker.lorem.sentence(),
      type: faker.helpers.arrayElement(Object.values(Message.MESSAGE_TYPES))
    };

    return await Message.query().insert({
      ...defaultAttributes,
      ...overrides
    });
  }
}

module.exports = MessageFactory;