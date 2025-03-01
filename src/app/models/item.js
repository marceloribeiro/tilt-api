const { Model } = require('objection');

class Item extends Model {
  static get tableName() {
    return 'items';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'owner_id',
        'name'
      ],

      properties: {
        id: { type: 'integer' },
        owner_id: { type: 'integer' },
        category_id: { type: 'integer' },
        brand_id: { type: 'integer' },
        style_id: { type: 'integer' },
        footwear_size_id: { type: 'integer' },
        top_size_id: { type: 'integer' },
        name: { type: 'string', maxLength: 255 },
        description: { type: 'string', maxLength: 255 },
        image_url: { type: 'string', maxLength: 255 },
        location: { type: 'string', maxLength: 255 },
        latitude: { type: 'number' },
        longitude: { type: 'number' },
        status: { type: 'string', maxLength: 255 },
        price: { type: 'number' },
        currency: { type: 'string', maxLength: 255 },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const User = require('./user');
    const Category = require('./category');
    const Brand = require('./brand');
    const Style = require('./style');
    const FootwearSize = require('./footwear_size');
    const TopSize = require('./top_size');
    const Auction = require('./auction');

    return {
      owner: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'items.owner_id',
          to: 'users.id'
        }
      },

      category: {
        relation: Model.BelongsToOneRelation,
        modelClass: Category,
        join: {
          from: 'items.category_id',
          to: 'categories.id'
        }
      },

      brand: {
        relation: Model.BelongsToOneRelation,
        modelClass: Brand,
        join: {
          from: 'items.brand_id',
          to: 'brands.id'
        }
      },

      style: {
        relation: Model.BelongsToOneRelation,
        modelClass: Style,
        join: {
          from: 'items.style_id',
          to: 'styles.id'
        }
      },

      footwearSize: {
        relation: Model.BelongsToOneRelation,
        modelClass: FootwearSize,
        join: {
          from: 'items.footwear_size_id',
          to: 'footwear_sizes.id'
        }
      },

      topSize: {
        relation: Model.BelongsToOneRelation,
        modelClass: TopSize,
        join: {
          from: 'items.top_size_id',
          to: 'top_sizes.id'
        }
      },

      auctions: {
        relation: Model.HasManyRelation,
        modelClass: Auction,
        join: {
          from: 'items.id',
          to: 'auctions.item_id'
        }
      }
    };
  }

  static get STATUSES() {
    return {
      AVAILABLE: 'available',
      SOLD: 'sold',
      RESERVED: 'reserved',
      ARCHIVED: 'archived'
    };
  }
}

module.exports = Item;