/**
 * @swagger
 * /admin/livestreams:
 *   get:
 *     summary: List all livestreams
 *     tags: [Admin Livestreams]
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
 *         description: Filter livestreams by room ID
 *       - in: query
 *         name: host_id
 *         schema:
 *           type: integer
 *         description: Filter livestreams by host ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter livestreams by status
 *     responses:
 *       200:
 *         description: List of all livestreams
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 livestreams:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Livestream'
 *                       - type: object
 *                         properties:
 *                           room:
 *                             $ref: '#/components/schemas/Room'
 *                           host:
 *                             $ref: '#/components/schemas/User'
 *                           currentAuction:
 *                             $ref: '#/components/schemas/Auction'
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
 *     summary: Create a new livestream
 *     tags: [Admin Livestreams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - room_id
 *               - host_id
 *               - name
 *               - starts_at
 *               - ends_at
 *             properties:
 *               room_id:
 *                 type: integer
 *               host_id:
 *                 type: integer
 *               current_auction_id:
 *                 type: integer
 *               name:
 *                 type: string
 *                 maxLength: 255
 *               description:
 *                 type: string
 *                 maxLength: 255
 *               url:
 *                 type: string
 *                 maxLength: 255
 *               thumbnail_url:
 *                 type: string
 *                 maxLength: 255
 *               status:
 *                 type: string
 *                 maxLength: 255
 *               starts_at:
 *                 type: string
 *                 format: date-time
 *               ends_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Livestream created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Livestream'
 *                 - type: object
 *                   properties:
 *                     room:
 *                       $ref: '#/components/schemas/Room'
 *                     host:
 *                       $ref: '#/components/schemas/User'
 *                     currentAuction:
 *                       $ref: '#/components/schemas/Auction'
 *       400:
 *         description: Invalid input
 *
 * /admin/livestreams/{id}:
 *   get:
 *     summary: Get a specific livestream
 *     tags: [Admin Livestreams]
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
 *         description: Livestream details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Livestream'
 *                 - type: object
 *                   properties:
 *                     room:
 *                       $ref: '#/components/schemas/Room'
 *                     host:
 *                       $ref: '#/components/schemas/User'
 *                     currentAuction:
 *                       $ref: '#/components/schemas/Auction'
 *       404:
 *         description: Livestream not found
 *
 *   patch:
 *     summary: Update a livestream
 *     tags: [Admin Livestreams]
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
 *               room_id:
 *                 type: integer
 *               host_id:
 *                 type: integer
 *               current_auction_id:
 *                 type: integer
 *               name:
 *                 type: string
 *                 maxLength: 255
 *               description:
 *                 type: string
 *                 maxLength: 255
 *               url:
 *                 type: string
 *                 maxLength: 255
 *               thumbnail_url:
 *                 type: string
 *                 maxLength: 255
 *               status:
 *                 type: string
 *                 maxLength: 255
 *               starts_at:
 *                 type: string
 *                 format: date-time
 *               ends_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Livestream updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Livestream'
 *                 - type: object
 *                   properties:
 *                     room:
 *                       $ref: '#/components/schemas/Room'
 *                     host:
 *                       $ref: '#/components/schemas/User'
 *                     currentAuction:
 *                       $ref: '#/components/schemas/Auction'
 *       404:
 *         description: Livestream not found
 *
 *   delete:
 *     summary: Delete a livestream
 *     tags: [Admin Livestreams]
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
 *         description: Livestream deleted successfully
 *       404:
 *         description: Livestream not found
 */

const express = require('express');
const router = express.Router();
const Livestream = require('../../models/livestream');
const LivestreamPresenter = require('../../presenters/livestream_presenter');
const { PAGE_SIZE } = require('../../../config/constants');


// List all livestreams
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const per_page = parseInt(req.query.per_page) || PAGE_SIZE;

    const query = Livestream.query().withGraphFetched('[room, host, currentAuction]');

    if (req.query.room_id) {
      query.where('room_id', req.query.room_id);
    }

    if (req.query.host_id) {
      query.where('host_id', req.query.host_id);
    }

    if (req.query.status) {
      query.where('status', req.query.status);
    }

    const result = await query.page(page - 1, per_page);

    res.json({
      livestreams: await LivestreamPresenter.presentMany(result.results),
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

// Get single livestream
router.get('/:id', async (req, res) => {
  try {
    const livestream = await Livestream.query()
      .findById(req.params.id)
      .withGraphFetched('[room, host, currentAuction]');

    if (!livestream) {
      return res.status(404).json({ message: 'Livestream not found' });
    }

    res.json({ livestream: LivestreamPresenter.present(livestream) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create livestream
router.post('/', async (req, res) => {
  try {
    const newLivestream = await Livestream.query().insert(req.body);
    const livestream = await Livestream.query()
      .findById(newLivestream.id)
      .withGraphFetched('[room, host, currentAuction]');

    res.status(201).json({ livestream: LivestreamPresenter.present(livestream) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update livestream
router.patch('/:id', async (req, res) => {
  try {
    const livestream = await Livestream.query()
      .patchAndFetchById(req.params.id, req.body)
      .withGraphFetched('[room, host, currentAuction]');

    if (!livestream) {
      return res.status(404).json({ message: 'Livestream not found' });
    }

    res.json({ livestream: LivestreamPresenter.present(livestream) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete livestream
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Livestream.query().deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Livestream not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;