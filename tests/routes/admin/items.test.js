const request = require('supertest');
const app = require('../../../src/app');
const UserFactory = require('../../factories/user.factory');
const CategoryFactory = require('../../factories/category.factory');
const BrandFactory = require('../../factories/brand.factory');
const StyleFactory = require('../../factories/style.factory');
const FootwearSizeFactory = require('../../factories/footwear_size.factory');
const TopSizeFactory = require('../../factories/top_size.factory');
const ItemFactory = require('../../factories/item.factory');
const Item = require('../../../src/app/models/item');
const { generateTestToken } = require('../../helpers/auth');
const knex = require('../../../src/config/database');

let adminUser;
let adminToken;
let regularUser;
let regularToken;
let category;
let brand;
let style;
let footwearSize;
let topSize;

beforeAll(async () => {
  adminUser = await UserFactory.createUser({ is_admin: true, jti: '123456' });
  adminToken = generateTestToken(adminUser);
  regularUser = await UserFactory.createUser({ is_admin: false, jti: '123456' });
  regularToken = generateTestToken(regularUser);
  category = await CategoryFactory.createCategory();
  brand = await BrandFactory.createBrand();
  style = await StyleFactory.createStyle();
  footwearSize = await FootwearSizeFactory.createFootwearSize();
  topSize = await TopSizeFactory.createTopSize();
});

afterAll(() => {
  knex.destroy();
});

describe('Admin Item Routes', () => {
  describe('GET /admin/items', () => {
    it('should list all items when authenticated as admin', async () => {
      const item = await ItemFactory.createItem({
        owner_id: regularUser.id,
        category_id: category.id,
        brand_id: brand.id,
        style_id: style.id
      });

      const response = await request(app)
        .get('/admin/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.items)).toBeTruthy();
      expect(response.body.items.some(i => i.id === item.id)).toBeTruthy();
    });

    it('should filter items by owner_id', async () => {
      const item = await ItemFactory.createItem({
        owner_id: regularUser.id,
        category_id: category.id
      });

      const response = await request(app)
        .get(`/admin/items?owner_id=${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.items)).toBeTruthy();
      expect(response.body.items.every(i => i.owner_id === regularUser.id)).toBeTruthy();
    });

    it('should filter items by category_id', async () => {
      const item = await ItemFactory.createItem({
        owner_id: regularUser.id,
        category_id: category.id
      });

      const response = await request(app)
        .get(`/admin/items?category_id=${category.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.items)).toBeTruthy();
      expect(response.body.items.every(i => i.category_id === category.id)).toBeTruthy();
    });

    it('should filter items by status', async () => {
      const item = await ItemFactory.createItem({
        owner_id: regularUser.id,
        status: Item.STATUSES.AVAILABLE
      });

      const response = await request(app)
        .get(`/admin/items?status=${Item.STATUSES.AVAILABLE}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.items)).toBeTruthy();
      expect(response.body.items.every(i => i.status === Item.STATUSES.AVAILABLE)).toBeTruthy();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get('/admin/items')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/admin/items')
        .expect(401);
    });
  });

  describe('GET /admin/items/:id', () => {
    let item;

    beforeEach(async () => {
      item = await ItemFactory.createItem({
        owner_id: regularUser.id,
        category_id: category.id,
        brand_id: brand.id,
        style_id: style.id
      });
    });

    it('should show item details when authenticated as admin', async () => {
      const response = await request(app)
        .get(`/admin/items/${item.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.item.id).toBe(item.id);
      expect(response.body.item.owner_id).toBe(regularUser.id);
      expect(response.body.item.category_id).toBe(category.id);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get(`/admin/items/${item.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when item not found', async () => {
      await request(app)
        .get('/admin/items/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('POST /admin/items', () => {
    let newItem;

    beforeEach(() => {
      newItem = {
        owner_id: regularUser.id,
        category_id: category.id,
        brand_id: brand.id,
        style_id: style.id,
        name: 'Test Item',
        description: 'Test Description',
        price: 99.99,
        currency: 'USD',
        status: Item.STATUSES.AVAILABLE
      };
    });

    it('should create an item when authenticated as admin', async () => {
      const response = await request(app)
        .post('/admin/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newItem)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.item.name).toBe(newItem.name);
      expect(response.body.item.owner_id).toBe(newItem.owner_id);
      expect(response.body.item.category_id).toBe(newItem.category_id);
      expect(response.body.item.price).toBe(newItem.price);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .post('/admin/items')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(newItem)
        .expect(404);
    });

    it('should return 400 when required fields are missing', async () => {
      delete newItem.name;
      delete newItem.owner_id;

      await request(app)
        .post('/admin/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newItem)
        .expect(400);
    });
  });

  describe('PATCH /admin/items/:id', () => {
    let item;
    let updates;

    beforeEach(async () => {
      item = await ItemFactory.createItem({
        owner_id: regularUser.id,
        category_id: category.id
      });

      updates = {
        name: 'Updated Item Name',
        description: 'Updated Description',
        price: 149.99,
        status: Item.STATUSES.SOLD
      };
    });

    it('should update an item when authenticated as admin', async () => {
      const response = await request(app)
        .patch(`/admin/items/${item.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.item.name).toBe(updates.name);
      expect(response.body.item.description).toBe(updates.description);
      expect(response.body.item.price).toBe(updates.price);
      expect(response.body.item.status).toBe(updates.status);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .patch(`/admin/items/${item.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send(updates)
        .expect(404);
    });

    it('should return 404 when item not found', async () => {
      await request(app)
        .patch('/admin/items/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect(404);
    });
  });

  describe('DELETE /admin/items/:id', () => {
    let item;

    beforeEach(async () => {
      item = await ItemFactory.createItem({
        owner_id: regularUser.id,
        category_id: category.id
      });
    });

    it('should delete an item when authenticated as admin', async () => {
      await request(app)
        .delete(`/admin/items/${item.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deletedItem = await Item.query().findById(item.id);
      expect(deletedItem).toBeUndefined();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .delete(`/admin/items/${item.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when item not found', async () => {
      await request(app)
        .delete('/admin/items/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});