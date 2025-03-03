/**
 * @swagger
 * /admin/auction_bids:
 *   get:
 *     summary: List all auction bids
 *     tags: [Admin Auction Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: auction_id
 *         schema:
 *           type: integer
 *         description: Filter bids by auction ID
 *       - in: query
 *         name: bidder_id
 *         schema:
 *           type: integer
 *         description: Filter bids by bidder ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter bids by status (pending, accepted, rejected, cancelled, outbid)
 *     responses:
 *       200:
 *         description: List of all auction bids
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 auction_bids:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/AuctionBid'
 *                       - type: object
 *                         properties:
 *                           bidder:
 *                             $ref: '#/components/schemas/User'
 *                           auction:
 *                             $ref: '#/components/schemas/Auction'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of records
 *                     per_page:
 *                       type: integer
 *                       description: Number of items per page
 *                     current_page:
 *                       type: integer
 *                       description: Current page number
 *                     total_pages:
 *                       type: integer
 *                       description: Total number of pages
 *
 *   post:
 *     summary: Create a new auction bid
 *     tags: [Admin Auction Bids]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - auction_id
 *               - bidder_id
 *               - amount
 *               - currency
 *             properties:
 *               auction_id:
 *                 type: integer
 *               bidder_id:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, rejected, cancelled, outbid]
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 maxLength: 255
 *     responses:
 *       201:
 *         description: Auction bid created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/AuctionBid'
 *                 - type: object
 *                   properties:
 *                     bidder:
 *                       $ref: '#/components/schemas/User'
 *                     auction:
 *                       $ref: '#/components/schemas/Auction'
 *       400:
 *         description: Invalid input
 *
 * /admin/auction_bids/{id}:
 *   get:
 *     summary: Get a specific auction bid
 *     tags: [Admin Auction Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Auction bid details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/AuctionBid'
 *                 - type: object
 *                   properties:
 *                     bidder:
 *                       $ref: '#/components/schemas/User'
 *                     auction:
 *                       $ref: '#/components/schemas/Auction'
 *       404:
 *         description: Auction bid not found
 *
 *   patch:
 *     summary: Update an auction bid
 *     tags: [Admin Auction Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, rejected, cancelled, outbid]
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 maxLength: 255
 *     responses:
 *       200:
 *         description: Auction bid updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/AuctionBid'
 *                 - type: object
 *                   properties:
 *                     bidder:
 *                       $ref: '#/components/schemas/User'
 *                     auction:
 *                       $ref: '#/components/schemas/Auction'
 *       404:
 *         description: Auction bid not found
 *
 *   delete:
 *     summary: Delete an auction bid
 *     tags: [Admin Auction Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Auction bid deleted successfully
 *       404:
 *         description: Auction bid not found
 */

const express = require('express');
const router = express.Router();
const AuctionBid = require('../../models/auction_bid');
const AuctionBidPresenter = require('../../presenters/auction_bid_presenter');
const { PAGE_SIZE } = require('../../../config/constants');

// List all auction bids
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const per_page = parseInt(req.query.per_page) || PAGE_SIZE;

    const query = AuctionBid.query().withGraphFetched('[bidder, auction]');

    if (req.query.auction_id) {
      query.where('auction_id', req.query.auction_id);
    }

    if (req.query.bidder_id) {
      query.where('bidder_id', req.query.bidder_id);
    }

    if (req.query.status) {
      query.where('status', req.query.status);
    }

    const result = await query.page(page - 1, per_page);

    res.json({
      auction_bids: await AuctionBidPresenter.presentMany(result.results),
      pagination: {
        total: result.total,
        per_page: per_page,
        current_page: page,
        total_pages: Math.ceil(result.total / per_page)
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get single auction bid
router.get('/:id', async (req, res) => {
  try {
    const auctionBid = await AuctionBid.query()
      .findById(req.params.id)
      .withGraphFetched('[bidder, auction]');

    if (!auctionBid) {
      return res.status(404).json({ message: 'Auction bid not found' });
    }

    res.json({ auction_bid: AuctionBidPresenter.present(auctionBid) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create auction bid
router.post('/', async (req, res) => {
  try {
    const newAuctionBid = await AuctionBid.query().insert({
      ...req.body,
      status: req.body.status || AuctionBid.STATUSES.PENDING
    });
    const auctionBid = await AuctionBid.query()
      .findById(newAuctionBid.id)
      .withGraphFetched('[bidder, auction]');

    res.status(201).json({ auction_bid: AuctionBidPresenter.present(auctionBid) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update auction bid
router.patch('/:id', async (req, res) => {
  try {
    const auctionBid = await AuctionBid.query()
      .patchAndFetchById(req.params.id, req.body)
      .withGraphFetched('[bidder, auction]');

    if (!auctionBid) {
      return res.status(404).json({ message: 'Auction bid not found' });
    }

    res.json({ auction_bid: AuctionBidPresenter.present(auctionBid) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete auction bid
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await AuctionBid.query().deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Auction bid not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;