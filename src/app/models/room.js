const { Model } = require('objection');

class Room extends Model {
  static get tableName() {
    return 'rooms';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['host_id', 'name'],

      properties: {
        id: { type: 'integer' },
        host_id: { type: 'integer' },
        name: { type: 'string', maxLength: 255 },
        description: { type: 'string', maxLength: 255 },
        image_url: { type: 'string', maxLength: 255 },
        location: { type: 'string', maxLength: 255 },
        latitude: { type: 'number' },
        longitude: { type: 'number' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const User = require('./user');
    const Livestream = require('./livestream');
    const Message = require('./message');

    return {
      host: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'rooms.host_id',
          to: 'users.id'
        }
      },

      users: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        join: {
          from: 'rooms.id',
          through: {
            from: 'room_users.room_id',
            to: 'room_users.user_id'
          },
          to: 'users.id'
        }
      },

      livestreams: {
        relation: Model.HasManyRelation,
        modelClass: Livestream,
        join: {
          from: 'rooms.id',
          to: 'livestreams.room_id'
        }
      },

      messages: {
        relation: Model.HasManyRelation,
        modelClass: Message,
        join: {
          from: 'rooms.id',
          to: 'messages.room_id'
        }
      }
    };
  }
}

module.exports = Room;
