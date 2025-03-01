const request = require('supertest');
const app = require('../../../src/app');
const UserFactory = require('../../factories/user.factory');
const Brand = require('../../../src/app/models/brand');
const { generateTestToken } = require('../../helpers/auth');
const knex = require('../../../src/config/database');

let server;
let adminUser;
let adminToken;
let regularUser;
let regularToken;

beforeAll(async () => {
  server = app.listen(4002);
  // Create admin user
  adminUser = await UserFactory.createUser({ is_admin: true, jti: '123456' });
  adminToken = generateTestToken(adminUser);
  // Create regular user
  regularUser = await UserFactory.createUser({ is_admin: false, jti: '123456' });
  regularToken = generateTestToken(regularUser);
});

afterAll(async () => {
  await new Promise((resolve) => {
    server.close(() => {
      resolve();
    });
  });
  await knex.destroy();
});

describe('Admin Brand Routes', () => {
  describe('GET /admin/brands', () => {
    it('should list all brands when authenticated as admin', async () => {
      const response = await request(app)
        .get('/admin/brands')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.brands)).toBeTruthy();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get('/admin/brands')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/admin/brands')
        .expect(401);
    });
  });

  describe('GET /admin/brands/:id', () => {
    let brand;

    beforeEach(async () => {
      brand = await Brand.query().insert({
        name: 'Test Brand'
      });
    });

    it('should show brand details when authenticated as admin', async () => {
      const response = await request(app)
        .get(`/admin/brands/${brand.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.brand.id).toBe(brand.id);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get(`/admin/brands/${brand.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when brand not found', async () => {
      await request(app)
        .get('/admin/brands/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('POST /admin/brands', () => {
    const newBrand = {
      name: 'New Brand'
    };

    it('should create a brand when authenticated as admin', async () => {
      const response = await request(app)
        .post('/admin/brands')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newBrand)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.brand.name).toBe(newBrand.name);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .post('/admin/brands')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(newBrand)
        .expect(404);
    });

    it('should return 400 when required fields are missing', async () => {
      await request(app)
        .post('/admin/brands')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('PUT /admin/brands/:id', () => {
    let brand;

    beforeEach(async () => {
      brand = await Brand.query().insert({
        name: 'Test Brand'
      });
    });

    it('should update a brand when authenticated as admin', async () => {
      const updates = {
        name: 'Updated Brand'
      };

      const response = await request(app)
        .put(`/admin/brands/${brand.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.brand.name).toBe(updates.name);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .put(`/admin/brands/${brand.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ name: 'Updated Brand' })
        .expect(404);
    });

    it('should return 404 when brand not found', async () => {
      await request(app)
        .put('/admin/brands/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Brand' })
        .expect(404);
    });
  });

  describe('DELETE /admin/brands/:id', () => {
    let brand;

    beforeEach(async () => {
      brand = await Brand.query().insert({
        name: 'Test Brand',
      });
    });

    it('should delete a brand when authenticated as admin', async () => {
      await request(app)
        .delete(`/admin/brands/${brand.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      // Verify brand is deleted
      const deletedBrand = await Brand.query().findById(brand.id);
      expect(deletedBrand).toBeUndefined();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .delete(`/admin/brands/${brand.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when brand not found', async () => {
      await request(app)
        .delete('/admin/brands/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});