const jwt = require('jsonwebtoken');

function generateTestToken(user) {
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
}

module.exports = {
  generateTestToken
};