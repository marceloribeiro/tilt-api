/**
 * @swagger
 * /admin/contacts:
 *   get:
 *     summary: List all contacts
 *     tags: [Admin Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter contacts by user ID
 *     responses:
 *       200:
 *         description: List of all contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Contact'
 *                   - type: object
 *                     properties:
 *                       user:
 *                         $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     summary: Create a new contact
 *     tags: [Admin Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - user_id
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               user_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Contact created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Contact'
 *                 - type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *
 * /admin/contacts/{id}:
 *   get:
 *     summary: Get a specific contact
 *     tags: [Admin Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Contact details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Contact'
 *                 - type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: Contact not found
 *
 *   patch:
 *     summary: Update a contact
 *     tags: [Admin Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Contact updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Contact'
 *                 - type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: Contact not found
 *
 *   delete:
 *     summary: Delete a contact
 *     tags: [Admin Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Contact deleted successfully
 *       404:
 *         description: Contact not found
 */

const express = require('express');
const router = express.Router();
const Contact = require('../../models/contact');
const ContactPresenter = require('../../presenters/contact_presenter');

// List all contacts
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.query().withGraphFetched('user');
    res.json(await ContactPresenter.presentMany(contacts));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get single contact
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.query()
      .findById(req.params.id)
      .withGraphFetched('user');

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json(ContactPresenter.present(contact));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create contact
router.post('/', async (req, res) => {
  try {
    const newContact = await Contact.query().insert(req.body);
    const contact = await Contact.query()
      .findById(newContact.id)
      .withGraphFetched('user');

    res.status(201).json(ContactPresenter.present(contact));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update contact
router.patch('/:id', async (req, res) => {
  try {
    const contact = await Contact.query()
      .patchAndFetchById(req.params.id, req.body)
      .withGraphFetched('user');

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json(ContactPresenter.present(contact));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete contact
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Contact.query().deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;