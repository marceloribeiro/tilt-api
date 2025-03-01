const { Model } = require('objection');

class Auction extends Model {
  static get tableName() {
    return 'auctions';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'owner_id',
        'item_id',
        'status',
        'starting_price',
        'current_price',
        'currency'
      ],

      properties: {
        id: { type: 'integer' },
        owner_id: { type: 'integer' },
        item_id: { type: 'integer' },
        highest_auction_bid_id: { type: ['integer', 'null'] },
        status: { type: 'string', maxLength: 255 },
        starting_price: { type: 'number' },
        current_price: { type: 'number' },
        currency: { type: 'string', maxLength: 255 },
        starts_at: { type: 'string', format: 'date-time' },
        ends_at: { type: 'string', format: 'date-time' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const User = require('./user');
    const Item = require('./item');
    const AuctionBid = require('./auction_bid');
    const Livestream = require('./livestream');

    return {
      owner: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'auctions.owner_id',
          to: 'users.id'
        }
      },

      item: {
        relation: Model.BelongsToOneRelation,
        modelClass: Item,
        join: {
          from: 'auctions.item_id',
          to: 'items.id'
        }
      },

      highestBid: {
        relation: Model.BelongsToOneRelation,
        modelClass: AuctionBid,
        join: {
          from: 'auctions.highest_auction_bid_id',
          to: 'auction_bids.id'
        }
      },

      bids: {
        relation: Model.HasManyRelation,
        modelClass: AuctionBid,
        join: {
          from: 'auctions.id',
          to: 'auction_bids.auction_id'
        }
      },

      livestreams: {
        relation: Model.HasManyRelation,
        modelClass: Livestream,
        join: {
          from: 'auctions.id',
          to: 'livestreams.current_auction_id'
        }
      }
    };
  }

  static get STATUSES() {
    return {
      PENDING: 'pending',
      ACTIVE: 'active',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled'
    };
  }

  isActive() {
    const now = new Date();
    return (
      this.status === Auction.STATUSES.ACTIVE &&
      new Date(this.starts_at) <= now &&
      new Date(this.ends_at) > now
    );
  }

  canBid() {
    return this.isActive() && this.status !== Auction.STATUSES.CANCELLED;
  }
}

module.exports = Auction;