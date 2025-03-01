const request = require('supertest');
const app = require('../../../src/app');
const UserFactory = require('../../factories/user.factory');
const StyleFactory = require('../../factories/style.factory');
const Style = require('../../../src/app/models/style');
const { generateTestToken } = require('../../helpers/auth');
const knex = require('../../../src/config/database');

let server;
let adminUser;
let adminToken;
let regularUser;
let regularToken;

beforeAll(async () => {
  server = app.listen(4006);
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

describe('Admin Style Routes', () => {
  describe('GET /admin/styles', () => {
    beforeEach(async () => {
      // Create some test styles
      await StyleFactory.createStyle();
      await StyleFactory.createStyle();
    });

    it('should list all styles when authenticated as admin', async () => {
      const response = await request(app)
        .get('/admin/styles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.styles)).toBeTruthy();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get('/admin/styles')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/admin/styles')
        .expect(401);
    });
  });

  describe('GET /admin/styles/:id', () => {
    let style;

    beforeEach(async () => {
      style = await StyleFactory.createStyle();
    });

    it('should show style details when authenticated as admin', async () => {
      const response = await request(app)
        .get(`/admin/styles/${style.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.style.id).toBe(style.id);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get(`/admin/styles/${style.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when style not found', async () => {
      await request(app)
        .get('/admin/styles/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('POST /admin/styles', () => {
    const newStyle = { name: 'New Style' };

    it('should create a style when authenticated as admin', async () => {
      const response = await request(app)
        .post('/admin/styles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newStyle)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.style.name).toBe(newStyle.name);
      expect(response.body.style.description).toBe(newStyle.description);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .post('/admin/styles')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(newStyle)
        .expect(404);
    });

    it('should return 400 when required fields are missing', async () => {
      await request(app)
        .post('/admin/styles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('PUT /admin/styles/:id', () => {
    let style;

    beforeEach(async () => {
      style = await StyleFactory.createStyle();
    });

    it('should update a style when authenticated as admin', async () => {
      const updates = { name: 'Updated Style' };

      const response = await request(app)
        .put(`/admin/styles/${style.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.style.name).toBe(updates.name);
      expect(response.body.style.description).toBe(updates.description);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .put(`/admin/styles/${style.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ name: 'Updated Style' })
        .expect(404);
    });

    it('should return 404 when style not found', async () => {
      await request(app)
        .put('/admin/styles/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Style' })
        .expect(404);
    });
  });

  describe('DELETE /admin/styles/:id', () => {
    let style;

    beforeEach(async () => {
      style = await StyleFactory.createStyle();
    });

    it('should delete a style when authenticated as admin', async () => {
      await request(app)
        .delete(`/admin/styles/${style.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deletedStyle = await Style.query().findById(style.id);
      expect(deletedStyle).toBeUndefined();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .delete(`/admin/styles/${style.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when style not found', async () => {
      await request(app)
        .delete('/admin/styles/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});