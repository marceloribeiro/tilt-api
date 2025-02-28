const express = require('express');
const router = express.Router();
const Category = require('../../models/category');

// List all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.query();
    res.json(categories);
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
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create category
router.post('/', async (req, res) => {
  try {
    const newCategory = await Category.query().insert(req.body);
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update category
router.patch('/:id', async (req, res) => {
  try {
    const category = await Category.query().patchAndFetchById(req.params.id, req.body);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Category.query().deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;