const request = require('supertest');
const app = require('../../../src/app');
const UserFactory = require('../../factories/user.factory');
const RoomFactory = require('../../factories/room.factory');
const Room = require('../../../src/app/models/room');
const { generateTestToken } = require('../../helpers/auth');
const knex = require('../../../src/config/database');

let adminUser;
let adminToken;
let regularUser;
let regularToken;

beforeAll(async () => {
  adminUser = await UserFactory.createUser({ is_admin: true, jti: '123456' });
  adminToken = generateTestToken(adminUser);
  regularUser = await UserFactory.createUser({ is_admin: false, jti: '123456' });
  regularToken = generateTestToken(regularUser);
});

afterAll(() => {
  knex.destroy();
});

describe('Admin Room Routes', () => {
  describe('GET /admin/rooms', () => {
    it('should list all rooms when authenticated as admin', async () => {
      const room = await RoomFactory.createRoom({ host_id: adminUser.id });

      const response = await request(app)
        .get('/admin/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.rooms)).toBeTruthy();
      expect(response.body.rooms.some(r => r.id === room.id)).toBeTruthy();
    });

    it('should filter rooms by host_id', async () => {
      const room = await RoomFactory.createRoom({ host_id: adminUser.id });
      await RoomFactory.createRoom({ host_id: regularUser.id });

      const response = await request(app)
        .get(`/admin/rooms?host_id=${adminUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.rooms)).toBeTruthy();
      expect(response.body.rooms.every(r => r.host_id === adminUser.id)).toBeTruthy();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get('/admin/rooms')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/admin/rooms')
        .expect(401);
    });
  });

  describe('GET /admin/rooms/:id', () => {
    let room;

    beforeEach(async () => {
      room = await RoomFactory.createRoom({ host_id: adminUser.id });
    });

    it('should show room details when authenticated as admin', async () => {
      const response = await request(app)
        .get(`/admin/rooms/${room.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.room.id).toBe(room.id);
      expect(response.body.room.name).toBe(room.name);
      expect(response.body.room.host_id).toBe(adminUser.id);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get(`/admin/rooms/${room.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when room not found', async () => {
      await request(app)
        .get('/admin/rooms/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('POST /admin/rooms', () => {
    let newRoom;

    beforeEach(() => {
      newRoom = {
        name: 'Test Room',
        description: 'Test Description',
        image_url: 'https://example.com/image.jpg',
        location: 'Test Location',
        latitude: 42.123,
        longitude: -71.123,
        host_id: adminUser.id
      };
    });

    it('should create a room when authenticated as admin', async () => {
      const response = await request(app)
        .post('/admin/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newRoom)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.room.name).toBe(newRoom.name);
      expect(response.body.room.description).toBe(newRoom.description);
      expect(response.body.room.host_id).toBe(newRoom.host_id);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .post('/admin/rooms')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(newRoom)
        .expect(404);
    });

    it('should return 400 when required fields are missing', async () => {
      delete newRoom.name;
      delete newRoom.host_id;

      await request(app)
        .post('/admin/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newRoom)
        .expect(400);
    });
  });

  describe('PATCH /admin/rooms/:id', () => {
    let room;
    let updates;

    beforeEach(async () => {
      room = await RoomFactory.createRoom({ host_id: adminUser.id });
      updates = {
        name: 'Updated Room Name',
        description: 'Updated Description'
      };
    });

    it('should update a room when authenticated as admin', async () => {
      const response = await request(app)
        .patch(`/admin/rooms/${room.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.room.name).toBe(updates.name);
      expect(response.body.room.description).toBe(updates.description);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .patch(`/admin/rooms/${room.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send(updates)
        .expect(404);
    });

    it('should return 404 when room not found', async () => {
      await request(app)
        .patch('/admin/rooms/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect(404);
    });
  });

  describe('DELETE /admin/rooms/:id', () => {
    let room;

    beforeEach(async () => {
      room = await RoomFactory.createRoom({ host_id: adminUser.id });
    });

    it('should delete a room when authenticated as admin', async () => {
      await request(app)
        .delete(`/admin/rooms/${room.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deletedRoom = await Room.query().findById(room.id);
      expect(deletedRoom).toBeUndefined();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .delete(`/admin/rooms/${room.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when room not found', async () => {
      await request(app)
        .delete('/admin/rooms/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});