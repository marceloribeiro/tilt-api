const { Model } = require('objection');

class AuctionBid extends Model {
  static get tableName() {
    return 'auction_bids';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'auction_id',
        'bidder_id',
        'status',
        'amount',
        'currency'
      ],

      properties: {
        id: { type: 'integer' },
        auction_id: { type: 'integer' },
        bidder_id: { type: 'integer' },
        status: { type: 'string', maxLength: 255 },
        amount: { type: 'number' },
        currency: { type: 'string', maxLength: 255 },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const User = require('./user');
    const Auction = require('./auction');

    return {
      bidder: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'auction_bids.bidder_id',
          to: 'users.id'
        }
      },

      auction: {
        relation: Model.BelongsToOneRelation,
        modelClass: Auction,
        join: {
          from: 'auction_bids.auction_id',
          to: 'auctions.id'
        }
      },

      highestForAuction: {
        relation: Model.HasOneRelation,
        modelClass: Auction,
        join: {
          from: 'auction_bids.id',
          to: 'auctions.highest_auction_bid_id'
        }
      }
    };
  }

  static get STATUSES() {
    return {
      PENDING: 'pending',
      ACCEPTED: 'accepted',
      REJECTED: 'rejected',
      CANCELLED: 'cancelled',
      OUTBID: 'outbid'
    };
  }

  async isHighestBid() {
    const auction = await this.$relatedQuery('auction');
    return auction.highest_auction_bid_id === this.id;
  }

  async markAsOutbid() {
    return this.$query().patchAndFetch({
      status: AuctionBid.STATUSES.OUTBID
    });
  }

  async markAsAccepted() {
    return this.$query().patchAndFetch({
      status: AuctionBid.STATUSES.ACCEPTED
    });
  }

  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext);

    if (!this.status) {
      this.status = AuctionBid.STATUSES.PENDING;
    }
  }
}

module.exports = AuctionBid;