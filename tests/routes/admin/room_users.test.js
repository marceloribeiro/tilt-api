const request = require('supertest');
const app = require('../../../src/app');
const UserFactory = require('../../factories/user.factory');
const RoomFactory = require('../../factories/room.factory');
const RoomUserFactory = require('../../factories/room_user.factory');
const RoomUser = require('../../../src/app/models/room_user');
const { generateTestToken } = require('../../helpers/auth');
const knex = require('../../../src/config/database');

let adminUser;
let adminToken;
let regularUser;
let regularToken;
let room;

beforeAll(async () => {
  adminUser = await UserFactory.createUser({ is_admin: true, jti: '123456' });
  adminToken = generateTestToken(adminUser);
  regularUser = await UserFactory.createUser({ is_admin: false, jti: '123456' });
  regularToken = generateTestToken(regularUser);
  room = await RoomFactory.createRoom({ host_id: adminUser.id });
  await RoomUser.query().delete();
});

afterAll(() => {
  knex.destroy();
});

describe('Admin Room User Routes', () => {
  describe('GET /admin/room_users', () => {
    it('should list all room users when authenticated as admin', async () => {
      const roomUser = await RoomUserFactory.createRoomUser({
        room_id: room.id,
        user_id: regularUser.id
      });

      const response = await request(app)
        .get('/admin/room_users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.room_users)).toBeTruthy();
      expect(response.body.room_users.some(ru => ru.id === roomUser.id)).toBeTruthy();
    });

    it('should filter room users by room_id', async () => {
      const roomUser = await RoomUserFactory.createRoomUser({
        room_id: room.id,
        user_id: regularUser.id
      });

      const response = await request(app)
        .get(`/admin/room_users?room_id=${room.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.room_users)).toBeTruthy();
      expect(response.body.room_users.every(ru => ru.room_id === room.id)).toBeTruthy();
    });

    it('should filter room users by user_id', async () => {
      const roomUser = await RoomUserFactory.createRoomUser({
        room_id: room.id,
        user_id: regularUser.id
      });

      const response = await request(app)
        .get(`/admin/room_users?user_id=${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.room_users)).toBeTruthy();
      expect(response.body.room_users.every(ru => ru.user_id === regularUser.id)).toBeTruthy();
    });

    it('should filter room users by status', async () => {
      const roomUser = await RoomUserFactory.createRoomUser({
        room_id: room.id,
        user_id: regularUser.id,
        status: 'active'
      });

      const response = await request(app)
        .get('/admin/room_users?status=active')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.room_users)).toBeTruthy();
      expect(response.body.room_users.every(ru => ru.status === 'active')).toBeTruthy();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get('/admin/room_users')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/admin/room_users')
        .expect(401);
    });
  });

  describe('GET /admin/room_users/:id', () => {
    let roomUser;

    beforeEach(async () => {
      roomUser = await RoomUserFactory.createRoomUser({
        room_id: room.id,
        user_id: regularUser.id
      });
    });

    it('should show room user details when authenticated as admin', async () => {
      const response = await request(app)
        .get(`/admin/room_users/${roomUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.room_user.id).toBe(roomUser.id);
      expect(response.body.room_user.room_id).toBe(room.id);
      expect(response.body.room_user.user_id).toBe(regularUser.id);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get(`/admin/room_users/${roomUser.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when room user not found', async () => {
      await request(app)
        .get('/admin/room_users/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('POST /admin/room_users', () => {
    let newRoomUser;

    beforeEach(() => {
      newRoomUser = {
        room_id: room.id,
        user_id: regularUser.id,
        status: 'active',
        joined_at: new Date().toISOString()
      };
    });

    it('should create a room user when authenticated as admin', async () => {
      const response = await request(app)
        .post('/admin/room_users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newRoomUser)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.room_user.room_id).toBe(newRoomUser.room_id);
      expect(response.body.room_user.user_id).toBe(newRoomUser.user_id);
      expect(response.body.room_user.status).toBe(newRoomUser.status);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .post('/admin/room_users')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(newRoomUser)
        .expect(404);
    });

    it('should return 400 when required fields are missing', async () => {
      delete newRoomUser.status;
      delete newRoomUser.joined_at;

      await request(app)
        .post('/admin/room_users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newRoomUser)
        .expect(400);
    });
  });

  describe('PATCH /admin/room_users/:id', () => {
    let roomUser;
    let updates;

    beforeEach(async () => {
      roomUser = await RoomUserFactory.createRoomUser({
        room_id: room.id,
        user_id: regularUser.id
      });

      updates = {
        status: 'inactive',
        left_at: new Date().toISOString()
      };
    });

    it('should update a room user when authenticated as admin', async () => {
      const response = await request(app)
        .patch(`/admin/room_users/${roomUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.room_user.status).toBe(updates.status);
      expect(response.body.room_user.left_at).toBe(updates.left_at);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .patch(`/admin/room_users/${roomUser.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send(updates)
        .expect(404);
    });

    it('should return 404 when room user not found', async () => {
      await request(app)
        .patch('/admin/room_users/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect(404);
    });
  });

  describe('DELETE /admin/room_users/:id', () => {
    let roomUser;

    beforeEach(async () => {
      roomUser = await RoomUserFactory.createRoomUser({
        room_id: room.id,
        user_id: regularUser.id
      });
    });

    it('should delete a room user when authenticated as admin', async () => {
      await request(app)
        .delete(`/admin/room_users/${roomUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deletedRoomUser = await RoomUser.query().findById(roomUser.id);
      expect(deletedRoomUser).toBeUndefined();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .delete(`/admin/room_users/${roomUser.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when room user not found', async () => {
      await request(app)
        .delete('/admin/room_users/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});