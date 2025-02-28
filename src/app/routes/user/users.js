const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const UserPresenter = require('../../presenters/user_presenter');

// List all users
router.get('/', async (req, res) => {
  try {
    const users = await User.query();
    res.json(users.map(user => UserPresenter.present(user)));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get single user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.query().findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(UserPresenter.present(user));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;