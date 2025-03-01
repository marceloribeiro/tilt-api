const request = require('supertest');
const app = require('../../../src/app');
const { UserFactory } = require('../../factories');
const { BrandFactory } = require('../../factories');
const { generateTestToken } = require('../../helpers/auth');
const knex = require('../../../src/config/database');

let server;
let user;
let token;
let brand;

beforeAll(async () => {
  server = app.listen(4000);
  user = await UserFactory.createUser({ is_admin: false, jti: '123456' });
  token = generateTestToken(user);
  brand = await BrandFactory.createBrand();
});

afterAll(async () => {
  await new Promise((resolve) => {
    server.close(() => {
      resolve();
    });
  });
  await knex.destroy();
});

describe('Brand Routes', () => {
  describe('GET /user/brands', () => {
    it('should list all brands', async () => {
      const brand2 = await BrandFactory.createBrand();

      const response = await request(app)
        .get('/user/brands')
        .set('Authorization',  `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.brands[0]).toHaveProperty('id');
      expect(response.body.brands[0]).toHaveProperty('name');
    });
  });

  describe('GET /user/brands/:id', () => {
    it('should get a single brand', async () => {
      const response = await request(app)
        .get(`/user/brands/${brand.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.brand.id).toBe(brand.id);
      expect(response.body.brand.name).toBe(brand.name);
    });

    it('should return 404 for non-existent brand', async () => {
      const response = await request(app)
        .get('/user/brands/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Brand not found');
    });
  });

  describe('POST /user/brands/select/:id', () => {
    it('should select a brand for user', async () => {
      const response = await request(app)
        .post(`/user/brands/select/${brand.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.brand.id).toBe(brand.id);

      const userBrands = await user.$relatedQuery('brands');
      expect(userBrands).toHaveLength(1);
      expect(userBrands[0].id).toBe(brand.id);
    });

    it('should not allow selecting the same brand twice', async () => {
      // First selection
      await request(app)
        .post(`/user/brands/select/${brand.id}`)
        .set('Authorization', `Bearer ${token}`);

      // Second selection attempt
      const response = await request(app)
        .post(`/user/brands/select/${brand.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Brand already selected');
    });

    it('should return 404 for non-existent brand', async () => {
      const response = await request(app)
        .post('/user/brands/select/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Brand not found');
    });
  });

  describe('DELETE /user/brands/select/:id', () => {
    it('should unselect a brand for user', async () => {
      // First select the brand
      await request(app)
        .post(`/user/brands/select/${brand.id}`)
        .set('Authorization', `Bearer ${token}`);

      // Then unselect it
      const response = await request(app)
        .delete(`/user/brands/select/${brand.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.brand.id).toBe(brand.id);

      // Verify the relationship was removed
      const userBrands = await user.$relatedQuery('brands');
      expect(userBrands).toHaveLength(0);
    });

    it('should return 400 when trying to unselect a non-selected brand', async () => {
      const response = await request(app)
        .delete(`/user/brands/select/${brand.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Brand was not selected');
    });

    it('should return 404 for non-existent brand', async () => {
      const response = await request(app)
        .delete('/user/brands/select/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Brand not found');
    });
  });
});
