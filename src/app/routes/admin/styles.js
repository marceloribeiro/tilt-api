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
 *     responses:
 *       200:
 *         description: List of all styles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Style'
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
const Style = require('../../models/style');
const StylePresenter = require('../../presenters/style_presenter');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const styles = await Style.query();
    const presentedStyles = await StylePresenter.presentMany(styles);
    res.json({ styles: presentedStyles });
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
