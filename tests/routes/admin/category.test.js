const request = require('supertest');
const app = require('../../../src/app');
const UserFactory = require('../../factories/user.factory');
const CategoryFactory = require('../../factories/category.factory');
const Category = require('../../../src/app/models/category');
const { generateTestToken } = require('../../helpers/auth');
const knex = require('../../../src/config/database');

let server;
let adminUser;
let adminToken;
let regularUser;
let regularToken;

beforeAll(async () => {
  server = app.listen(4000);
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

describe('Admin Category Routes', () => {
  describe('GET /admin/categories', () => {
    beforeEach(async () => {
      // Create some test categories
      await CategoryFactory.createCategory();
      await CategoryFactory.createCategory();
    });

    it('should list all categories when authenticated as admin', async () => {
      const response = await request(app)
        .get('/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.categories)).toBeTruthy();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get('/admin/categories')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/admin/categories')
        .expect(401);
    });
  });

  describe('GET /admin/categories/:id', () => {
    let category;

    beforeEach(async () => {
      category = await CategoryFactory.createCategory();
    });

    it('should show category details when authenticated as admin', async () => {
      const response = await request(app)
        .get(`/admin/categories/${category.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.category.id).toBe(category.id);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get(`/admin/categories/${category.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when category not found', async () => {
      await request(app)
        .get('/admin/categories/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('POST /admin/categories', () => {
    const newCategory = {
      name: 'New Category'
    };

    it('should create a category when authenticated as admin', async () => {
      const response = await request(app)
        .post('/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newCategory)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.category.name).toBe(newCategory.name);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .post('/admin/categories')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(newCategory)
        .expect(404);
    });

    it('should return 400 when required fields are missing', async () => {
      await request(app)
        .post('/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('PUT /admin/categories/:id', () => {
    let category;

    beforeEach(async () => {
      category = await CategoryFactory.createCategory();
    });

    it('should update a category when authenticated as admin', async () => {
      const updates = {
        name: 'Updated Category'
      };

      const response = await request(app)
        .put(`/admin/categories/${category.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.category.name).toBe(updates.name);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .put(`/admin/categories/${category.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ name: 'Updated Category' })
        .expect(404);
    });

    it('should return 404 when category not found', async () => {
      await request(app)
        .put('/admin/categories/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Category' })
        .expect(404);
    });
  });

  describe('DELETE /admin/categories/:id', () => {
    let category;

    beforeEach(async () => {
      category = await CategoryFactory.createCategory();
    });

    it('should delete a category when authenticated as admin', async () => {
      await request(app)
        .delete(`/admin/categories/${category.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      // Verify category is deleted
      const deletedCategory = await Category.query().findById(category.id);
      expect(deletedCategory).toBeUndefined();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .delete(`/admin/categories/${category.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when category not found', async () => {
      await request(app)
        .delete('/admin/categories/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});