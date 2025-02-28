const { Model } = require('objection');

class FootwearSize extends Model {
  static get tableName() {
    return 'footwear_sizes';
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
          from: 'footwear_sizes.id',
          through: {
            from: 'users_footwear_sizes.footwear_size_id',
            to: 'users_footwear_sizes.user_id'
          },
          to: 'users.id'
        }
      }
    };
  }
}

module.exports = FootwearSize;