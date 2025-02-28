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
 */

const express = require('express');
const router = express.Router();
const Style = require('../../models/style');

router.get('/', async (req, res) => {
  try {
    const styles = await Style.query();
    res.json(styles);
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
    res.json(style);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create style
router.post('/', async (req, res) => {
  try {
    const newStyle = await Style.query().insert(req.body);
    res.status(201).json(newStyle);
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
    res.json(style);
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