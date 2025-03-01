const request = require('supertest');
const app = require('../../../src/app');
const UserFactory = require('../../factories/user.factory');
const TopSizeFactory = require('../../factories/top_size.factory');
const TopSize = require('../../../src/app/models/top_size');
const { generateTestToken } = require('../../helpers/auth');
const knex = require('../../../src/config/database');

let server;
let adminUser;
let adminToken;
let regularUser;
let regularToken;

beforeAll(async () => {
  server = app.listen(4000);
  adminUser = await UserFactory.createUser({ is_admin: true, jti: '123456' });
  adminToken = generateTestToken(adminUser);
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

describe('Admin Top Size Routes', () => {
  describe('GET /admin/top-sizes', () => {
    beforeEach(async () => {
      // Create some test top sizes
      await TopSizeFactory.createTopSize();
      await TopSizeFactory.createTopSize();
    });

    it('should list all top sizes when authenticated as admin', async () => {
      const response = await request(app)
        .get('/admin/top-sizes')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.top_sizes)).toBeTruthy();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get('/admin/top-sizes')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/admin/top-sizes')
        .expect(401);
    });
  });

  describe('GET /admin/top-sizes/:id', () => {
    let topSize;

    beforeEach(async () => {
      topSize = await TopSizeFactory.createTopSize();
    });

    it('should show top size details when authenticated as admin', async () => {
      const response = await request(app)
        .get(`/admin/top-sizes/${topSize.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.top_size.id).toBe(topSize.id);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get(`/admin/top-sizes/${topSize.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when top size not found', async () => {
      await request(app)
        .get('/admin/top-sizes/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('POST /admin/top-sizes', () => {
    const newTopSize = { name: 'L' };

    it('should create a top size when authenticated as admin', async () => {
      const response = await request(app)
        .post('/admin/top-sizes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newTopSize)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.top_size.size).toBe(newTopSize.size);
      expect(response.body.top_size.region).toBe(newTopSize.region);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .post('/admin/top-sizes')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(newTopSize)
        .expect(404);
    });

    it('should return 400 when required fields are missing', async () => {
      await request(app)
        .post('/admin/top-sizes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('PUT /admin/top-sizes/:id', () => {
    let topSize;

    beforeEach(async () => {
      topSize = await TopSizeFactory.createTopSize();
    });

    it('should update a top size when authenticated as admin', async () => {
      const updates = { name: 'XL' };

      const response = await request(app)
        .put(`/admin/top-sizes/${topSize.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.top_size.size).toBe(updates.size);
      expect(response.body.top_size.region).toBe(updates.region);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .put(`/admin/top-sizes/${topSize.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ name: 'XXL' })
        .expect(404);
    });

    it('should return 404 when top size not found', async () => {
      await request(app)
        .put('/admin/top-sizes/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'XXL' })
        .expect(404);
    });
  });

  describe('DELETE /admin/top-sizes/:id', () => {
    let topSize;

    beforeEach(async () => {
      topSize = await TopSizeFactory.createTopSize();
    });

    it('should delete a top size when authenticated as admin', async () => {
      await request(app)
        .delete(`/admin/top-sizes/${topSize.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deletedTopSize = await TopSize.query().findById(topSize.id);
      expect(deletedTopSize).toBeUndefined();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .delete(`/admin/top-sizes/${topSize.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when top size not found', async () => {
      await request(app)
        .delete('/admin/top-sizes/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});