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
    const presentedCategory = await CategoryPresenter.present(category, req.user);
    res.json(presentedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;