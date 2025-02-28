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
    const presentedSize = await FootwearSizePresenter.present(size, req.user);
    res.json(presentedSize);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;