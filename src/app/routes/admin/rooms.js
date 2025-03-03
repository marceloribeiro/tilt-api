/**
 * @swagger
 * /admin/rooms:
 *   get:
 *     summary: List all rooms
 *     tags: [Admin Rooms]
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
 *         name: host_id
 *         schema:
 *           type: integer
 *         description: Filter rooms by host ID
 *     responses:
 *       200:
 *         description: List of all rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rooms:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Room'
 *                       - type: object
 *                         properties:
 *                           host:
 *                             $ref: '#/components/schemas/User'
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
 *     summary: Create a new room
 *     tags: [Admin Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - host_id
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 255
 *               description:
 *                 type: string
 *                 maxLength: 255
 *               image_url:
 *                 type: string
 *                 maxLength: 255
 *               location:
 *                 type: string
 *                 maxLength: 255
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               host_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Room'
 *                 - type: object
 *                   properties:
 *                     host:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *
 * /admin/rooms/{id}:
 *   get:
 *     summary: Get a specific room
 *     tags: [Admin Rooms]
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
 *         description: Room details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Room'
 *                 - type: object
 *                   properties:
 *                     host:
 *                       $ref: '#/components/schemas/User'
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       404:
 *         description: Room not found
 *
 *   patch:
 *     summary: Update a room
 *     tags: [Admin Rooms]
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
 *               name:
 *                 type: string
 *                 maxLength: 255
 *               description:
 *                 type: string
 *                 maxLength: 255
 *               image_url:
 *                 type: string
 *                 maxLength: 255
 *               location:
 *                 type: string
 *                 maxLength: 255
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               host_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Room updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Room'
 *                 - type: object
 *                   properties:
 *                     host:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: Room not found
 *
 *   delete:
 *     summary: Delete a room
 *     tags: [Admin Rooms]
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
 *         description: Room deleted successfully
 *       404:
 *         description: Room not found
 */

const express = require('express');
const router = express.Router();
const Room = require('../../models/room');
const RoomPresenter = require('../../presenters/room_presenter');
const { PAGE_SIZE } = require('../../../config/constants');


// List all rooms
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const per_page = parseInt(req.query.per_page) || PAGE_SIZE;

    const query = Room.query().withGraphFetched('host');

    if (req.query.host_id) {
      query.where('host_id', req.query.host_id);
    }

    const result = await query.page(page - 1, per_page);

    res.json({
      rooms: await RoomPresenter.presentMany(result.results),
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

// Get single room
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.query()
      .findById(req.params.id)
      .withGraphFetched('[host, users]');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({ room: RoomPresenter.present(room) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create room
router.post('/', async (req, res) => {
  try {
    const newRoom = await Room.query().insert(req.body);
    const room = await Room.query()
      .findById(newRoom.id)
      .withGraphFetched('host');

    res.status(201).json({ room: RoomPresenter.present(room) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update room
router.patch('/:id', async (req, res) => {
  try {
    const room = await Room.query()
      .patchAndFetchById(req.params.id, req.body)
      .withGraphFetched('host');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({ room: RoomPresenter.present(room) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete room
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Room.query().deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;