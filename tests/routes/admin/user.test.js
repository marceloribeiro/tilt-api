const request = require('supertest');
const app = require('../../../src/app');
const UserFactory = require('../../factories/user.factory');
const User = require('../../../src/app/models/user');
const { generateTestToken } = require('../../helpers/auth');
const knex = require('../../../src/config/database');
const { faker } = require('@faker-js/faker');
let server;
let adminUser;
let adminToken;
let regularUser;
let regularToken;

beforeAll(async () => {
  server = app.listen(4000);
  await User.query().delete();
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

describe('Admin User Routes', () => {
  describe('GET /admin/users', () => {
    it('should list all users when authenticated as admin', async () => {
      const response = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(Array.isArray(response.body.users)).toBeTruthy();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/admin/users')
        .expect(401);
    });
  });

  describe('GET /admin/users/:id', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await UserFactory.createUser({
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        user_name: 'testuser'
      });
    });

    it('should show user details when authenticated as admin', async () => {
      const response = await request(app)
        .get(`/admin/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.user.id).toBe(testUser.id);
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.phone_number).toBe(testUser.phone_number);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get(`/admin/users/${testUser.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when user not found', async () => {
      await request(app)
        .get('/admin/users/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('POST /admin/users', () => {
    const newUser = {
      email: 'new@example.com',
      first_name: 'New',
      last_name: 'User',
      user_name: 'newuser',
      is_admin: false,
      phone_number: faker.phone.number('+1##########')
    };

    it('should create a user when authenticated as admin', async () => {
      const response = await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.user.email).toBe(newUser.email);
      expect(response.body.user.phone_number).toBe(newUser.phone_number);
      expect(response.body.user.user_name).toBe(newUser.user_name);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(newUser)
        .expect(404);
    });

    it('should return 400 when required fields are missing', async () => {
      await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });

    it('should return 400 when email is already taken', async () => {
      // First create a user
      await UserFactory.createUser({ email: 'taken@example.com' });

      // Try to create another user with the same email
      await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...newUser,
          email: 'taken@example.com'
        })
        .expect(400);
    });

    it('should return 400 when phone number is already taken', async () => {
      // First create a user
      await UserFactory.createUser({ phone_number: '+1111111111' });

      // Try to create another user with the same phone number
      await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...newUser,
          phone_number: '+1111111111'
        })
        .expect(400);
    });
  });

  describe('PUT /admin/users/:id', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await UserFactory.createUser({
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        user_name: 'testuser'
      });
    });

    it('should update a user when authenticated as admin', async () => {
      const updates = {
        email: 'updated@example.com',
        first_name: 'Updated',
        last_name: 'Name',
        user_name: 'updateduser',
        phone_number: faker.phone.number('+1##########')
      };

      const response = await request(app)
        .put(`/admin/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.user.email).toBe(updates.email);
      expect(response.body.user.first_name).toBe(updates.first_name);
      expect(response.body.user.last_name).toBe(updates.last_name);
      expect(response.body.user.user_name).toBe(updates.user_name);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .put(`/admin/users/${testUser.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ first_name: 'Updated' })
        .expect(404);
    });

    it('should return 404 when user not found', async () => {
      await request(app)
        .put('/admin/users/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ first_name: 'Updated', phone_number: faker.phone.number('+1##########') })
        .expect(404);
    });

    it('should return 400 when email is already taken', async () => {
      // First create another user with a different email
      const anotherUser = await UserFactory.createUser({
        email: 'another@example.com'
      });

      // Try to update testUser with anotherUser's email
      await request(app)
        .put(`/admin/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: anotherUser.email })
        .expect(400);
    });
  });

  describe('DELETE /admin/users/:id', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await UserFactory.createUser({
        email: 'test@example.com'
      });
    });

    it('should delete a user when authenticated as admin', async () => {
      await request(app)
        .delete(`/admin/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deletedUser = await User.query().findById(testUser.id);
      expect(deletedUser).toBeUndefined();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .delete(`/admin/users/${testUser.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when user not found', async () => {
      await request(app)
        .delete('/admin/users/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});