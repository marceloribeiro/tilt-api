const { Model } = require('objection');

class Message extends Model {
  static get tableName() {
    return 'messages';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'author_id',
        'room_id',
        'content',
      ],

      properties: {
        id: { type: 'integer' },
        author_id: { type: 'integer' },
        room_id: { type: 'integer' },
        content: { type: 'string', maxLength: 255 },
        type: { type: 'string', maxLength: 255 },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const User = require('./user');
    const Room = require('./room');

    return {
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'messages.author_id',
          to: 'users.id'
        }
      },

      room: {
        relation: Model.BelongsToOneRelation,
        modelClass: Room,
        join: {
          from: 'messages.room_id',
          to: 'rooms.id'
        }
      }
    };
  }

  static get MESSAGE_TYPES() {
    return {
      TEXT: 'text',
      SYSTEM: 'system',
      ACTION: 'action'
    };
  }
}

module.exports = Message;