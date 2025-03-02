const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');

router.use(authenticateToken);

const categoriesRoutes = require('./categories');
const brandsRoutes = require('./brands');
const footwear_sizesRoutes = require('./footwear_sizes');
const stylesRoutes = require('./styles');
const topSizesRoutes = require('./top_sizes');
const userRoutes = require('./users');
const contactsRouter = require('./contacts');

router.use('/categories', categoriesRoutes);
router.use('/brands', brandsRoutes);
router.use('/footwear_sizes', footwear_sizesRoutes);
router.use('/styles', stylesRoutes);
router.use('/top_sizes', topSizesRoutes);
router.use('/users', userRoutes);
router.use('/contacts', contactsRouter);

module.exports = router;