const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');

router.use(authenticateToken);

const categoriesRoutes = require('./categories');
const brandsRoutes = require('./brands');
const footwearSizesRoutes = require('./footwear_sizes');
const stylesRoutes = require('./styles');
const topSizesRoutes = require('./top_sizes');
const userRoutes = require('./users');

router.use('/categories', categoriesRoutes);
router.use('/brands', brandsRoutes);
router.use('/footwear-sizes', footwearSizesRoutes);
router.use('/styles', stylesRoutes);
router.use('/top-sizes', topSizesRoutes);
router.use('/users', userRoutes);

module.exports = router;