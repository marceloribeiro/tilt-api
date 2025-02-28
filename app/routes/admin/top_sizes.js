const express = require('express');
const router = express.Router();
const TopSize = require('../../models/top_size');

// List all top sizes
router.get('/', async (req, res) => {
  try {
    const sizes = await TopSize.query();
    res.json(sizes);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get single top size
router.get('/:id', async (req, res) => {
  try {
    const size = await TopSize.query().findById(req.params.id);
    if (!size) {
      return res.status(404).json({ message: 'Top size not found' });
    }
    res.json(size);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create top size
router.post('/', async (req, res) => {
  try {
    const newSize = await TopSize.query().insert(req.body);
    res.status(201).json(newSize);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update top size
router.patch('/:id', async (req, res) => {
  try {
    const size = await TopSize.query().patchAndFetchById(req.params.id, req.body);
    if (!size) {
      return res.status(404).json({ message: 'Top size not found' });
    }
    res.json(size);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete top size
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await TopSize.query().deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Top size not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;