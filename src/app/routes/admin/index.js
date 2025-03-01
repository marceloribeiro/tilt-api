const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/admin_auth');

// Apply authentication and admin check to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// Import all admin routes
const roomsRoutes = require('./rooms');
const categoriesRoutes = require('./categories');
const stylesRoutes = require('./styles');
const brandsRoutes = require('./brands');
const footwearSizesRoutes = require('./footwear_sizes');
const topSizesRoutes = require('./top_sizes');
const contactsRoutes = require('./contacts');
const usersRoutes = require('./users');
const livestreamsRoutes = require('./livestreams');
const roomUsersRoutes = require('./room_users');
const messagesRoutes = require('./messages');
const itemsRoutes = require('./items');
const auctionsRoutes = require('./auctions');
const auctionBidsRoutes = require('./auction_bids');

// Register all admin routes
router.use('/categories', categoriesRoutes);
router.use('/styles', stylesRoutes);
router.use('/brands', brandsRoutes);
router.use('/footwear-sizes', footwearSizesRoutes);
router.use('/top-sizes', topSizesRoutes);
router.use('/contacts', contactsRoutes);
router.use('/users', usersRoutes);
router.use('/rooms', roomsRoutes);
router.use('/livestreams', livestreamsRoutes);
router.use('/room-users', roomUsersRoutes);
router.use('/messages', messagesRoutes);
router.use('/items', itemsRoutes);
router.use('/auctions', auctionsRoutes);
router.use('/auction-bids', auctionBidsRoutes);

module.exports = router;