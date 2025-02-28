const express = require('express');
const router = express.Router();
const Style = require('../../models/style');
const StylePresenter = require('../../presenters/style_presenter');

router.get('/', async (req, res) => {
  try {
    const styles = await Style.query();
    const presentedStyles = await StylePresenter.presentMany(styles, req.user);
    res.json(presentedStyles);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const style = await Style.query().findById(req.params.id);
    if (!style) {
      return res.status(404).json({ message: 'Style not found' });
    }

    const userStyles = await req.user.$relatedQuery('styles');
    const presentedStyle = await StylePresenter.present(style, req.user, userStyles);
    res.json(presentedStyle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/select/:id', async (req, res) => {
  try {
    const style = await Style.query().findById(req.params.id);
    if (!style) {
      return res.status(404).json({ message: 'Style not found' });
    }

    await req.user.$relatedQuery('styles').relate(style.id);

    const userStyles = await req.user.$relatedQuery('styles');
    const presentedStyle = await StylePresenter.present(style, req.user, userStyles);
    res.json(presentedStyle);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Style already selected' });
    }
    res.status(400).json({ message: err.message });
  }
});

router.delete('/select/:id', async (req, res) => {
  try {
    const style = await Style.query().findById(req.params.id);
    if (!style) {
      return res.status(404).json({ message: 'Style not found' });
    }

    const numDeleted = await req.user
      .$relatedQuery('styles')
      .unrelate()
      .where('users_styles.style_id', style.id);

    if (numDeleted === 0) {
      return res.status(400).json({ message: 'Style was not selected' });
    }

    const userStyles = await req.user.$relatedQuery('styles');
    const presentedStyle = await StylePresenter.present(style, req.user, userStyles);
    res.json(presentedStyle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;