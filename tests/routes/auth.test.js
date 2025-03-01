const request = require('supertest');
const app = require('../../src/app');
const UserFactory = require('../factories/user.factory');
const User = require('../../src/app/models/user');
const { generateTestToken } = require('../helpers/auth');
const knex = require('../../src/config/database');

// Mock twilio to avoid sending actual SMS
jest.mock('twilio', () => {
  return jest.fn(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        sid: 'mock-sid',
        status: 'success'
      })
    }
  }));
});

afterAll(() => {
  knex.destroy();
});

describe('Auth endpoints', () => {
  describe('POST /auth/send_confirmation_code', () => {
    it('should send confirmation code to valid phone number', async () => {
      var phoneNumber = '+1234567890';
      await User.query().delete().where('phone_number', phoneNumber);
      await UserFactory.createUser({ phone_number: phoneNumber });

      const response = await request(app)
        .post('/auth/send_confirmation_code')
        .send({ phone_number: phoneNumber })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Confirmation code sent successfully');
    });

    it('should return 400 for invalid phone number format', async () => {
      const response = await request(app)
        .post('/auth/send_confirmation_code')
        .send({ phone_number: '1234567890' }) // Missing + prefix
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.message).toContain('Invalid phone number format');
    });
  });

  describe('POST /auth/signup', () => {
    it('should create a new user', async () => {
      var phoneNumber = '+1234567890';
      await User.query().delete().where('phone_number', phoneNumber);

      const response = await request(app)
        .post('/auth/signup')
        .send({
          phone_number: phoneNumber,
          email: 'test@example.com',
          user_name: 'testuser',
          first_name: 'Test',
          last_name: 'User'
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('phone_number', phoneNumber);
    });

    it('should return 400 if phone_number is missing', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          user_name: 'testuser'
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/login', () => {
    var phoneNumber = '+1234567890';
    var confirmationCode = '123456';

    beforeEach(async () => {
      await User.query().delete().where('phone_number', phoneNumber);
      await UserFactory.createUser({ phone_number: phoneNumber, confirmation_code: confirmationCode });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          phone_number: phoneNumber,
          confirmation_code: confirmationCode
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('phone_number', phoneNumber);
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          phone_number: phoneNumber,
          confirmation_code: 'wrong-code'
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /auth/me', () => {
    it('should return user profile', async () => {
      const user = await UserFactory.createUser({ jti: '123456' });
      const token = generateTestToken(user);

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.user).toHaveProperty('id', user.id);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/auth/me')
        .expect(401);
    });
  });

  describe('PATCH /auth/me/update', () => {
    it('should update user profile when authenticated', async () => {
      const user = await UserFactory.createUser({ jti: '123456' });
      const token = generateTestToken(user);

      const response = await request(app)
        .patch('/auth/me/update')
        .set('Authorization', `Bearer ${token}`)
        .send({
          first_name: 'Updated',
          last_name: 'Name'
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.first_name).toBe('Updated');
      expect(response.body.user.last_name).toBe('Name');
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .patch('/auth/me/update')
        .send({
          first_name: 'Updated'
        })
        .expect(401);
    });
  });

  describe('DELETE /auth/logout', () => {
    it('should logout successfully when authenticated', async () => {
      const user = await UserFactory.createUser({ jti: '123456' });
      const token = generateTestToken(user);

      const response = await request(app)
        .delete('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Successfully logged out');
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .delete('/auth/logout')
        .expect(401);
    });
  });
});
