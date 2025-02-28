/**
 * @swagger
 * components:
 *   schemas:
 *     Brand:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The brand ID
 *         name:
 *           type: string
 *           description: Brand name
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         selected:
 *           type: boolean
 *           description: Indicates if the brand is selected by the current user
 */

/**
 * @swagger
 * /user/brands:
 *   get:
 *     summary: Get all brands with selection status
 *     tags: [User Brands]
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
 *         description: Not authenticated
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /user/brands/{id}:
 *   get:
 *     summary: Get a specific brand with selection status
 *     tags: [User Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Brand details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       404:
 *         description: Brand not found
 *       401:
 *         description: Not authenticated
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /user/brands/select/{id}:
 *   post:
 *     summary: Select a brand for the current user
 *     tags: [User Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Brand ID to select
 *     responses:
 *       200:
 *         description: Brand selected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       404:
 *         description: Brand not found
 *       400:
 *         description: Brand already selected or other error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Brand already selected
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /user/brands/select/{id}:
 *   delete:
 *     summary: Deselect a brand for the current user
 *     tags: [User Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Brand ID to deselect
 *     responses:
 *       200:
 *         description: Brand deselected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       404:
 *         description: Brand not found
 *       400:
 *         description: Brand was not selected or other error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Brand was not selected
 *       401:
 *         description: Not authenticated
 */

const express = require('express');
const router = express.Router();
const Brand = require('../../models/brand');
const BrandPresenter = require('../../presenters/brand_presenter');

// List all brands
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.query();
    const presentedBrands = await BrandPresenter.presentMany(brands, req.user);
    res.json(presentedBrands);
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

    const userBrands = await req.user.$relatedQuery('brands');
    const presentedBrand = await BrandPresenter.present(brand, req.user, userBrands);
    res.json(presentedBrand);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/select/:id', async (req, res) => {
  try {
    const brand = await Brand.query().findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    await req.user.$relatedQuery('brands').relate(brand.id);

    const userBrands = await req.user.$relatedQuery('brands');
    const presentedBrand = await BrandPresenter.present(brand, req.user, userBrands);
    res.json(presentedBrand);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Brand already selected' });
    }
    res.status(400).json({ message: err.message });
  }
});

router.delete('/select/:id', async (req, res) => {
  try {
    const brand = await Brand.query().findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    const numDeleted = await req.user
      .$relatedQuery('brands')
      .unrelate()
      .where('users_brands.brand_id', brand.id);

    if (numDeleted === 0) {
      return res.status(400).json({ message: 'Brand was not selected' });
    }

    const userBrands = await req.user.$relatedQuery('brands');
    const presentedBrand = await BrandPresenter.present(brand, req.user, userBrands);
    res.json(presentedBrand);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;