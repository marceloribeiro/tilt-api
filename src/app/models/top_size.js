const { Model } = require('objection');

class TopSize extends Model {
  static get tableName() {
    return 'top_sizes';
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
          from: 'top_sizes.id',
          through: {
            from: 'users_top_sizes.top_size_id',
            to: 'users_top_sizes.user_id'
          },
          to: 'users.id'
        }
      }
    };
  }
}

module.exports = TopSize;