const express = require('express');
const router = express.Router();
require('dotenv').config();

router.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

module.exports = router;