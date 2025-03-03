/**
 * @swagger
 * components:
 *   schemas:
 *     Style:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The style ID
 *         name:
 *           type: string
 *           description: The style name
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */

/**
 * @swagger
 * /admin/styles:
 *   get:
 *     summary: List all styles
 *     tags: [Admin Styles]
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
 *         description: List of all styles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 styles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Style'
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
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   post:
 *     summary: Create a new style
 *     tags: [Admin Styles]
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: The style name (e.g., "Casual", "Formal", "Sport")
 *     responses:
 *       201:
 *         description: Style created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Style'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *
 * /admin/styles/{id}:
 *   get:
 *     summary: Get a specific style
 *     tags: [Admin Styles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The style ID
 *     responses:
 *       200:
 *         description: Style details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Style'
 *       404:
 *         description: Style not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *
 *   patch:
 *     summary: Update a style
 *     tags: [Admin Styles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The style ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new style name
 *     responses:
 *       200:
 *         description: Style updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Style'
 *       404:
 *         description: Style not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *
 *   delete:
 *     summary: Delete a style
 *     tags: [Admin Styles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The style ID
 *     responses:
 *       204:
 *         description: Style deleted successfully
 *       404:
 *         description: Style not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 */

const express = require('express');
const router = express.Router();
const Style = require('../../models/style');
const StylePresenter = require('../../presenters/style_presenter');
const { PAGE_SIZE } = require('../../../config/constants');


router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const per_page = parseInt(req.query.per_page) || PAGE_SIZE;

    const result = await Style.query().page(page - 1, per_page);

    res.json({
      styles: await StylePresenter.presentMany(result.results),
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

// Get single style
router.get('/:id', async (req, res) => {
  try {
    const style = await Style.query().findById(req.params.id);
    if (!style) {
      return res.status(404).json({ message: 'Style not found' });
    }
    const presentedStyle = await StylePresenter.present(style);
    res.json({ style: presentedStyle });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create style
router.post('/', async (req, res) => {
  try {
    const newStyle = await Style.query().insert(req.body);
    const presentedStyle = await StylePresenter.present(newStyle);
    res.status(201).json({ style: presentedStyle });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update style
router.patch('/:id', async (req, res) => {
  try {
    const style = await Style.query().patchAndFetchById(req.params.id, req.body);
    if (!style) {
      return res.status(404).json({ message: 'Style not found' });
    }
    const presentedStyle = await StylePresenter.present(style);
    res.json({ style: presentedStyle });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const style = await Style.query().updateAndFetchById(req.params.id, req.body);
    if (!style) {
      return res.status(404).json({ message: 'Style not found' });
    }
    const presentedStyle = await StylePresenter.present(style);
    res.json({ style: presentedStyle });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete style
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Style.query().deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Style not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
