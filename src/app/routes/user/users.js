/**
 * @swagger
 * /user/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
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
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of records
 *                     per_page:
 *                       type: integer
 *                       description: Number of items per page
 *                     current_page:
 *                       type: integer
 *                       description: Current page number
 *                     total_pages:
 *                       type: integer
 *                       description: Total number of pages
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /user/users/{id}:
 *   get:
 *     summary: Get a specific user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       401:
 *         description: Not authenticated
 */

const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const UserPresenter = require('../../presenters/user_presenter');
const { PAGE_SIZE } = require('../../../config/constants');

// List all users
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const per_page = parseInt(req.query.per_page) || PAGE_SIZE;

    const result = await User.query().page(page - 1, per_page);

    res.json({
      users: result.results.map(user => UserPresenter.present(user)),
      pagination: {
        total: result.total,
        per_page: per_page,
        current_page: page,
        total_pages: Math.ceil(result.total / per_page)
      }
    });
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
    res.json({ user: UserPresenter.present(user) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;