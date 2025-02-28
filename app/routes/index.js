const express = require('express');
const router = express.Router();
require('dotenv').config();

router.get('/', (req, res) => {
  res.json({
    message: 'Tilt API',
    version: process.env.API_VERSION || '1.0.0'  // Fallback version if env var not set
  });
});

module.exports = router;