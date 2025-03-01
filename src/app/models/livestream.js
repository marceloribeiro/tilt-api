const { Model } = require('objection');

class Livestream extends Model {
  static get tableName() {
    return 'livestreams';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'room_id',
        'host_id',
        'name',
        'starts_at',
        'ends_at'
      ],

      properties: {
        id: { type: 'integer' },
        room_id: { type: 'integer' },
        host_id: { type: 'integer' },
        current_auction_id: { type: ['integer', 'null'] },
        name: { type: 'string', maxLength: 255 },
        description: { type: 'string', maxLength: 255 },
        url: { type: 'string', maxLength: 255 },
        thumbnail_url: { type: 'string', maxLength: 255 },
        status: { type: 'string', maxLength: 255 },
        starts_at: { type: 'string', format: 'date-time' },
        ends_at: { type: 'string', format: 'date-time' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const Room = require('./room');
    const User = require('./user');
    const Auction = require('./auction');

    return {
      room: {
        relation: Model.BelongsToOneRelation,
        modelClass: Room,
        join: {
          from: 'livestreams.room_id',
          to: 'rooms.id'
        }
      },

      host: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'livestreams.host_id',
          to: 'users.id'
        }
      },

      currentAuction: {
        relation: Model.BelongsToOneRelation,
        modelClass: Auction,
        join: {
          from: 'livestreams.current_auction_id',
          to: 'auctions.id'
        }
      }
    };
  }
}

module.exports = Livestream;
