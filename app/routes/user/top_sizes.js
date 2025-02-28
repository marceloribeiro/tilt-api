const express = require('express');
const router = express.Router();
const TopSize = require('../../models/top_size');
const TopSizePresenter = require('../../presenters/top_size_presenter');

router.get('/', async (req, res) => {
  try {
    const sizes = await TopSize.query();
    const presentedSizes = await TopSizePresenter.presentMany(sizes, req.user);
    res.json(presentedSizes);
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
    const presentedSize = await TopSizePresenter.present(size, req.user);
    res.json(presentedSize);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;