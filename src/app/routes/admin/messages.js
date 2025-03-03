/**
 * @swagger
 * /admin/messages:
 *   get:
 *     summary: List all messages
 *     tags: [Admin Messages]
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
 *         description: Filter messages by room ID
 *       - in: query
 *         name: author_id
 *         schema:
 *           type: integer
 *         description: Filter messages by author ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter messages by type (text, system, action)
 *     responses:
 *       200:
 *         description: List of all messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Message'
 *                       - type: object
 *                         properties:
 *                           author:
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
 *     summary: Create a new message
 *     tags: [Admin Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - author_id
 *               - room_id
 *               - content
 *             properties:
 *               author_id:
 *                 type: integer
 *               room_id:
 *                 type: integer
 *               content:
 *                 type: string
 *                 maxLength: 255
 *               type:
 *                 type: string
 *                 maxLength: 255
 *                 enum: [text, system, action]
 *     responses:
 *       201:
 *         description: Message created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Message'
 *                 - type: object
 *                   properties:
 *                     author:
 *                       $ref: '#/components/schemas/User'
 *                     room:
 *                       $ref: '#/components/schemas/Room'
 *       400:
 *         description: Invalid input
 *
 * /admin/messages/{id}:
 *   get:
 *     summary: Get a specific message
 *     tags: [Admin Messages]
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
 *         description: Message details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Message'
 *                 - type: object
 *                   properties:
 *                     author:
 *                       $ref: '#/components/schemas/User'
 *                     room:
 *                       $ref: '#/components/schemas/Room'
 *       404:
 *         description: Message not found
 *
 *   patch:
 *     summary: Update a message
 *     tags: [Admin Messages]
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
 *               content:
 *                 type: string
 *                 maxLength: 255
 *               type:
 *                 type: string
 *                 maxLength: 255
 *                 enum: [text, system, action]
 *     responses:
 *       200:
 *         description: Message updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Message'
 *                 - type: object
 *                   properties:
 *                     author:
 *                       $ref: '#/components/schemas/User'
 *                     room:
 *                       $ref: '#/components/schemas/Room'
 *       404:
 *         description: Message not found
 *
 *   delete:
 *     summary: Delete a message
 *     tags: [Admin Messages]
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
 *         description: Message deleted successfully
 *       404:
 *         description: Message not found
 */

const express = require('express');
const router = express.Router();
const Message = require('../../models/message');
const MessagePresenter = require('../../presenters/message_presenter');
const { PAGE_SIZE } = require('../../../config/constants');


// List all messages
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const per_page = parseInt(req.query.per_page) || PAGE_SIZE;

    const query = Message.query().withGraphFetched('[author, room]');

    if (req.query.room_id) {
      query.where('room_id', req.query.room_id);
    }

    if (req.query.author_id) {
      query.where('author_id', req.query.author_id);
    }

    if (req.query.type) {
      query.where('type', req.query.type);
    }

    const result = await query.page(page - 1, per_page);

    res.json({
      messages: await MessagePresenter.presentMany(result.results),
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

// Get single message
router.get('/:id', async (req, res) => {
  try {
    const message = await Message.query()
      .findById(req.params.id)
      .withGraphFetched('[author, room]');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: MessagePresenter.present(message) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create message
router.post('/', async (req, res) => {
  try {
    const newMessage = await Message.query().insert({
      ...req.body,
      type: req.body.type || Message.MESSAGE_TYPES.TEXT
    });
    const message = await Message.query()
      .findById(newMessage.id)
      .withGraphFetched('[author, room]');

    res.status(201).json({ message: MessagePresenter.present(message) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update message
router.patch('/:id', async (req, res) => {
  try {
    const message = await Message.query()
      .patchAndFetchById(req.params.id, req.body)
      .withGraphFetched('[author, room]');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: MessagePresenter.present(message) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete message
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Message.query().deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;