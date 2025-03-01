const request = require('supertest');
const app = require('../../../src/app');
const UserFactory = require('../../factories/user.factory');
const RoomFactory = require('../../factories/room.factory');
const MessageFactory = require('../../factories/message.factory');
const Message = require('../../../src/app/models/message');
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

describe('Admin Message Routes', () => {
  describe('GET /admin/messages', () => {
    it('should list all messages when authenticated as admin', async () => {
      const message = await MessageFactory.createMessage({
        room_id: room.id,
        author_id: regularUser.id
      });

      const response = await request(app)
        .get('/admin/messages')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.messages)).toBeTruthy();
      expect(response.body.messages.some(m => m.id === message.id)).toBeTruthy();
    });

    it('should filter messages by room_id', async () => {
      const message = await MessageFactory.createMessage({
        room_id: room.id,
        author_id: regularUser.id
      });

      const response = await request(app)
        .get(`/admin/messages?room_id=${room.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.messages)).toBeTruthy();
      expect(response.body.messages.every(m => m.room_id === room.id)).toBeTruthy();
    });

    it('should filter messages by author_id', async () => {
      const message = await MessageFactory.createMessage({
        room_id: room.id,
        author_id: regularUser.id
      });

      const response = await request(app)
        .get(`/admin/messages?author_id=${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.messages)).toBeTruthy();
      expect(response.body.messages.every(m => m.author_id === regularUser.id)).toBeTruthy();
    });

    it('should filter messages by type', async () => {
      const message = await MessageFactory.createMessage({
        room_id: room.id,
        author_id: regularUser.id,
        type: Message.MESSAGE_TYPES.TEXT
      });

      const response = await request(app)
        .get(`/admin/messages?type=${Message.MESSAGE_TYPES.TEXT}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.messages)).toBeTruthy();
      expect(response.body.messages.every(m => m.type === Message.MESSAGE_TYPES.TEXT)).toBeTruthy();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get('/admin/messages')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/admin/messages')
        .expect(401);
    });
  });

  describe('GET /admin/messages/:id', () => {
    let message;

    beforeEach(async () => {
      message = await MessageFactory.createMessage({
        room_id: room.id,
        author_id: regularUser.id
      });
    });

    it('should show message details when authenticated as admin', async () => {
      const response = await request(app)
        .get(`/admin/messages/${message.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.message.id).toBe(message.id);
      expect(response.body.message.room_id).toBe(room.id);
      expect(response.body.message.author_id).toBe(regularUser.id);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get(`/admin/messages/${message.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when message not found', async () => {
      await request(app)
        .get('/admin/messages/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('POST /admin/messages', () => {
    let newMessage;

    beforeEach(() => {
      newMessage = {
        room_id: room.id,
        author_id: regularUser.id,
        content: 'Test message',
        type: Message.MESSAGE_TYPES.TEXT
      };
    });

    it('should create a message when authenticated as admin', async () => {
      const response = await request(app)
        .post('/admin/messages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newMessage)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.message.room_id).toBe(newMessage.room_id);
      expect(response.body.message.author_id).toBe(newMessage.author_id);
      expect(response.body.message.content).toBe(newMessage.content);
      expect(response.body.message.type).toBe(newMessage.type);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .post('/admin/messages')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(newMessage)
        .expect(404);
    });

    it('should return 400 when required fields are missing', async () => {
      delete newMessage.content;
      delete newMessage.room_id;

      await request(app)
        .post('/admin/messages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newMessage)
        .expect(400);
    });
  });

  describe('PATCH /admin/messages/:id', () => {
    let message;
    let updates;

    beforeEach(async () => {
      message = await MessageFactory.createMessage({
        room_id: room.id,
        author_id: regularUser.id
      });

      updates = {
        content: 'Updated message content',
        type: Message.MESSAGE_TYPES.SYSTEM
      };
    });

    it('should update a message when authenticated as admin', async () => {
      const response = await request(app)
        .patch(`/admin/messages/${message.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.message.content).toBe(updates.content);
      expect(response.body.message.type).toBe(updates.type);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .patch(`/admin/messages/${message.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send(updates)
        .expect(404);
    });

    it('should return 404 when message not found', async () => {
      await request(app)
        .patch('/admin/messages/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect(404);
    });
  });

  describe('DELETE /admin/messages/:id', () => {
    let message;

    beforeEach(async () => {
      message = await MessageFactory.createMessage({
        room_id: room.id,
        author_id: regularUser.id
      });
    });

    it('should delete a message when authenticated as admin', async () => {
      await request(app)
        .delete(`/admin/messages/${message.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deletedMessage = await Message.query().findById(message.id);
      expect(deletedMessage).toBeUndefined();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .delete(`/admin/messages/${message.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when message not found', async () => {
      await request(app)
        .delete('/admin/messages/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});