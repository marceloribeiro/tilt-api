const request = require('supertest');
const app = require('../../../src/app');
const UserFactory = require('../../factories/user.factory');
const ContactFactory = require('../../factories/contact.factory');
const Contact = require('../../../src/app/models/contact');
const { generateTestToken } = require('../../helpers/auth');
const knex = require('../../../src/config/database');

let server;
let adminUser;
let adminToken;
let regularUser;
let regularToken;

beforeAll(async () => {
  server = app.listen(4004);
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

describe('Admin Contact Routes', () => {
  describe('GET /admin/contacts', () => {
    it('should list all contacts when authenticated as admin', async () => {
      const response = await request(app)
        .get('/admin/contacts')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.contacts)).toBeTruthy();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get('/admin/contacts')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/admin/contacts')
        .expect(401);
    });
  });

  describe('GET /admin/contacts/:id', () => {
    let contact;

    beforeEach(async () => {
      contact = await ContactFactory.createContact();
    });

    it('should show contact details when authenticated as admin', async () => {
      const response = await request(app)
        .get(`/admin/contacts/${contact.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.contact.id).toBe(contact.id);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .get(`/admin/contacts/${contact.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when contact not found', async () => {
      await request(app)
        .get('/admin/contacts/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('POST /admin/contacts', () => {
    let newContact = {
      name: 'New Contact',
      email: 'new@example.com',
      phone_number: '+1234567890',
    };

    it('should create a contact when authenticated as admin', async () => {
      newContact.user_id = adminUser.id;

      const response = await request(app)
        .post('/admin/contacts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newContact)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.contact.name).toBe(newContact.name);
      expect(response.body.contact.email).toBe(newContact.email);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      newContact.user_id = adminUser.id;

      await request(app)
        .post('/admin/contacts')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(newContact)
        .expect(404);
    });

    it('should return 400 when required fields are missing', async () => {
      newContact.user_id = adminUser.id;

      await request(app)
        .post('/admin/contacts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('PUT /admin/contacts/:id', () => {
    let contact;

    beforeEach(async () => {
      contact = await ContactFactory.createContact();
    });

    it('should update a contact when authenticated as admin', async () => {
      let updates = {
        name: 'Updated Contact',
        email: 'updated@example.com',
        phone_number: '+1234567890',
        user_id: adminUser.id
      };

      const response = await request(app)
        .put(`/admin/contacts/${contact.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.contact.name).toBe(updates.name);
      expect(response.body.contact.email).toBe(updates.email);
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .put(`/admin/contacts/${contact.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ name: 'Updated Contact', user_id: adminUser.id })
        .expect(404);
    });

    it('should return 404 when contact not found', async () => {
      await request(app)
        .put('/admin/contacts/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Contact', user_id: adminUser.id })
        .expect(404);
    });
  });

  describe('DELETE /admin/contacts/:id', () => {
    let contact;

    beforeEach(async () => {
      contact = await ContactFactory.createContact();
    });

    it('should delete a contact when authenticated as admin', async () => {
      await request(app)
        .delete(`/admin/contacts/${contact.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deletedContact = await Contact.query().findById(contact.id);
      expect(deletedContact).toBeUndefined();
    });

    it('should return 404 when authenticated as non-admin', async () => {
      await request(app)
        .delete(`/admin/contacts/${contact.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 404 when contact not found', async () => {
      await request(app)
        .delete('/admin/contacts/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});