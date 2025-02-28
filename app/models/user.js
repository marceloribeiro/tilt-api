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
        email: { type: 'string' },
        name: { type: 'string' },
        phone_number: { type: 'string' },
        confirmation_code: { type: 'string' },
        jti: { type: 'string' },
        hashed_password: { type: 'string' },
        salt: { type: 'string' }
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
}

module.exports = User;