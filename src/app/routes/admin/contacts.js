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
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
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
 *               type: object
 *               properties:
 *                 contacts:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Contact'
 *                       - type: object
 *                         properties:
 *                           user:
 *                             $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of records
 *                     per_page:
 *                       type: integer
 *                       description: Number of items per page
 *                     current_page:
 *                       type: integer
 *                       description: Current page number
 *                     total_pages:
 *                       type: integer
 *                       description: Total number of pages
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
const { PAGE_SIZE } = require('../../../config/constants');


// List all contacts
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const per_page = parseInt(req.query.per_page) || PAGE_SIZE;

    const query = Contact.query().withGraphFetched('user');

    if (req.query.user_id) {
      query.where('user_id', req.query.user_id);
    }

    const result = await query.page(page - 1, per_page);

    res.json({
      contacts: await ContactPresenter.presentMany(result.results),
      pagination: {
        total: result.total,
        per_page: per_page,
        current_page: page,
        total_pages: Math.ceil(result.total / per_page)
      }
    });
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

    res.json({ contact: ContactPresenter.present(contact) });
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

    res.status(201).json({ contact: ContactPresenter.present(contact) });
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

    res.json({ contact: ContactPresenter.present(contact) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const contact = await Contact.query()
      .updateAndFetchById(req.params.id, req.body)
      .withGraphFetched('user');

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({ contact: ContactPresenter.present(contact) });
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