/**
 * @swagger
 * /admin/brands:
 *   get:
 *     summary: List all brands
 *     tags: [Admin Brands]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all brands
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Brand'
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     summary: Create a new brand
 *     tags: [Admin Brands]
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
 *     responses:
 *       201:
 *         description: Brand created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Invalid input
 *
 * /admin/brands/{id}:
 *   get:
 *     summary: Get a specific brand
 *     tags: [Admin Brands]
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
 *         description: Brand details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       404:
 *         description: Brand not found
 *
 *   patch:
 *     summary: Update a brand
 *     tags: [Admin Brands]
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
 *     responses:
 *       200:
 *         description: Brand updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       404:
 *         description: Brand not found
 *
 *   delete:
 *     summary: Delete a brand
 *     tags: [Admin Brands]
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
 *         description: Brand deleted successfully
 *       404:
 *         description: Brand not found
 */


const express = require('express');
const router = express.Router();
const Brand = require('../../models/brand');
const BrandPresenter = require('../../presenters/brand_presenter');


// List all brands
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.query();
    res.json(BrandPresenter.presentMany(brands));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get single brand
router.get('/:id', async (req, res) => {
  try {
    const brand = await Brand.query().findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.json(BrandPresenter.present(brand));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create brand
router.post('/', async (req, res) => {
  try {
    const newBrand = await Brand.query().insert(req.body);
    res.status(201).json(BrandPresenter.present(newBrand));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update brand
router.patch('/:id', async (req, res) => {
  try {
    const brand = await Brand.query().patchAndFetchById(req.params.id, req.body);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.json(BrandPresenter.present(brand));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete brand
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Brand.query().deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;