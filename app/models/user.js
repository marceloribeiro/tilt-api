const { Model } = require('objection');
const crypto = require('crypto');

class User extends Model {
  static get tableName() {
    return 'users';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['phone_number'],
      properties: {
        id: { type: 'integer' },
        phone_number: { type: 'string' },
        confirmation_code: { type: 'string' },
        jti: { type: 'string' },
        hashed_password: { type: 'string' },
        salt: { type: 'string' },
        email: { type: 'string' },
        user_name: { type: 'string' },
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        referral_code: { type: 'string' }
      }
    };
  }

  // Password setter
  set password(password) {
    this.salt = this.salt || crypto.randomBytes(16).toString('hex');
    this.hashed_password = this.#hashPassword(password);
  }

  // Private method to hash password
  #hashPassword(password) {
    return crypto.pbkdf2Sync(
      password,
      this.salt,
      1000,
      64,
      'sha512'
    ).toString('hex');
  }

  // Method to verify password
  verifyPassword(password) {
    const hash = this.#hashPassword(password);
    return this.hashed_password === hash;
  }

  static get relationMappings() {
    const Brand = require('./brand');
    const Category = require('./category');
    const FootwearSize = require('./footwear_size');
    const Style = require('./style');
    const TopSize = require('./top_size');

    return {
      brands: {
        relation: Model.ManyToManyRelation,
        modelClass: Brand,
        join: {
          from: 'users.id',
          through: {
            from: 'users_brands.user_id',
            to: 'users_brands.brand_id'
          },
          to: 'brands.id'
        }
      },

      categories: {
        relation: Model.ManyToManyRelation,
        modelClass: Category,
        join: {
          from: 'users.id',
          through: {
            from: 'users_categories.user_id',
            to: 'users_categories.category_id'
          },
          to: 'categories.id'
        }
      },

      footwear_sizes: {
        relation: Model.ManyToManyRelation,
        modelClass: FootwearSize,
        join: {
          from: 'users.id',
          through: {
            from: 'users_footwear_sizes.user_id',
            to: 'users_footwear_sizes.footwear_size_id'
          },
          to: 'footwear_sizes.id'
        }
      },

      styles: {
        relation: Model.ManyToManyRelation,
        modelClass: Style,
        join: {
          from: 'users.id',
          through: {
            from: 'users_styles.user_id',
            to: 'users_styles.style_id'
          },
          to: 'styles.id'
        }
      },

      top_sizes: {
        relation: Model.ManyToManyRelation,
        modelClass: TopSize,
        join: {
          from: 'users.id',
          through: {
            from: 'users_top_sizes.user_id',
            to: 'users_top_sizes.top_size_id'
          },
          to: 'top_sizes.id'
        }
      }
    };
  }
}

module.exports = User;