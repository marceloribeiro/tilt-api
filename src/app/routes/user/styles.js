/**
 * @swagger
 * /user/styles:
 *   get:
 *     summary: Get all styles with selection status
 *     tags: [User Styles]
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
 *         description: List of all styles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 styles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Style'
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
 * /user/styles/{id}:
 *   get:
 *     summary: Get a specific style
 *     tags: [User Styles]
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
 *         description: Style details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 style:
 *                   $ref: '#/components/schemas/Style'
 *       404:
 *         description: Style not found
 *
 * /user/styles/select/{id}:
 *   post:
 *     summary: Select a style
 *     tags: [User Styles]
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
 *         description: Style selected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 style:
 *                   $ref: '#/components/schemas/Style'
 *       400:
 *         description: Style already selected
 *       404:
 *         description: Style not found
 *
 *   delete:
 *     summary: Deselect a style
 *     tags: [User Styles]
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
 *         description: Style deselected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 style:
 *                   $ref: '#/components/schemas/Style'
 *       400:
 *         description: Style was not selected
 *       404:
 *         description: Style not found
 */

const express = require('express');
const router = express.Router();
const Style = require('../../models/style');
const StylePresenter = require('../../presenters/style_presenter');
const { PAGE_SIZE } = require('../../../config/constants');


router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const per_page = parseInt(req.query.per_page) || PAGE_SIZE;

    const result = await Style.query().page(page - 1, per_page);
    const presentedStyles = await StylePresenter.presentMany(result.results, req.user);

    res.json({
      styles: presentedStyles,
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
    const style = await Style.query().findById(req.params.id);
    if (!style) {
      return res.status(404).json({ message: 'Style not found' });
    }

    const userStyles = await req.user.$relatedQuery('styles');
    const presentedStyle = await StylePresenter.present(style, req.user, userStyles);
    res.json({ style: presentedStyle });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/select/:id', async (req, res) => {
  try {
    const style = await Style.query().findById(req.params.id);
    if (!style) {
      return res.status(404).json({ message: 'Style not found' });
    }

    await req.user.$relatedQuery('styles').relate(style.id);

    const userStyles = await req.user.$relatedQuery('styles');
    const presentedStyle = await StylePresenter.present(style, req.user, userStyles);
    res.json({ style: presentedStyle });
  } catch (err) {
    res.status(400).json({ message: 'Style already selected' });
  }
});

router.delete('/select/:id', async (req, res) => {
  try {
    const style = await Style.query().findById(req.params.id);
    if (!style) {
      return res.status(404).json({ message: 'Style not found' });
    }

    const numDeleted = await req.user
      .$relatedQuery('styles')
      .unrelate()
      .where('users_styles.style_id', style.id);

    if (numDeleted === 0) {
      return res.status(400).json({ message: 'Style was not selected' });
    }

    const userStyles = await req.user.$relatedQuery('styles');
    const presentedStyle = await StylePresenter.present(style, req.user, userStyles);
    res.json({ style: presentedStyle });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;