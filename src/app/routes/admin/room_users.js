/**
 * @swagger
 * /admin/room_users:
 *   get:
 *     summary: List all room users
 *     tags: [Admin Room Users]
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
 *       - in: query
 *         name: room_id
 *         schema:
 *           type: integer
 *         description: Filter room users by room ID
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter room users by user ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter room users by status
 *     responses:
 *       200:
 *         description: List of all room users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 room_users:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/RoomUser'
 *                       - type: object
 *                         properties:
 *                           user:
 *                             $ref: '#/components/schemas/User'
 *                           room:
 *                             $ref: '#/components/schemas/Room'
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
 *
 *   post:
 *     summary: Create a new room user
 *     tags: [Admin Room Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - room_id
 *               - status
 *               - joined_at
 *             properties:
 *               user_id:
 *                 type: integer
 *               room_id:
 *                 type: integer
 *               status:
 *                 type: string
 *                 maxLength: 255
 *               joined_at:
 *                 type: string
 *                 format: date-time
 *               left_at:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Room user created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/RoomUser'
 *                 - type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     room:
 *                       $ref: '#/components/schemas/Room'
 *       400:
 *         description: Invalid input
 *
 * /admin/room_users/{id}:
 *   get:
 *     summary: Get a specific room user
 *     tags: [Admin Room Users]
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
 *         description: Room user details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/RoomUser'
 *                 - type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     room:
 *                       $ref: '#/components/schemas/Room'
 *       404:
 *         description: Room user not found
 *
 *   patch:
 *     summary: Update a room user
 *     tags: [Admin Room Users]
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
 *               status:
 *                 type: string
 *                 maxLength: 255
 *               left_at:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Room user updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/RoomUser'
 *                 - type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     room:
 *                       $ref: '#/components/schemas/Room'
 *       404:
 *         description: Room user not found
 *
 *   delete:
 *     summary: Delete a room user
 *     tags: [Admin Room Users]
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
 *         description: Room user deleted successfully
 *       404:
 *         description: Room user not found
 */

const express = require('express');
const router = express.Router();
const RoomUser = require('../../models/room_user');
const RoomUserPresenter = require('../../presenters/room_user_presenter');
const { PAGE_SIZE } = require('../../../config/constants');


// List all room users
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const per_page = parseInt(req.query.per_page) || PAGE_SIZE;

    const query = RoomUser.query().withGraphFetched('[user, room]');

    if (req.query.room_id) {
      query.where('room_id', req.query.room_id);
    }

    if (req.query.user_id) {
      query.where('user_id', req.query.user_id);
    }

    if (req.query.status) {
      query.where('status', req.query.status);
    }

    const result = await query.page(page - 1, per_page);

    res.json({
      room_users: await RoomUserPresenter.presentMany(result.results),
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

// Get single room user
router.get('/:id', async (req, res) => {
  try {
    const roomUser = await RoomUser.query()
      .findById(req.params.id)
      .withGraphFetched('[user, room]');

    if (!roomUser) {
      return res.status(404).json({ message: 'Room user not found' });
    }

    res.json({ room_user: RoomUserPresenter.present(roomUser) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create room user
router.post('/', async (req, res) => {
  try {
    const newRoomUser = await RoomUser.query().insert(req.body);
    const roomUser = await RoomUser.query()
      .findById(newRoomUser.id)
      .withGraphFetched('[user, room]');

    res.status(201).json({ room_user: RoomUserPresenter.present(roomUser) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update room user
router.patch('/:id', async (req, res) => {
  try {
    const roomUser = await RoomUser.query()
      .patchAndFetchById(req.params.id, req.body)
      .withGraphFetched('[user, room]');

    if (!roomUser) {
      return res.status(404).json({ message: 'Room user not found' });
    }

    res.json({ room_user: RoomUserPresenter.present(roomUser) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete room user
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await RoomUser.query().deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Room user not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;