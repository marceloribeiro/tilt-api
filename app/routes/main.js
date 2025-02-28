const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    name: 'Tilt API',
    version: process.env.API_VERSION || '1.0.0',
    status: 'running'
  });
});

module.exports = router;
