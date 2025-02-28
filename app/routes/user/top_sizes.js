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

    const userSizes = await req.user.$relatedQuery('top_sizes');
    const presentedSize = await TopSizePresenter.present(size, req.user, userSizes);
    res.json(presentedSize);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/select/:id', async (req, res) => {
  try {
    const size = await TopSize.query().findById(req.params.id);
    if (!size) {
      return res.status(404).json({ message: 'Top size not found' });
    }

    await req.user.$relatedQuery('top_sizes').relate(size.id);

    const userSizes = await req.user.$relatedQuery('top_sizes');
    const presentedSize = await TopSizePresenter.present(size, req.user, userSizes);
    res.json(presentedSize);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Top size already selected' });
    }
    res.status(400).json({ message: err.message });
  }
});

router.delete('/select/:id', async (req, res) => {
  try {
    const size = await TopSize.query().findById(req.params.id);
    if (!size) {
      return res.status(404).json({ message: 'Top size not found' });
    }

    const numDeleted = await req.user
      .$relatedQuery('top_sizes')
      .unrelate()
      .where('users_top_sizes.top_size_id', size.id);

    if (numDeleted === 0) {
      return res.status(400).json({ message: 'Top size was not selected' });
    }

    const userSizes = await req.user.$relatedQuery('top_sizes');
    const presentedSize = await TopSizePresenter.present(size, req.user, userSizes);
    res.json(presentedSize);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;