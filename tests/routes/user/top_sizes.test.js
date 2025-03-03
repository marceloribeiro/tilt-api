const request = require('supertest');
const app = require('../../../src/app');
const { UserFactory } = require('../../factories');
const { TopSizeFactory } = require('../../factories');
const { generateTestToken } = require('../../helpers/auth');
const knex = require('../../../src/config/database');

let user;
let token;
let topSize;

beforeAll(async () => {
  user = await UserFactory.createUser({ is_admin: false, jti: '123456' });
  token = generateTestToken(user);
  topSize = await TopSizeFactory.createTopSize();
});

afterAll(() => {
  knex.destroy();
});

describe('Top Size Routes', () => {
  describe('GET /user/top_sizes', () => {
    it('should list all top sizes', async () => {
      const topSize2 = await TopSizeFactory.createTopSize();

      const response = await request(app)
        .get('/user/top_sizes')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.top_sizes[0]).toHaveProperty('id');
      expect(response.body.top_sizes[0]).toHaveProperty('name');
    });
  });

  describe('GET /user/top_sizes/:id', () => {
    it('should get a single top size', async () => {
      const response = await request(app)
        .get(`/user/top_sizes/${topSize.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.top_size.id).toBe(topSize.id);
      expect(response.body.top_size.name).toBe(topSize.name);
    });

    it('should return 404 for non-existent top size', async () => {
      const response = await request(app)
        .get('/user/top_sizes/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Top size not found');
    });
  });

  describe('POST /user/top_sizes/select/:id', () => {
    it('should select a top size for user', async () => {
      const response = await request(app)
        .post(`/user/top_sizes/select/${topSize.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.top_size.id).toBe(topSize.id);

      const userTopSizes = await user.$relatedQuery('top_sizes');
      expect(userTopSizes).toHaveLength(1);
      expect(userTopSizes[0].id).toBe(topSize.id);
    });

    it('should not allow selecting the same top size twice', async () => {
      // First selection
      await request(app)
        .post(`/user/top_sizes/select/${topSize.id}`)
        .set('Authorization', `Bearer ${token}`);

      // Second selection attempt
      const response = await request(app)
        .post(`/user/top_sizes/select/${topSize.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Top size already selected');
    });

    it('should return 404 for non-existent top size', async () => {
      const response = await request(app)
        .post('/user/top_sizes/select/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Top size not found');
    });
  });

  describe('DELETE /user/top_sizes/select/:id', () => {
    it('should unselect a top size for user', async () => {
      // First select the top size
      await request(app)
        .post(`/user/top_sizes/select/${topSize.id}`)
        .set('Authorization', `Bearer ${token}`);

      // Then unselect it
      const response = await request(app)
        .delete(`/user/top_sizes/select/${topSize.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.top_size.id).toBe(topSize.id);

      // Verify the relationship was removed
      const userTopSizes = await user.$relatedQuery('top_sizes');
      expect(userTopSizes).toHaveLength(0);
    });

    it('should return 400 when trying to unselect a non-selected top size', async () => {
      const response = await request(app)
        .delete(`/user/top_sizes/select/${topSize.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Top size was not selected');
    });

    it('should return 404 for non-existent top size', async () => {
      const response = await request(app)
        .delete('/user/top_sizes/select/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Top size not found');
    });
  });
});