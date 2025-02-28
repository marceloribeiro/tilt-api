const express = require('express');
const router = express.Router();
const Category = require('../../models/category');
const CategoryPresenter = require('../../presenters/category_presenter');

// List all categories
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