const request = require('supertest');
const app = require('../../../src/app');
const UserFactory = require('../../factories/user.factory');
const ItemFactory = require('../../factories/item.factory');
const AuctionFactory = require('../../factories/auction.factory');
const Auction = require('../../../src/app/models/auction');
const { generateTestToken } = require('../../helpers/auth');
const knex = require('../../../src/config/database');

let adminUser;
let adminToken;
let regularUser;
let regularToken;
let item;

beforeAll(async () => {
  adminUser = await UserFactory.createUser({ is_admin: true, jti: '123456' });
  adminToken = generateTestToken(adminUser);
  regularUser = await UserFactory.createUser({ is_admin: false, jti: '123456' });
  regularToken = generateTestToken(regularUser);
  item = await ItemFactory.createItem({ owner_id: regularUser.id });
});

afterAll(() => {
  knex.destroy();
});

describe('Admin Auction Routes', () => {
  describe('GET /admin/auctions', () => {
    it('should list all auctions when authenticated as admin', async () => {
      const auction = await AuctionFactory.createAuction({
        owner_id: regularUser.id,
        item_id: item.id
      });

      const response = await request(app)
        .get('/admin/auctions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.auctions)).toBeTruthy();
      expect(response.body.auctions.some(a => a.id === auction.id)).toBeTruthy();
    });

    it('should filter auctions by owner_id', async () => {
      const auction = await AuctionFactory.createAuction({
        owner_id: regularUser.id,
        item_id: item.id
      });

      const response = await request(app)
        .get(`/admin/auctions?owner_id=${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.auctions)).toBeTruthy();
      expect(response.body.auctions.every(a => a.owner_id === regularUser.id)).toBeTruthy();
    });

    it('should filter auctions by item_id', async () => {
      const auction = await AuctionFactory.createAuction({
        owner_id: regularUser.id,
        item_id: item.id
      });

      const response = await request(app)
        .get(`/admin/auctions?item_id=${item.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.auctions)).toBeTruthy();
      expect(response.body.auctions.every(a => a.item_id === item.id)).toBeTruthy();
    });

    it('should filter auctions by status', async () => {
      const auction = await AuctionFactory.createAuction({
        owner_id: regularUser.id,
        item_id: item.id,
        status: Auction.STATUSES.ACTIVE
      });

      const response = await request(app)
        .get(`/admin/auctions?status=${Auction.STATUSES.ACTIVE}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.auctions)).toBeTruthy();
      expect(response.body.auctions.every(a => a.status === Auction.STATUSES.ACTIVE)).toBeTruthy();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get('/admin/auctions')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/admin/auctions')
        .expect(401);
    });
  });

  describe('GET /admin/auctions/:id', () => {
    let auction;

    beforeEach(async () => {
      auction = await AuctionFactory.createAuction({
        owner_id: regularUser.id,
        item_id: item.id
      });
    });

    it('should show auction details when authenticated as admin', async () => {
      const response = await request(app)
        .get(`/admin/auctions/${auction.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.auction.id).toBe(auction.id);
      expect(response.body.auction.owner_id).toBe(regularUser.id);
      expect(response.body.auction.item_id).toBe(item.id);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get(`/admin/auctions/${auction.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when auction not found', async () => {
      await request(app)
        .get('/admin/auctions/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('POST /admin/auctions', () => {
    let newAuction;

    beforeEach(() => {
      const startDate = new Date();
      startDate.setHours(startDate.getHours() + 1);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 24);

      newAuction = {
        owner_id: regularUser.id,
        item_id: item.id,
        status: Auction.STATUSES.PENDING,
        starting_price: 100.00,
        current_price: 100.00,
        currency: 'USD',
        starts_at: startDate.toISOString(),
        ends_at: endDate.toISOString()
      };
    });

    it('should create an auction when authenticated as admin', async () => {
      const response = await request(app)
        .post('/admin/auctions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newAuction)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.auction.owner_id).toBe(newAuction.owner_id);
      expect(response.body.auction.item_id).toBe(newAuction.item_id);
      expect(response.body.auction.starting_price).toBe(newAuction.starting_price);
      expect(response.body.auction.current_price).toBe(newAuction.current_price);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .post('/admin/auctions')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(newAuction)
        .expect(404);
    });

    it('should return 400 when required fields are missing', async () => {
      delete newAuction.starting_price;
      delete newAuction.current_price;

      await request(app)
        .post('/admin/auctions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newAuction)
        .expect(400);
    });
  });

  describe('PATCH /admin/auctions/:id', () => {
    let auction;
    let updates;

    beforeEach(async () => {
      auction = await AuctionFactory.createAuction({
        owner_id: regularUser.id,
        item_id: item.id
      });

      updates = {
        status: Auction.STATUSES.ACTIVE,
        current_price: 150.00
      };
    });

    it('should update an auction when authenticated as admin', async () => {
      const response = await request(app)
        .patch(`/admin/auctions/${auction.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.auction.status).toBe(updates.status);
      expect(response.body.auction.current_price).toBe(updates.current_price);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .patch(`/admin/auctions/${auction.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send(updates)
        .expect(404);
    });

    it('should return 404 when auction not found', async () => {
      await request(app)
        .patch('/admin/auctions/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect(404);
    });
  });

  describe('DELETE /admin/auctions/:id', () => {
    let auction;

    beforeEach(async () => {
      auction = await AuctionFactory.createAuction({
        owner_id: regularUser.id,
        item_id: item.id
      });
    });

    it('should delete an auction when authenticated as admin', async () => {
      await request(app)
        .delete(`/admin/auctions/${auction.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deletedAuction = await Auction.query().findById(auction.id);
      expect(deletedAuction).toBeUndefined();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .delete(`/admin/auctions/${auction.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when auction not found', async () => {
      await request(app)
        .delete('/admin/auctions/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});