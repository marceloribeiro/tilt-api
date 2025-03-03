/**
 * @swagger
 * /user/top_sizes:
 *   get:
 *     summary: Get all top sizes with selection status
 *     tags: [User Top Sizes]
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
 *         description: List of all top sizes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 top_sizes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TopSize'
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
 *         description: Not authenticated
 *
 * /user/top_sizes/{id}:
 *   get:
 *     summary: Get a specific top size
 *     tags: [User Top Sizes]
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
 *               type: object
 *               properties:
 *                 top_size:
 *                   $ref: '#/components/schemas/TopSize'
 *       404:
 *         description: Top size not found
 *
 * /user/top_sizes/select/{id}:
 *   post:
 *     summary: Select a top size
 *     tags: [User Top Sizes]
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
 *         description: Top size selected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 top_size:
 *                   $ref: '#/components/schemas/TopSize'
 *       400:
 *         description: Top size already selected
 *       404:
 *         description: Top size not found
 *
 *   delete:
 *     summary: Deselect a top size
 *     tags: [User Top Sizes]
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
 *         description: Top size deselected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 top_size:
 *                   $ref: '#/components/schemas/TopSize'
 *       400:
 *         description: Top size was not selected
 *       404:
 *         description: Top size not found
 */

const express = require('express');
const router = express.Router();
const TopSize = require('../../models/top_size');
const TopSizePresenter = require('../../presenters/top_size_presenter');
const { PAGE_SIZE } = require('../../../config/constants');


router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const per_page = parseInt(req.query.per_page) || PAGE_SIZE;

    const result = await TopSize.query().page(page - 1, per_page);
    const presentedSizes = await TopSizePresenter.presentMany(result.results, req.user);

    res.json({
      top_sizes: presentedSizes,
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

router.get('/:id', async (req, res) => {
  try {
    const size = await TopSize.query().findById(req.params.id);
    if (!size) {
      return res.status(404).json({ message: 'Top size not found' });
    }

    const userSizes = await req.user.$relatedQuery('top_sizes');
    const presentedSize = await TopSizePresenter.present(size, req.user, userSizes);
    res.json({ top_size: presentedSize });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/select/:id', async (req, res) => {
  try {
    const size = await TopSize.query().findById(req.params.id);
    if (!size) {
      return res.status(404).json({ message: 'Top size not found' });
    }

    await req.user.$relatedQuery('top_sizes').relate(size.id);

    const userSizes = await req.user.$relatedQuery('top_sizes');
    const presentedSize = await TopSizePresenter.present(size, req.user, userSizes);
    res.json({ top_size: presentedSize });
  } catch (err) {
    res.status(400).json({ message: 'Top size already selected' });
  }
});

router.delete('/select/:id', async (req, res) => {
  try {
    const size = await TopSize.query().findById(req.params.id);
    if (!size) {
      return res.status(404).json({ message: 'Top size not found' });
    }

    const numDeleted = await req.user
      .$relatedQuery('top_sizes')
      .unrelate()
      .where('users_top_sizes.top_size_id', size.id);

    if (numDeleted === 0) {
      return res.status(400).json({ message: 'Top size was not selected' });
    }

    const userSizes = await req.user.$relatedQuery('top_sizes');
    const presentedSize = await TopSizePresenter.present(size, req.user, userSizes);
    res.json({ top_size: presentedSize });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;