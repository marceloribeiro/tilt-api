const requireAdmin = async (req, res, next) => {
  // authenticateToken middleware has already set req.user
  if (!req.user.is_admin) {
    return res.status(404).json({ message: 'Not found' });
  }
  next();
};

module.exports = { requireAdmin };