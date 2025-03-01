const request = require('supertest');
const app = require('../../../src/app');
const { UserFactory } = require('../../factories');
const { StyleFactory } = require('../../factories');
const { generateTestToken } = require('../../helpers/auth');
const knex = require('../../../src/config/database');

let user;
let token;
let style;

beforeAll(async () => {
  user = await UserFactory.createUser({ is_admin: false, jti: '123456' });
  token = generateTestToken(user);
  style = await StyleFactory.createStyle();
});

afterAll(() => {
  knex.destroy();
});

describe('Style Routes', () => {
  describe('GET /user/styles', () => {
    it('should list all styles', async () => {
      const style2 = await StyleFactory.createStyle();

      const response = await request(app)
        .get('/user/styles')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
    });
  });

  describe('GET /user/styles/:id', () => {
    it('should get a single style', async () => {
      const response = await request(app)
        .get(`/user/styles/${style.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(style.id);
      expect(response.body.name).toBe(style.name);
    });

    it('should return 404 for non-existent style', async () => {
      const response = await request(app)
        .get('/user/styles/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Style not found');
    });
  });

  describe('POST /user/styles/select/:id', () => {
    it('should select a style for user', async () => {
      const response = await request(app)
        .post(`/user/styles/select/${style.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(style.id);

      const userStyles = await user.$relatedQuery('styles');
      expect(userStyles).toHaveLength(1);
      expect(userStyles[0].id).toBe(style.id);
    });

    it('should not allow selecting the same style twice', async () => {
      // First selection
      await request(app)
        .post(`/user/styles/select/${style.id}`)
        .set('Authorization', `Bearer ${token}`);

      // Second selection attempt
      const response = await request(app)
        .post(`/user/styles/select/${style.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Style already selected');
    });

    it('should return 404 for non-existent style', async () => {
      const response = await request(app)
        .post('/user/styles/select/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Style not found');
    });
  });

  describe('DELETE /user/styles/select/:id', () => {
    it('should unselect a style for user', async () => {
      // First select the style
      await request(app)
        .post(`/user/styles/select/${style.id}`)
        .set('Authorization', `Bearer ${token}`);

      // Then unselect it
      const response = await request(app)
        .delete(`/user/styles/select/${style.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(style.id);

      // Verify the relationship was removed
      const userStyles = await user.$relatedQuery('styles');
      expect(userStyles).toHaveLength(0);
    });

    it('should return 400 when trying to unselect a non-selected style', async () => {
      const response = await request(app)
        .delete(`/user/styles/select/${style.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Style was not selected');
    });

    it('should return 404 for non-existent style', async () => {
      const response = await request(app)
        .delete('/user/styles/select/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Style not found');
    });
  });
});