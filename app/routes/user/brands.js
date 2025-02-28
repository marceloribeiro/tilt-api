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

module.exports = router;