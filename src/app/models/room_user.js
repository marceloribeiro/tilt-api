const { Model } = require('objection');

class RoomUser extends Model {
  static get tableName() {
    return 'room_users';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'user_id',
        'room_id',
        'status',
        'joined_at'
      ],

      properties: {
        id: { type: 'integer' },
        user_id: { type: 'integer' },
        room_id: { type: 'integer' },
        status: { type: 'string', maxLength: 255 },
        joined_at: { type: 'string', format: 'date-time' },
        left_at: { type: ['string', 'null'], format: 'date-time' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const User = require('./user');
    const Room = require('./room');

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'room_users.user_id',
          to: 'users.id'
        }
      },

      room: {
        relation: Model.BelongsToOneRelation,
        modelClass: Room,
        join: {
          from: 'room_users.room_id',
          to: 'rooms.id'
        }
      }
    };
  }
}

module.exports = RoomUser;
