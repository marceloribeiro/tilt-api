const express = require('express');
const router = express.Router();
const Style = require('../../models/style');

// List all styles
router.get('/', async (req, res) => {
  try {
    const styles = await Style.query();
    res.json(styles);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get single style
router.get('/:id', async (req, res) => {
  try {
    const style = await Style.query().findById(req.params.id);
    if (!style) {
      return res.status(404).json({ message: 'Style not found' });
    }
    res.json(style);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create style
router.post('/', async (req, res) => {
  try {
    const newStyle = await Style.query().insert(req.body);
    res.status(201).json(newStyle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update style
router.patch('/:id', async (req, res) => {
  try {
    const style = await Style.query().patchAndFetchById(req.params.id, req.body);
    if (!style) {
      return res.status(404).json({ message: 'Style not found' });
    }
    res.json(style);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete style
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Style.query().deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Style not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;