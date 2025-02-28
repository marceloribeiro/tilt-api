const { Model } = require('objection');

class Brand extends Model {
  static get tableName() {
    return 'brands';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const User = require('./user');

    return {
      users: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        join: {
          from: 'brands.id',
          through: {
            from: 'users_brands.brand_id',
            to: 'users_brands.user_id'
          },
          to: 'users.id'
        }
      }
    };
  }
}

module.exports = Brand;