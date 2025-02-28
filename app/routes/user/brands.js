const express = require('express');
const router = express.Router();
const Brand = require('../../models/brand');
const BrandPresenter = require('../../presenters/brand_presenter');

// List all brands
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.query();
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

    const userBrands = await req.user.$relatedQuery('brands');
    const presentedBrand = await BrandPresenter.present(brand, req.user, userBrands);
    res.json(presentedBrand);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/select/:id', async (req, res) => {
  try {
    const brand = await Brand.query().findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    await req.user.$relatedQuery('brands').relate(brand.id);

    const userBrands = await req.user.$relatedQuery('brands');
    const presentedBrand = await BrandPresenter.present(brand, req.user, userBrands);
    res.json(presentedBrand);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Brand already selected' });
    }
    res.status(400).json({ message: err.message });
  }
});

router.delete('/select/:id', async (req, res) => {
  try {
    const brand = await Brand.query().findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    const numDeleted = await req.user
      .$relatedQuery('brands')
      .unrelate()
      .where('users_brands.brand_id', brand.id);

    if (numDeleted === 0) {
      return res.status(400).json({ message: 'Brand was not selected' });
    }

    const userBrands = await req.user.$relatedQuery('brands');
    const presentedBrand = await BrandPresenter.present(brand, req.user, userBrands);
    res.json(presentedBrand);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;