const request = require('supertest');
const app = require('../../../src/app');
const { UserFactory } = require('../../factories');
const { CategoryFactory } = require('../../factories');
const { generateTestToken } = require('../../helpers/auth');
const knex = require('../../../src/config/database');

let user;
let token;
let category;

beforeAll(async () => {
  user = await UserFactory.createUser({ is_admin: false, jti: '123456' });
  token = generateTestToken(user);
  category = await CategoryFactory.createCategory();
});

afterAll(() => {
  knex.destroy();
});

describe('Category Routes', () => {
  describe('GET /user/categories', () => {
    it('should list all categories', async () => {
      const category2 = await CategoryFactory.createCategory();

      const response = await request(app)
        .get('/user/categories')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
    });
  });

  describe('GET /user/categories/:id', () => {
    it('should get a single category', async () => {
      const response = await request(app)
        .get(`/user/categories/${category.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(category.id);
      expect(response.body.name).toBe(category.name);
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .get('/user/categories/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Category not found');
    });
  });

  describe('POST /user/categories/select/:id', () => {
    it('should select a category for user', async () => {
      const response = await request(app)
        .post(`/user/categories/select/${category.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(category.id);

      const userCategories = await user.$relatedQuery('categories');
      expect(userCategories).toHaveLength(1);
      expect(userCategories[0].id).toBe(category.id);
    });

    it('should not allow selecting the same category twice', async () => {
      // First selection
      await request(app)
        .post(`/user/categories/select/${category.id}`)
        .set('Authorization', `Bearer ${token}`);

      // Second selection attempt
      const response = await request(app)
        .post(`/user/categories/select/${category.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Category already selected');
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .post('/user/categories/select/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Category not found');
    });
  });

  describe('DELETE /user/categories/select/:id', () => {
    it('should unselect a category for user', async () => {
      // First select the category
      await request(app)
        .post(`/user/categories/select/${category.id}`)
        .set('Authorization', `Bearer ${token}`);

      // Then unselect it
      const response = await request(app)
        .delete(`/user/categories/select/${category.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(category.id);

      // Verify the relationship was removed
      const userCategories = await user.$relatedQuery('categories');
      expect(userCategories).toHaveLength(0);
    });

    it('should return 400 when trying to unselect a non-selected category', async () => {
      const response = await request(app)
        .delete(`/user/categories/select/${category.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Category was not selected');
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .delete('/user/categories/select/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Category not found');
    });
  });
});
