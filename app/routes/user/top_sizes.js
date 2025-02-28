const express = require('express');
const router = express.Router();
const TopSize = require('../../models/top_size');
const TopSizePresenter = require('../../presenters/top_size_presenter');

router.get('/', async (req, res) => {
  try {
    const sizes = await TopSize.query();
    res.json(TopSizePresenter.presentMany(sizes));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const size = await TopSize.query().findById(req.params.id);
    if (!size) {
      return res.status(404).json({ message: 'Top size not found' });
    }
    res.json(TopSizePresenter.present(size));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;