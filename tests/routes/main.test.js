const request = require('supertest');
const app = require('../../src/app');
let server;

describe('Main endpoints', () => {
  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({
        name: 'Tilt API',
        version: '0.0.1',
        status: 'running'
      });
    });
  });
});