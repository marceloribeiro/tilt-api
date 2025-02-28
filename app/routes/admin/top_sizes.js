/**
 * @swagger
 * /admin/top_sizes:
 *   get:
 *     summary: List all top sizes
 *     tags: [Admin Top Sizes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all top sizes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TopSize'
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     summary: Create a new top size
 *     tags: [Admin Top Sizes]
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
 *     responses:
 *       201:
 *         description: Top size created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TopSize'
 *       400:
 *         description: Invalid input
 *
 * /admin/top_sizes/{id}:
 *   get:
 *     summary: Get a specific top size
 *     tags: [Admin Top Sizes]
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
 *         description: Top size details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TopSize'
 *       404:
 *         description: Top size not found
 *
 *   patch:
 *     summary: Update a top size
 *     tags: [Admin Top Sizes]
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
 *               size:
 *                 type: string
 *     responses:
 *       200:
 *         description: Top size updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TopSize'
 *       404:
 *         description: Top size not found
 *
 *   delete:
 *     summary: Delete a top size
 *     tags: [Admin Top Sizes]
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
 *         description: Top size deleted successfully
 *       404:
 *         description: Top size not found
 */


const express = require('express');
const router = express.Router();
const TopSize = require('../../models/top_size');

// List all top sizes
router.get('/', async (req, res) => {
  try {
    const sizes = await TopSize.query();
    res.json(sizes);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get single top size
router.get('/:id', async (req, res) => {
  try {
    const size = await TopSize.query().findById(req.params.id);
    if (!size) {
      return res.status(404).json({ message: 'Top size not found' });
    }
    res.json(size);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create top size
router.post('/', async (req, res) => {
  try {
    const newSize = await TopSize.query().insert(req.body);
    res.status(201).json(newSize);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update top size
router.patch('/:id', async (req, res) => {
  try {
    const size = await TopSize.query().patchAndFetchById(req.params.id, req.body);
    if (!size) {
      return res.status(404).json({ message: 'Top size not found' });
    }
    res.json(size);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete top size
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await TopSize.query().deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Top size not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;