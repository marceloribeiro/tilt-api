const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function generateTestToken(user) {
  return jwt.sign(
    {
      user_id: user.id,
      jti: user.jti
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

module.exports = {
  generateTestToken
};