const express = require('express');
const router = express.Router();
const FootwearSize = require('../../models/footwear_size');

// List all footwear sizes
router.get('/', async (req, res) => {
  try {
    const sizes = await FootwearSize.query();
    res.json(sizes);
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
    res.json(size);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;