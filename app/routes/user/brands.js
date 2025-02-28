const express = require('express');
const router = express.Router();
const Brand = require('../../models/brand');
const BrandPresenter = require('../../presenters/brand_presenter');

// List all brands
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.query();
    // req.user is available from the authenticateToken middleware
    const presentedBrands = await BrandPresenter.presentMany(brands, req.user);
    res.json(presentedBrands);
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
    // req.user is available from the authenticateToken middleware
    const presentedBrand = await BrandPresenter.present(brand, req.user);
    res.json(presentedBrand);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;