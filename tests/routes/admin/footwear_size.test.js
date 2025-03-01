const request = require('supertest');
const app = require('../../../src/app');
const UserFactory = require('../../factories/user.factory');
const FootwearSizeFactory = require('../../factories/footwear_size.factory');
const FootwearSize = require('../../../src/app/models/footwear_size');
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

describe('Admin Footwear Size Routes', () => {
  describe('GET /admin/footwear-sizes', () => {
    beforeEach(async () => {
      // Create some test footwear sizes
      await FootwearSizeFactory.createFootwearSize();
      await FootwearSizeFactory.createFootwearSize();
    });

    it('should list all footwear sizes when authenticated as admin', async () => {
      const response = await request(app)
        .get('/admin/footwear-sizes')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(Array.isArray(response.body.footwear_sizes)).toBeTruthy();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get('/admin/footwear-sizes')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/admin/footwear-sizes')
        .expect(401);
    });
  });

  describe('GET /admin/footwear-sizes/:id', () => {
    let footwearSize;

    beforeEach(async () => {
      footwearSize = await FootwearSizeFactory.createFootwearSize();
    });

    it('should show footwear size details when authenticated as admin', async () => {
      const response = await request(app)
        .get(`/admin/footwear-sizes/${footwearSize.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.footwear_size.id).toBe(footwearSize.id);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get(`/admin/footwear-sizes/${footwearSize.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when footwear size not found', async () => {
      await request(app)
        .get('/admin/footwear-sizes/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('POST /admin/footwear-sizes', () => {
    const newFootwearSize = { name: '43' };

    it('should create a footwear size when authenticated as admin', async () => {
      const response = await request(app)
        .post('/admin/footwear-sizes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newFootwearSize)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.footwear_size.size).toBe(newFootwearSize.size);
      expect(response.body.footwear_size.region).toBe(newFootwearSize.region);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .post('/admin/footwear-sizes')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(newFootwearSize)
        .expect(404);
    });

    it('should return 400 when required fields are missing', async () => {
      await request(app)
        .post('/admin/footwear-sizes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('PUT /admin/footwear-sizes/:id', () => {
    let footwearSize;

    beforeEach(async () => {
      footwearSize = await FootwearSizeFactory.createFootwearSize();
    });

    it('should update a footwear size when authenticated as admin', async () => {
      const updates = { name: '44' };

      const response = await request(app)
        .put(`/admin/footwear-sizes/${footwearSize.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.footwear_size.size).toBe(updates.size);
      expect(response.body.footwear_size.region).toBe(updates.region);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .put(`/admin/footwear-sizes/${footwearSize.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ size: '45' })
        .expect(404);
    });

    it('should return 404 when footwear size not found', async () => {
      await request(app)
        .put('/admin/footwear-sizes/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '45' })
        .expect(404);
    });
  });

  describe('DELETE /admin/footwear-sizes/:id', () => {
    let footwearSize;

    beforeEach(async () => {
      footwearSize = await FootwearSizeFactory.createFootwearSize();
    });

    it('should delete a footwear size when authenticated as admin', async () => {
      await request(app)
        .delete(`/admin/footwear-sizes/${footwearSize.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deletedFootwearSize = await FootwearSize.query().findById(footwearSize.id);
      expect(deletedFootwearSize).toBeUndefined();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .delete(`/admin/footwear-sizes/${footwearSize.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when footwear size not found', async () => {
      await request(app)
        .delete('/admin/footwear-sizes/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});