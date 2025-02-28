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

// Create footwear size
router.post('/', async (req, res) => {
  try {
    const newSize = await FootwearSize.query().insert(req.body);
    res.status(201).json(newSize);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update footwear size
router.patch('/:id', async (req, res) => {
  try {
    const size = await FootwearSize.query().patchAndFetchById(req.params.id, req.body);
    if (!size) {
      return res.status(404).json({ message: 'Footwear size not found' });
    }
    res.json(size);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete footwear size
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await FootwearSize.query().deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Footwear size not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;