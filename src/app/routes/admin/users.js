/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all users
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     per_page:
 *                       type: integer
 *                     current_page:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *
 * /admin/users/{id}:
 *   get:
 *     summary: Get a specific user
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *
 *   patch:
 *     summary: Update a user
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               user_name:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 *
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: User deleted
 *       404:
 *         description: User not found
 */

const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const knex = require('../../../config/database');
const { Model } = require('objection');
const UserPresenter = require('../../presenters/user_presenter');
const userService = require('../../services/user_service');
const { authenticateToken } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/admin_auth');

// Bind all models to the knex instance
Model.knex(knex);

// Apply both authentication and admin check to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await User.query();
    res.json({ users: UserPresenter.presentMany(users) });
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
    res.json({ user: UserPresenter.present(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create new user
router.post('/', async (req, res) => {
  try {
    const newUser = await User.query().insert(req.body);
    res.status(201).json({ user: UserPresenter.present(newUser) });
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

    res.json({ user: UserPresenter.present(updatedUser) });
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

    res.json({ user: UserPresenter.present(updatedUser) });
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

    res.status(204).json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;