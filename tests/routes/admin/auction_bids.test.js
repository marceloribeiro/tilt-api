const request = require('supertest');
const app = require('../../../src/app');
const UserFactory = require('../../factories/user.factory');
const ItemFactory = require('../../factories/item.factory');
const AuctionFactory = require('../../factories/auction.factory');
const AuctionBidFactory = require('../../factories/auction_bid.factory');
const AuctionBid = require('../../../src/app/models/auction_bid');
const { generateTestToken } = require('../../helpers/auth');
const knex = require('../../../src/config/database');

let adminUser;
let adminToken;
let regularUser;
let regularToken;
let item;
let auction;

beforeAll(async () => {
  adminUser = await UserFactory.createUser({ is_admin: true, jti: '123456' });
  adminToken = generateTestToken(adminUser);
  regularUser = await UserFactory.createUser({ is_admin: false, jti: '123456' });
  regularToken = generateTestToken(regularUser);
  item = await ItemFactory.createItem({ owner_id: regularUser.id });
  auction = await AuctionFactory.createAuction({
    owner_id: regularUser.id,
    item_id: item.id
  });
});

afterAll(() => {
  knex.destroy();
});

describe('Admin Auction Bid Routes', () => {
  describe('GET /admin/auction_bids', () => {
    it('should list all auction bids when authenticated as admin', async () => {
      const auctionBid = await AuctionBidFactory.createAuctionBid({
        auction_id: auction.id,
        bidder_id: regularUser.id
      });

      const response = await request(app)
        .get('/admin/auction_bids')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.auction_bids)).toBeTruthy();
      expect(response.body.auction_bids.some(b => b.id === auctionBid.id)).toBeTruthy();
    });

    it('should filter auction bids by auction_id', async () => {
      const auctionBid = await AuctionBidFactory.createAuctionBid({
        auction_id: auction.id,
        bidder_id: regularUser.id
      });

      const response = await request(app)
        .get(`/admin/auction_bids?auction_id=${auction.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.auction_bids)).toBeTruthy();
      expect(response.body.auction_bids.every(b => b.auction_id === auction.id)).toBeTruthy();
    });

    it('should filter auction bids by bidder_id', async () => {
      const auctionBid = await AuctionBidFactory.createAuctionBid({
        auction_id: auction.id,
        bidder_id: regularUser.id
      });

      const response = await request(app)
        .get(`/admin/auction_bids?bidder_id=${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.auction_bids)).toBeTruthy();
      expect(response.body.auction_bids.every(b => b.bidder_id === regularUser.id)).toBeTruthy();
    });

    it('should filter auction bids by status', async () => {
      const auctionBid = await AuctionBidFactory.createAuctionBid({
        auction_id: auction.id,
        bidder_id: regularUser.id,
        status: AuctionBid.STATUSES.PENDING
      });

      const response = await request(app)
        .get(`/admin/auction_bids?status=${AuctionBid.STATUSES.PENDING}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.auction_bids)).toBeTruthy();
      expect(response.body.auction_bids.every(b => b.status === AuctionBid.STATUSES.PENDING)).toBeTruthy();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get('/admin/auction_bids')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/admin/auction_bids')
        .expect(401);
    });
  });

  describe('GET /admin/auction_bids/:id', () => {
    let auctionBid;

    beforeEach(async () => {
      auctionBid = await AuctionBidFactory.createAuctionBid({
        auction_id: auction.id,
        bidder_id: regularUser.id
      });
    });

    it('should show auction bid details when authenticated as admin', async () => {
      const response = await request(app)
        .get(`/admin/auction_bids/${auctionBid.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.auction_bid.id).toBe(auctionBid.id);
      expect(response.body.auction_bid.auction_id).toBe(auction.id);
      expect(response.body.auction_bid.bidder_id).toBe(regularUser.id);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get(`/admin/auction_bids/${auctionBid.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when auction bid not found', async () => {
      await request(app)
        .get('/admin/auction_bids/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('POST /admin/auction_bids', () => {
    let newAuctionBid;

    beforeEach(() => {
      newAuctionBid = {
        auction_id: auction.id,
        bidder_id: regularUser.id,
        status: AuctionBid.STATUSES.PENDING,
        amount: 1000.00,
        currency: 'USD'
      };
    });

    it('should create an auction bid when authenticated as admin', async () => {
      const response = await request(app)
        .post('/admin/auction_bids')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newAuctionBid)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.auction_bid.auction_id).toBe(newAuctionBid.auction_id);
      expect(response.body.auction_bid.bidder_id).toBe(newAuctionBid.bidder_id);
      expect(response.body.auction_bid.amount).toBe(newAuctionBid.amount);
      expect(response.body.auction_bid.currency).toBe(newAuctionBid.currency);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .post('/admin/auction_bids')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(newAuctionBid)
        .expect(404);
    });

    it('should return 400 when required fields are missing', async () => {
      delete newAuctionBid.amount;
      delete newAuctionBid.currency;

      await request(app)
        .post('/admin/auction_bids')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newAuctionBid)
        .expect(400);
    });
  });

  describe('PATCH /admin/auction_bids/:id', () => {
    let auctionBid;
    let updates;

    beforeEach(async () => {
      auctionBid = await AuctionBidFactory.createAuctionBid({
        auction_id: auction.id,
        bidder_id: regularUser.id
      });

      updates = {
        status: AuctionBid.STATUSES.ACCEPTED,
        amount: 1500.00
      };
    });

    it('should update an auction bid when authenticated as admin', async () => {
      const response = await request(app)
        .patch(`/admin/auction_bids/${auctionBid.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.auction_bid.status).toBe(updates.status);
      expect(response.body.auction_bid.amount).toBe(updates.amount);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .patch(`/admin/auction_bids/${auctionBid.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send(updates)
        .expect(404);
    });

    it('should return 404 when auction bid not found', async () => {
      await request(app)
        .patch('/admin/auction_bids/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect(404);
    });
  });

  describe('DELETE /admin/auction_bids/:id', () => {
    let auctionBid;

    beforeEach(async () => {
      auctionBid = await AuctionBidFactory.createAuctionBid({
        auction_id: auction.id,
        bidder_id: regularUser.id
      });
    });

    it('should delete an auction bid when authenticated as admin', async () => {
      await request(app)
        .delete(`/admin/auction_bids/${auctionBid.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deletedAuctionBid = await AuctionBid.query().findById(auctionBid.id);
      expect(deletedAuctionBid).toBeUndefined();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .delete(`/admin/auction_bids/${auctionBid.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when auction bid not found', async () => {
      await request(app)
        .delete('/admin/auction_bids/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});