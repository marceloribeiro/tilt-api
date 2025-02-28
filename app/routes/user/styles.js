const express = require('express');
const router = express.Router();
const Style = require('../../models/style');
const StylePresenter = require('../../presenters/style_presenter');

router.get('/', async (req, res) => {
  try {
    const styles = await Style.query();
    res.json(StylePresenter.presentMany(styles));
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
    res.json(StylePresenter.present(style));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;