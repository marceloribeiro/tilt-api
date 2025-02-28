const express = require('express');
const router = express.Router();
const Brand = require('../../models/brand');
const BrandPresenter = require('../../presenters/brand_presenter');

// List all brands
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.query();
    res.json(BrandPresenter.presentMany(brands));
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
    res.json(BrandPresenter.present(brand));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create brand
router.post('/', async (req, res) => {
  try {
    const newBrand = await Brand.query().insert(req.body);
    res.status(201).json(BrandPresenter.present(newBrand));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update brand
router.patch('/:id', async (req, res) => {
  try {
    const brand = await Brand.query().patchAndFetchById(req.params.id, req.body);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.json(BrandPresenter.present(brand));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete brand
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Brand.query().deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;