const { Model } = require('objection');

class Style extends Model {
  static get tableName() {
    return 'styles';
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
          from: 'styles.id',
          through: {
            from: 'users_styles.style_id',
            to: 'users_styles.user_id'
          },
          to: 'users.id'
        }
      }
    };
  }
}

module.exports = Style;