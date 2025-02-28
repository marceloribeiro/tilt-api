const User = require('../models/user');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Better to use env variable
const DEBUG = process.env.DEBUG || true;
const crypto = require('crypto');

class UserService {
  /**
   * Creates a user if one doesn't exist with the given phone number
   * @param {{ phone_number: string}} user_data - The user data object
   * @returns {Promise<Object>} - Returns either { user, error: null } or { user: null, error: string }
   */
  async createIfNotExists(user_data) {
    // Validate phone number presence
    if (!user_data.phone_number) {
      return {
        user: null,
        error: 'Phone number is required'
      };
    }

    try {
      // Check if user already exists
      let user = await User.query()
        .where('phone_number', user_data.phone_number)
        .first();

      // If user exists, return error
      if (user) {
        return {
          user: null,
          error: 'User with this phone number already exists',
          code: 409
        };
      }

      // Create new user if doesn't exist
      user = await User.query().insert(user_data);

      return {
        user,
        error: null
      };

    } catch (error) {
      return {
        user: null,
        error: error.message
      };
    }
  }

  /**
   * Generates a JWT token for a user
   * @private
   */
  #generateToken(user) {
    return jwt.sign(
      {
        user_id: user.id,
        jti: user.jti
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  /**
   * Authenticates a user with email and password
   * @param {string} email - The user's email
   * @param {string} password - The user's password
   * @returns {Promise<Object>} - Returns either { user, error: null } or { user: null, error: string }
   */
  async authenticate(email, password) {
    if (!email || !password) {
      return {
        user: null,
        error: 'Email and password are required'
      };
    }

    try {
      const user = await User.query().findOne({ email });

      if (!user || !user.verifyPassword(password)) {
        return {
          user: null,
          token: null,
          error: 'Invalid email or password'
        };
      }

      const token = this.#generateToken(user);
      return {
        user,
        token,
        error: null
      };
    } catch (error) {
      return {
        user: null,
        token: null,
        error: error.message
      };
    }
  }

  /**
   * Authenticates a user with phone number and confirmation code
   * @param {string} phone_number - The user's phone number
   * @param {string} confirmation_code - The confirmation code
   * @returns {Promise<Object>} - Returns either { user, error: null } or { user: null, error: string }
   */
  async loginFromPhone(phone_number, confirmation_code) {
    if (!phone_number || !confirmation_code) {
      return {
        user: null,
        error: 'Phone number and confirmation code are required'
      };
    }

    try {
      const user = await User.query()
        .where('phone_number', phone_number)
        .first();

      if (!user) {
        return {
          user: null,
          token: null,
          error: 'User not found'
        };
      }

      if (user.confirmation_code !== confirmation_code) {
        return {
          user: null,
          token: null,
          error: 'Invalid confirmation code'
        };
      }

      const token = this.#generateToken(user);
      return {
        user,
        token,
        error: null
      };
    } catch (error) {
      return {
        user: null,
        token: null,
        error: error.message
      };
    }
  }

  /**
   * Invalidates all existing tokens for a user by updating their jti
   * @param {number} user_id - The user's ID
   * @returns {Promise<Object>} - Returns either { success: true } or { error: string }
   */
  async logout(user_id) {
    try {
      await User.query()
        .findById(user_id)
        .patch({
          jti: crypto.randomBytes(16).toString('hex') // Generate new jti
        });

      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Updates a user's information
   * @param {number} user_id - The user's ID
   * @param {Object} user_data - The data to update
   * @returns {Promise<Object>} - Returns either { user, error: null } or { user: null, error: string }
   */
  async updateUser(user_id, user_data) {
    try {
      // Remove sensitive fields that shouldn't be updated directly
      const sanitizedData = { ...user_data };
      delete sanitizedData.password;
      delete sanitizedData.jti;
      delete sanitizedData.is_admin;
      delete sanitizedData.confirmation_code;

      const user = await User.query()
        .patchAndFetchById(user_id, sanitizedData);

      if (!user) {
        return {
          user: null,
          error: 'User not found'
        };
      }

      if (sanitizedData.user_name) {
        const userNameAlreadyExists = await User.query()
          .where('user_name', sanitizedData.user_name)
          .whereNot('id', user_id)
          .first();

        if (userNameAlreadyExists) {
          return {
            code: 409,
            user: null,
            error: 'User name already exists'
          };
        }
      }

      return {
        user,
        error: null
      };
    } catch (error) {
      return {
        user: null,
        error: error.message
      };
    }
  }
}

module.exports = new UserService();