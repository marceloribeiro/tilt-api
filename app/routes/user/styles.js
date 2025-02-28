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
    const presentedStyle = await StylePresenter.present(style, req.user);
    res.json(presentedStyle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;