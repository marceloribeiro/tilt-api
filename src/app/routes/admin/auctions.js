/**
 * @swagger
 * /admin/auctions:
 *   get:
 *     summary: List all auctions
 *     tags: [Admin Auctions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: owner_id
 *         schema:
 *           type: integer
 *         description: Filter auctions by owner ID
 *       - in: query
 *         name: item_id
 *         schema:
 *           type: integer
 *         description: Filter auctions by item ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter auctions by status (pending, active, completed, cancelled)
 *     responses:
 *       200:
 *         description: List of all auctions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Auction'
 *                   - type: object
 *                     properties:
 *                       owner:
 *                         $ref: '#/components/schemas/User'
 *                       item:
 *                         $ref: '#/components/schemas/Item'
 *                       highestBid:
 *                         $ref: '#/components/schemas/AuctionBid'
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     summary: Create a new auction
 *     tags: [Admin Auctions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - owner_id
 *               - item_id
 *               - status
 *               - starting_price
 *               - current_price
 *               - currency
 *             properties:
 *               owner_id:
 *                 type: integer
 *               item_id:
 *                 type: integer
 *               highest_auction_bid_id:
 *                 type: integer
 *                 nullable: true
 *               status:
 *                 type: string
 *                 enum: [pending, active, completed, cancelled]
 *               starting_price:
 *                 type: number
 *               current_price:
 *                 type: number
 *               currency:
 *                 type: string
 *                 maxLength: 255
 *               starts_at:
 *                 type: string
 *                 format: date-time
 *               ends_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Auction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Auction'
 *                 - type: object
 *                   properties:
 *                     owner:
 *                       $ref: '#/components/schemas/User'
 *                     item:
 *                       $ref: '#/components/schemas/Item'
 *                     highestBid:
 *                       $ref: '#/components/schemas/AuctionBid'
 *       400:
 *         description: Invalid input
 *
 * /admin/auctions/{id}:
 *   get:
 *     summary: Get a specific auction
 *     tags: [Admin Auctions]
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
 *         description: Auction details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Auction'
 *                 - type: object
 *                   properties:
 *                     owner:
 *                       $ref: '#/components/schemas/User'
 *                     item:
 *                       $ref: '#/components/schemas/Item'
 *                     highestBid:
 *                       $ref: '#/components/schemas/AuctionBid'
 *       404:
 *         description: Auction not found
 *
 *   patch:
 *     summary: Update an auction
 *     tags: [Admin Auctions]
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
 *                 enum: [pending, active, completed, cancelled]
 *               current_price:
 *                 type: number
 *               highest_auction_bid_id:
 *                 type: integer
 *                 nullable: true
 *               starts_at:
 *                 type: string
 *                 format: date-time
 *               ends_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Auction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Auction'
 *                 - type: object
 *                   properties:
 *                     owner:
 *                       $ref: '#/components/schemas/User'
 *                     item:
 *                       $ref: '#/components/schemas/Item'
 *                     highestBid:
 *                       $ref: '#/components/schemas/AuctionBid'
 *       404:
 *         description: Auction not found
 *
 *   delete:
 *     summary: Delete an auction
 *     tags: [Admin Auctions]
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
 *         description: Auction deleted successfully
 *       404:
 *         description: Auction not found
 */

const express = require('express');
const router = express.Router();
const Auction = require('../../models/auction');
const AuctionPresenter = require('../../presenters/auction_presenter');

// List all auctions
router.get('/', async (req, res) => {
  try {
    const query = Auction.query().withGraphFetched('[owner, item, highestBid]');

    if (req.query.owner_id) {
      query.where('owner_id', req.query.owner_id);
    }

    if (req.query.item_id) {
      query.where('item_id', req.query.item_id);
    }

    if (req.query.status) {
      query.where('status', req.query.status);
    }

    const auctions = await query;
    res.json({ auctions: await AuctionPresenter.presentMany(auctions) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get single auction
router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.query()
      .findById(req.params.id)
      .withGraphFetched('[owner, item, highestBid]');

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    res.json({ auction: AuctionPresenter.present(auction) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create auction
router.post('/', async (req, res) => {
  try {
    const newAuction = await Auction.query().insert({
      ...req.body,
      status: req.body.status || Auction.STATUSES.PENDING
    });
    const auction = await Auction.query()
      .findById(newAuction.id)
      .withGraphFetched('[owner, item, highestBid]');

    res.status(201).json({ auction: AuctionPresenter.present(auction) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update auction
router.patch('/:id', async (req, res) => {
  try {
    const auction = await Auction.query()
      .patchAndFetchById(req.params.id, req.body)
      .withGraphFetched('[owner, item, highestBid]');

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    res.json({ auction: AuctionPresenter.present(auction) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete auction
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Auction.query().deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;