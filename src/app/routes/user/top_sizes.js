const express = require('express');
const router = express.Router();
const TopSize = require('../../models/top_size');
const TopSizePresenter = require('../../presenters/top_size_presenter');

/**
 * @swagger
 * /user/top_sizes:
 *   get:
 *     summary: Get all top sizes with selection status
 *     tags: [User Top Sizes]
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
 *               $ref: '#/components/schemas/TopSize'
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
 *               $ref: '#/components/schemas/TopSize'
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
 *               $ref: '#/components/schemas/TopSize'
 *       400:
 *         description: Top size was not selected
 *       404:
 *         description: Top size not found
 */

router.get('/', async (req, res) => {
  try {
    const sizes = await TopSize.query();
    const presentedSizes = await TopSizePresenter.presentMany(sizes, req.user);
    res.json(presentedSizes);
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
    res.json(presentedSize);
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
    res.json(presentedSize);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Top size already selected' });
    }
    res.status(400).json({ message: err.message });
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
    res.json(presentedSize);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;