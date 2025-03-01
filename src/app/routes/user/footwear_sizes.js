/**
 * @swagger
 * /user/footwear_sizes:
 *   get:
 *     summary: Get all footwear sizes with selection status
 *     tags: [User Footwear Sizes]
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
 *         description: Not authenticated
 *
 * /user/footwear_sizes/{id}:
 *   get:
 *     summary: Get a specific footwear size
 *     tags: [User Footwear Sizes]
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
 *         description: Footwear size details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FootwearSize'
 *       404:
 *         description: Footwear size not found
 *
 * /user/footwear_sizes/select/{id}:
 *   post:
 *     summary: Select a footwear size
 *     tags: [User Footwear Sizes]
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
 *         description: Footwear size selected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FootwearSize'
 *       400:
 *         description: Footwear size already selected
 *       404:
 *         description: Footwear size not found
 *
 *   delete:
 *     summary: Deselect a footwear size
 *     tags: [User Footwear Sizes]
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
 *         description: Footwear size deselected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FootwearSize'
 *       400:
 *         description: Footwear size was not selected
 *       404:
 *         description: Footwear size not found
 */

const express = require('express');
const router = express.Router();
const FootwearSize = require('../../models/footwear_size');
const FootwearSizePresenter = require('../../presenters/footwear_size_presenter');


// List all footwear sizes
router.get('/', async (req, res) => {
  try {
    const sizes = await FootwearSize.query();
    const presentedSizes = await FootwearSizePresenter.presentMany(sizes, req.user);
    res.json(presentedSizes);
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

    const userSizes = await req.user.$relatedQuery('footwear_sizes');
    const presentedSize = await FootwearSizePresenter.present(size, req.user, userSizes);
    res.json(presentedSize);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/select/:id', async (req, res) => {
  try {
    const size = await FootwearSize.query().findById(req.params.id);
    if (!size) {
      return res.status(404).json({ message: 'Footwear size not found' });
    }

    await req.user.$relatedQuery('footwear_sizes').relate(size.id);

    const userSizes = await req.user.$relatedQuery('footwear_sizes');
    const presentedSize = await FootwearSizePresenter.present(size, req.user, userSizes);
    res.json(presentedSize);
  } catch (err) {
    res.status(400).json({ message: 'Footwear size already selected' });
  }
});

router.delete('/select/:id', async (req, res) => {
  try {
    const size = await FootwearSize.query().findById(req.params.id);
    if (!size) {
      return res.status(404).json({ message: 'Footwear size not found' });
    }

    const numDeleted = await req.user
      .$relatedQuery('footwear_sizes')
      .unrelate()
      .where('users_footwear_sizes.footwear_size_id', size.id);

    if (numDeleted === 0) {
      return res.status(400).json({ message: 'Footwear size was not selected' });
    }

    const userSizes = await req.user.$relatedQuery('footwear_sizes');
    const presentedSize = await FootwearSizePresenter.present(size, req.user, userSizes);
    res.json(presentedSize);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;