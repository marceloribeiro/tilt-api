const request = require('supertest');
const app = require('../../../src/app');
const UserFactory = require('../../factories/user.factory');
const ContactFactory = require('../../factories/contact.factory');
const Contact = require('../../../src/app/models/contact');
const { generateTestToken } = require('../../helpers/auth');
const knex = require('../../../src/config/database');

let server;
let user;
let token;

beforeAll(async () => {
  server = app.listen(4000);
  user = await UserFactory.createUser({ is_admin: false, jti: '123456' });
  token = generateTestToken(user);
});

afterAll(async () => {
  await new Promise((resolve) => {
    server.close(() => {
      resolve();
    });
  });
  await knex.destroy();
});

describe('User Contact Routes', () => {
  describe('GET /user/contacts', () => {
    it('should list all contacts when authenticated', async () => {
      const response = await request(app)
        .get('/user/contacts')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body.contacts)).toBeTruthy();
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/user/contacts')
        .expect(401);
    });
  });

  describe('GET /user/contacts/:id', () => {
    let contact;

    beforeEach(async () => {
      contact = await ContactFactory.createContact({ user_id: user.id });
    });

    it('should show contact details when authenticated', async () => {
      const response = await request(app)
        .get(`/user/contacts/${contact.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.contact.id).toBe(contact.id);
    });

    it('should return 404 when contact not found', async () => {
      await request(app)
        .get('/user/contacts/999999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('POST /user/contacts', () => {
    let newContact = {
      name: 'New Contact',
      email: 'new@example.com',
      phone_number: '+1234567890',
    };

    it('should create a contact when authenticated', async () => {
      const response = await request(app)
        .post('/user/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send(newContact)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.contact.name).toBe(newContact.name);
      expect(response.body.contact.email).toBe(newContact.email);
    });

    it('should return 400 when required fields are missing', async () => {
      await request(app)
        .post('/user/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);
    });
  });

  describe('PUT /user/contacts/:id', () => {
    let contact;

    beforeEach(async () => {
      contact = await ContactFactory.createContact({ user_id: user.id });
    });

    it('should update a contact when authenticated', async () => {
      let updates = {
        name: 'Updated Contact',
        email: 'updated@example.com',
        phone_number: '+1234567890'
      };

      const response = await request(app)
        .put(`/user/contacts/${contact.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.contact.name).toBe(updates.name);
      expect(response.body.contact.email).toBe(updates.email);
    });

    it('should return 404 when contact not found', async () => {
      await request(app)
        .put('/user/contacts/999999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Contact' })
        .expect(404);
    });
  });

  describe('DELETE /user/contacts/:id', () => {
    let contact;

    beforeEach(async () => {
      contact = await ContactFactory.createContact({ user_id: user.id });
    });

    it('should delete a contact when authenticated', async () => {
      await request(app)
        .delete(`/user/contacts/${contact.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      const deletedContact = await Contact.query().findById(contact.id);
      expect(deletedContact).toBeUndefined();
    });

    it('should return 404 when contact not found', async () => {
      await request(app)
        .delete('/user/contacts/999999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});