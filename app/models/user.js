const { Model } = require('objection');
const crypto = require('crypto');

class User extends Model {
  static get tableName() {
    return 'users';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email'],
      properties: {
        id: { type: 'integer' },
        email: { type: 'string' },
        name: { type: 'string' },
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

  // Static method for authentication
  static async authenticate(email, password) {
    const user = await this.query().findOne({ email });

    if (!user || !user.verifyPassword(password)) {
      return null;
    }

    return user;
  }
}

module.exports = User;