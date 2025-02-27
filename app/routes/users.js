const express = require('express');
const router = express.Router();
const User = require('../models/user');
const knex = require('../../config/database');
const { Model } = require('objection');
const UserPresenter = require('../presenters/user_presenter');

// Bind all models to the knex instance
Model.knex(knex);

// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await User.query();
    res.json(UserPresenter.presentMany(users));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.query().findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(UserPresenter.present(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create new user
router.post('/', async (req, res) => {
  try {
    console.log(req.body);
    const newUser = await User.query().insert(req.body);
    res.status(201).json(UserPresenter.present(newUser));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.query()
      .updateAndFetchById(req.params.id, req.body);

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(UserPresenter.present(updatedUser));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update user partially
router.patch('/:id', async (req, res) => {
  try {
    const updatedUser = await User.query()
      .patchAndFetchById(req.params.id, req.body);

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(UserPresenter.present(updatedUser));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    const deletedCount = await User.query().deleteById(req.params.id);

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;