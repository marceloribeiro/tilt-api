const { Model } = require('objection');

class Contact extends Model {
  static get tableName() {
    return 'contacts';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'name'],
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'integer' },
        name: { type: 'string' },
        email: { type: ['string', 'null'] },
        phone_number: { type: ['string', 'null'] },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const User = require('./user');

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'contacts.user_id',
          to: 'users.id'
        }
      }
    };
  }
}

module.exports = Contact;