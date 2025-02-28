/**
 * @swagger
 * /admin/footwear_sizes:
 *   get:
 *     summary: List all footwear sizes
 *     tags: [Admin Footwear Sizes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all footwear sizes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FootwearSize'
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     summary: Create a new footwear size
 *     tags: [Admin Footwear Sizes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - size
 *             properties:
 *               size:
 *                 type: string
 *                 description: The footwear size value (e.g., "8", "8.5", "9")
 *     responses:
 *       201:
 *         description: Footwear size created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FootwearSize'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /admin/footwear_sizes/{id}:
 *   get:
 *     summary: Get a specific footwear size
 *     tags: [Admin Footwear Sizes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The footwear size ID
 *     responses:
 *       200:
 *         description: Footwear size details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FootwearSize'
 *       404:
 *         description: Footwear size not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   patch:
 *     summary: Update a footwear size
 *     tags: [Admin Footwear Sizes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The footwear size ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               size:
 *                 type: string
 *                 description: The new footwear size value
 *     responses:
 *       200:
 *         description: Footwear size updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FootwearSize'
 *       404:
 *         description: Footwear size not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   delete:
 *     summary: Delete a footwear size
 *     tags: [Admin Footwear Sizes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The footwear size ID
 *     responses:
 *       204:
 *         description: Footwear size deleted successfully
 *       404:
 *         description: Footwear size not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */


const express = require('express');
const router = express.Router();
const FootwearSize = require('../../models/footwear_size');
const FootwearSizePresenter = require('../../presenters/footwear_size_presenter');

// List all footwear sizes
router.get('/', async (req, res) => {
  try {
    const sizes = await FootwearSize.query();
    res.json(FootwearSizePresenter.presentMany(sizes));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get single footwear size
router.get('/:id', async (req, res) => {
  try {
    const size = await FootwearSize.query().findById(req.params.id);
    if (!size) {
      return res.status(404).json({ message: 'Footwear size not found' });
    }
    res.json(FootwearSizePresenter.present(size));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create footwear size
router.post('/', async (req, res) => {
  try {
    const newSize = await FootwearSize.query().insert(req.body);
    res.status(201).json(FootwearSizePresenter.present(newSize));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update footwear size
router.patch('/:id', async (req, res) => {
  try {
    const size = await FootwearSize.query().patchAndFetchById(req.params.id, req.body);
    if (!size) {
      return res.status(404).json({ message: 'Footwear size not found' });
    }
    res.json(FootwearSizePresenter.present(size));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete footwear size
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await FootwearSize.query().deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Footwear size not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;