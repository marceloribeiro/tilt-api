const request = require('supertest');
const app = require('../../../src/app');
const { UserFactory } = require('../../factories');
const { FootwearSizeFactory } = require('../../factories');
const { generateTestToken } = require('../../helpers/auth');
const knex = require('../../../src/config/database');

let user;
let token;
let footwearSize;

beforeAll(async () => {
  user = await UserFactory.createUser({ is_admin: false, jti: '123456' });
  token = generateTestToken(user);
  footwearSize = await FootwearSizeFactory.createFootwearSize();
});

afterAll(() => {
  knex.destroy();
});

describe('Footwear Size Routes', () => {
  describe('GET /user/footwear-sizes', () => {
    it('should list all footwear sizes', async () => {
      const footwearSize2 = await FootwearSizeFactory.createFootwearSize();

      const response = await request(app)
        .get('/user/footwear-sizes')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
    });
  });

  describe('GET /user/footwear-sizes/:id', () => {
    it('should get a single footwear size', async () => {
      const response = await request(app)
        .get(`/user/footwear-sizes/${footwearSize.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(footwearSize.id);
      expect(response.body.name).toBe(footwearSize.name);
    });

    it('should return 404 for non-existent footwear size', async () => {
      const response = await request(app)
        .get('/user/footwear-sizes/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Footwear size not found');
    });
  });

  describe('POST /user/footwear-sizes/select/:id', () => {
    it('should select a footwear size for user', async () => {
      const response = await request(app)
        .post(`/user/footwear-sizes/select/${footwearSize.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(footwearSize.id);

      const userFootwearSizes = await user.$relatedQuery('footwear_sizes');
      expect(userFootwearSizes).toHaveLength(1);
      expect(userFootwearSizes[0].id).toBe(footwearSize.id);
    });

    it('should not allow selecting the same footwear size twice', async () => {
      // First selection
      await request(app)
        .post(`/user/footwear-sizes/select/${footwearSize.id}`)
        .set('Authorization', `Bearer ${token}`);

      // Second selection attempt
      const response = await request(app)
        .post(`/user/footwear-sizes/select/${footwearSize.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Footwear size already selected');
    });

    it('should return 404 for non-existent footwear size', async () => {
      const response = await request(app)
        .post('/user/footwear-sizes/select/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Footwear size not found');
    });
  });

  describe('DELETE /user/footwear-sizes/select/:id', () => {
    it('should unselect a footwear size for user', async () => {
      // First select the footwear size
      await request(app)
        .post(`/user/footwear-sizes/select/${footwearSize.id}`)
        .set('Authorization', `Bearer ${token}`);

      // Then unselect it
      const response = await request(app)
        .delete(`/user/footwear-sizes/select/${footwearSize.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(footwearSize.id);

      // Verify the relationship was removed
      const userFootwearSizes = await user.$relatedQuery('footwear_sizes');
      expect(userFootwearSizes).toHaveLength(0);
    });

    it('should return 400 when trying to unselect a non-selected footwear size', async () => {
      const response = await request(app)
        .delete(`/user/footwear-sizes/select/${footwearSize.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Footwear size was not selected');
    });

    it('should return 404 for non-existent footwear size', async () => {
      const response = await request(app)
        .delete('/user/footwear-sizes/select/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Footwear size not found');
    });
  });
});