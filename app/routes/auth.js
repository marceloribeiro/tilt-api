const express = require('express');
const router = express.Router();
const userService = require('../services/user_service');
const UserPresenter = require('../presenters/user_presenter');
const { authenticateToken } = require('../middleware/auth');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { phone_number, confirmation_code } = req.body;
    const { user, token, error } = await userService.loginFromPhone(phone_number, confirmation_code);

    if (error) {
      return res.status(401).json({ message: error });
    }

    res.json({
      token,
      user: UserPresenter.present(user)
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { user, error } = await userService.createIfNotExists(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    res.status(201).json({
      user: UserPresenter.present(user)
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get authenticated user route
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: UserPresenter.present(req.user)
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update current user route
router.patch('/me/update', authenticateToken, async (req, res) => {
  try {
    const { user, error } = await userService.updateUser(req.user.id, req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    res.json({
      user: UserPresenter.present(user)
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Logout route
router.delete('/logout', authenticateToken, async (req, res) => {
  try {
    const { error } = await userService.logout(req.user.id);

    if (error) {
      return res.status(400).json({ message: error });
    }

    res.json({ message: 'Successfully logged out' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;