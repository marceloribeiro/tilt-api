const express = require('express');
const router = express.Router();
require('dotenv').config();

// Import all route modules
const mainRouter = require('./main');
const authRouter = require('./auth');
const userRoutes = require('./user');
const adminRoutes = require('./admin');

// Register routes
router.use('/', mainRouter);
router.use('/auth', authRouter);
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);

module.exports = router;