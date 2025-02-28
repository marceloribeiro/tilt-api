/**
 * @swagger
 * /user/categories:
 *   get:
 *     summary: Get all categories with selection status
 *     description: Returns a list of all categories, indicating which ones are selected by the current user
 *     tags: [User Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories with selection status
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Category'
 *                   - type: object
 *                     properties:
 *                       selected:
 *                         type: boolean
 *                         description: Indicates if the category is selected by the current user
 *       401:
 *         description: Not authenticated
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /user/categories/{id}:
 *   get:
 *     summary: Get a specific category with selection status
 *     description: Returns details of a specific category, indicating if it's selected by the current user
 *     tags: [User Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category details with selection status
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Category'
 *                 - type: object
 *                   properties:
 *                     selected:
 *                       type: boolean
 *                       description: Indicates if the category is selected by the current user
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /user/categories/select/{id}:
 *   post:
 *     summary: Select a category for the current user
 *     description: Creates an association between the current user and the specified category
 *     tags: [User Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID to select
 *     responses:
 *       200:
 *         description: Category selected successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Category'
 *                 - type: object
 *                   properties:
 *                     selected:
 *                       type: boolean
 *                       description: Will be true after successful selection
 *       400:
 *         description: Category already selected or other error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   delete:
 *     summary: Deselect a category for the current user
 *     description: Removes the association between the current user and the specified category
 *     tags: [User Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID to deselect
 *     responses:
 *       200:
 *         description: Category deselected successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Category'
 *                 - type: object
 *                   properties:
 *                     selected:
 *                       type: boolean
 *                       description: Will be false after successful deselection
 *       400:
 *         description: Category was not selected or other error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

const express = require('express');
const router = express.Router();
const Category = require('../../models/category');
const CategoryPresenter = require('../../presenters/category_presenter');

router.get('/', async (req, res) => {
  try {
    const categories = await Category.query();
    const presentedCategories = await CategoryPresenter.presentMany(categories, req.user);
    res.json(presentedCategories);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.query().findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Preload user's categories before presenting
    const userCategories = await req.user.$relatedQuery('categories');
    const presentedCategory = await CategoryPresenter.present(category, req.user, userCategories);
    res.json(presentedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Select a category
router.post('/select/:id', async (req, res) => {
  try {
    const category = await Category.query().findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await req.user.$relatedQuery('categories').relate(category.id);

    // Reload user's categories before presenting
    const userCategories = await req.user.$relatedQuery('categories');
    const presentedCategory = await CategoryPresenter.present(category, req.user, userCategories);
    res.json(presentedCategory);
  } catch (err) {
    // Handle unique constraint violation
    if (err.code === '23505') { // PostgreSQL unique constraint violation
      return res.status(400).json({ message: 'Category already selected' });
    }
    res.status(400).json({ message: err.message });
  }
});

// Deselect a category
router.delete('/select/:id', async (req, res) => {
  try {
    const category = await Category.query().findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Fix the unrelate query by being explicit about the category_id
    const numDeleted = await req.user
      .$relatedQuery('categories')
      .unrelate()
      .where('users_categories.category_id', category.id);

    if (numDeleted === 0) {
      return res.status(400).json({ message: 'Category was not selected' });
    }

    // Reload user's categories before presenting
    const userCategories = await req.user.$relatedQuery('categories');
    const presentedCategory = await CategoryPresenter.present(category, req.user, userCategories);
    res.json(presentedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;