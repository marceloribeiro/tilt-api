/**
 * @swagger
 * /admin/items:
 *   get:
 *     summary: List all items
 *     tags: [Admin Items]
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
 *         name: owner_id
 *         schema:
 *           type: integer
 *         description: Filter items by owner ID
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Filter items by category ID
 *       - in: query
 *         name: brand_id
 *         schema:
 *           type: integer
 *         description: Filter items by brand ID
 *       - in: query
 *         name: style_id
 *         schema:
 *           type: integer
 *         description: Filter items by style ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter items by status (available, sold, reserved, archived)
 *     responses:
 *       200:
 *         description: List of all items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Item'
 *                       - type: object
 *                         properties:
 *                           owner:
 *                             $ref: '#/components/schemas/User'
 *                           category:
 *                             $ref: '#/components/schemas/Category'
 *                           brand:
 *                             $ref: '#/components/schemas/Brand'
 *                           style:
 *                             $ref: '#/components/schemas/Style'
 *                           footwearSize:
 *                             $ref: '#/components/schemas/FootwearSize'
 *                           topSize:
 *                             $ref: '#/components/schemas/TopSize'
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
 *     summary: Create a new item
 *     tags: [Admin Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - owner_id
 *               - name
 *             properties:
 *               owner_id:
 *                 type: integer
 *               category_id:
 *                 type: integer
 *               brand_id:
 *                 type: integer
 *               style_id:
 *                 type: integer
 *               footwear_size_id:
 *                 type: integer
 *               top_size_id:
 *                 type: integer
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
 *               status:
 *                 type: string
 *                 enum: [available, sold, reserved, archived]
 *               price:
 *                 type: number
 *               currency:
 *                 type: string
 *                 maxLength: 255
 *     responses:
 *       201:
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Item'
 *                 - type: object
 *                   properties:
 *                     owner:
 *                       $ref: '#/components/schemas/User'
 *                     category:
 *                       $ref: '#/components/schemas/Category'
 *                     brand:
 *                       $ref: '#/components/schemas/Brand'
 *                     style:
 *                       $ref: '#/components/schemas/Style'
 *                     footwearSize:
 *                       $ref: '#/components/schemas/FootwearSize'
 *                     topSize:
 *                       $ref: '#/components/schemas/TopSize'
 *       400:
 *         description: Invalid input
 *
 * /admin/items/{id}:
 *   get:
 *     summary: Get a specific item
 *     tags: [Admin Items]
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
 *         description: Item details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Item'
 *                 - type: object
 *                   properties:
 *                     owner:
 *                       $ref: '#/components/schemas/User'
 *                     category:
 *                       $ref: '#/components/schemas/Category'
 *                     brand:
 *                       $ref: '#/components/schemas/Brand'
 *                     style:
 *                       $ref: '#/components/schemas/Style'
 *                     footwearSize:
 *                       $ref: '#/components/schemas/FootwearSize'
 *                     topSize:
 *                       $ref: '#/components/schemas/TopSize'
 *       404:
 *         description: Item not found
 *
 *   patch:
 *     summary: Update an item
 *     tags: [Admin Items]
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
 *               category_id:
 *                 type: integer
 *               brand_id:
 *                 type: integer
 *               style_id:
 *                 type: integer
 *               footwear_size_id:
 *                 type: integer
 *               top_size_id:
 *                 type: integer
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
 *               status:
 *                 type: string
 *                 enum: [available, sold, reserved, archived]
 *               price:
 *                 type: number
 *               currency:
 *                 type: string
 *                 maxLength: 255
 *     responses:
 *       200:
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Item'
 *                 - type: object
 *                   properties:
 *                     owner:
 *                       $ref: '#/components/schemas/User'
 *                     category:
 *                       $ref: '#/components/schemas/Category'
 *                     brand:
 *                       $ref: '#/components/schemas/Brand'
 *                     style:
 *                       $ref: '#/components/schemas/Style'
 *                     footwearSize:
 *                       $ref: '#/components/schemas/FootwearSize'
 *                     topSize:
 *                       $ref: '#/components/schemas/TopSize'
 *       404:
 *         description: Item not found
 *
 *   delete:
 *     summary: Delete an item
 *     tags: [Admin Items]
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
 *         description: Item deleted successfully
 *       404:
 *         description: Item not found
 */

const express = require('express');
const router = express.Router();
const Item = require('../../models/item');
const ItemPresenter = require('../../presenters/item_presenter');
const { PAGE_SIZE } = require('../../../config/constants');


// List all items
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const per_page = parseInt(req.query.per_page) || PAGE_SIZE;

    const query = Item.query().withGraphFetched('[owner, category, brand, style, footwearSize, topSize]');

    if (req.query.owner_id) {
      query.where('owner_id', req.query.owner_id);
    }

    if (req.query.category_id) {
      query.where('category_id', req.query.category_id);
    }

    if (req.query.brand_id) {
      query.where('brand_id', req.query.brand_id);
    }

    if (req.query.style_id) {
      query.where('style_id', req.query.style_id);
    }

    if (req.query.status) {
      query.where('status', req.query.status);
    }

    const result = await query.page(page - 1, per_page);

    res.json({
      items: await ItemPresenter.presentMany(result.results),
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

// Get single item
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.query()
      .findById(req.params.id)
      .withGraphFetched('[owner, category, brand, style, footwearSize, topSize]');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ item: ItemPresenter.present(item) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create item
router.post('/', async (req, res) => {
  try {
    const newItem = await Item.query().insert({
      ...req.body,
      status: req.body.status || Item.STATUSES.AVAILABLE
    });
    const item = await Item.query()
      .findById(newItem.id)
      .withGraphFetched('[owner, category, brand, style, footwearSize, topSize]');

    res.status(201).json({ item: ItemPresenter.present(item) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update item
router.patch('/:id', async (req, res) => {
  try {
    const item = await Item.query()
      .patchAndFetchById(req.params.id, req.body)
      .withGraphFetched('[owner, category, brand, style, footwearSize, topSize]');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ item: ItemPresenter.present(item) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete item
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Item.query().deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;