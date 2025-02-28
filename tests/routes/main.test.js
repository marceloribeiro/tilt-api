const request = require('supertest');
const app = require('../../src/app');
let server;

// Add beforeAll and afterAll hooks
beforeAll(() => {
  server = app.listen(4000); // Use a different port than your main app
});

afterAll((done) => {
  server.close(done);
});

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