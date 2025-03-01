const request = require('supertest');
const app = require('../../../src/app');
const UserFactory = require('../../factories/user.factory');
const RoomFactory = require('../../factories/room.factory');
const LivestreamFactory = require('../../factories/livestream.factory');
const Livestream = require('../../../src/app/models/livestream');
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
});

afterAll(() => {
  knex.destroy();
});

describe('Admin Livestream Routes', () => {
  describe('GET /admin/livestreams', () => {
    it('should list all livestreams when authenticated as admin', async () => {
      const livestream = await LivestreamFactory.createLivestream({
        room_id: room.id,
        host_id: adminUser.id
      });

      const response = await request(app)
        .get('/admin/livestreams')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.livestreams)).toBeTruthy();
      expect(response.body.livestreams.some(l => l.id === livestream.id)).toBeTruthy();
    });

    it('should filter livestreams by room_id', async () => {
      const livestream = await LivestreamFactory.createLivestream({
        room_id: room.id,
        host_id: adminUser.id
      });

      const response = await request(app)
        .get(`/admin/livestreams?room_id=${room.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.livestreams)).toBeTruthy();
      expect(response.body.livestreams.every(l => l.room_id === room.id)).toBeTruthy();
    });

    it('should filter livestreams by host_id', async () => {
      const livestream = await LivestreamFactory.createLivestream({
        room_id: room.id,
        host_id: adminUser.id
      });

      const response = await request(app)
        .get(`/admin/livestreams?host_id=${adminUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.livestreams)).toBeTruthy();
      expect(response.body.livestreams.every(l => l.host_id === adminUser.id)).toBeTruthy();
    });

    it('should filter livestreams by status', async () => {
      const livestream = await LivestreamFactory.createLivestream({
        room_id: room.id,
        host_id: adminUser.id,
        status: 'live'
      });

      const response = await request(app)
        .get('/admin/livestreams?status=live')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.livestreams)).toBeTruthy();
      expect(response.body.livestreams.every(l => l.status === 'live')).toBeTruthy();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get('/admin/livestreams')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/admin/livestreams')
        .expect(401);
    });
  });

  describe('GET /admin/livestreams/:id', () => {
    let livestream;

    beforeEach(async () => {
      livestream = await LivestreamFactory.createLivestream({
        room_id: room.id,
        host_id: adminUser.id
      });
    });

    it('should show livestream details when authenticated as admin', async () => {
      const response = await request(app)
        .get(`/admin/livestreams/${livestream.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.livestream.id).toBe(livestream.id);
      expect(response.body.livestream.name).toBe(livestream.name);
      expect(response.body.livestream.room_id).toBe(room.id);
      expect(response.body.livestream.host_id).toBe(adminUser.id);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get(`/admin/livestreams/${livestream.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when livestream not found', async () => {
      await request(app)
        .get('/admin/livestreams/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('POST /admin/livestreams', () => {
    let newLivestream;

    beforeEach(() => {
      const startDate = new Date();
      startDate.setHours(startDate.getHours() + 1);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 2);

      newLivestream = {
        room_id: room.id,
        host_id: adminUser.id,
        name: 'Test Livestream',
        description: 'Test Description',
        url: 'https://example.com/stream',
        thumbnail_url: 'https://example.com/thumbnail.jpg',
        status: 'scheduled',
        starts_at: startDate.toISOString(),
        ends_at: endDate.toISOString()
      };
    });

    it('should create a livestream when authenticated as admin', async () => {
      const response = await request(app)
        .post('/admin/livestreams')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newLivestream)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.livestream.name).toBe(newLivestream.name);
      expect(response.body.livestream.room_id).toBe(newLivestream.room_id);
      expect(response.body.livestream.host_id).toBe(newLivestream.host_id);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .post('/admin/livestreams')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(newLivestream)
        .expect(404);
    });

    it('should return 400 when required fields are missing', async () => {
      delete newLivestream.name;
      delete newLivestream.starts_at;

      await request(app)
        .post('/admin/livestreams')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newLivestream)
        .expect(400);
    });
  });

  describe('PATCH /admin/livestreams/:id', () => {
    let livestream;
    let updates;

    beforeEach(async () => {
      livestream = await LivestreamFactory.createLivestream({
        room_id: room.id,
        host_id: adminUser.id
      });

      updates = {
        name: 'Updated Livestream Name',
        description: 'Updated Description',
        status: 'live'
      };
    });

    it('should update a livestream when authenticated as admin', async () => {
      const response = await request(app)
        .patch(`/admin/livestreams/${livestream.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.livestream.name).toBe(updates.name);
      expect(response.body.livestream.description).toBe(updates.description);
      expect(response.body.livestream.status).toBe(updates.status);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .patch(`/admin/livestreams/${livestream.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send(updates)
        .expect(404);
    });

    it('should return 404 when livestream not found', async () => {
      await request(app)
        .patch('/admin/livestreams/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect(404);
    });
  });

  describe('DELETE /admin/livestreams/:id', () => {
    let livestream;

    beforeEach(async () => {
      livestream = await LivestreamFactory.createLivestream({
        room_id: room.id,
        host_id: adminUser.id
      });
    });

    it('should delete a livestream when authenticated as admin', async () => {
      await request(app)
        .delete(`/admin/livestreams/${livestream.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deletedLivestream = await Livestream.query().findById(livestream.id);
      expect(deletedLivestream).toBeUndefined();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .delete(`/admin/livestreams/${livestream.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when livestream not found', async () => {
      await request(app)
        .delete('/admin/livestreams/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});