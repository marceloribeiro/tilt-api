const express = require('express');
const router = express.Router();
const Contact = require('../../models/contact');
const ContactPresenter = require('../../presenters/contact_presenter');

/**
 * @swagger
 * /user/contacts:
 *   get:
 *     summary: Get all contacts for the current user
 *     tags: [User Contacts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contact'
 *       401:
 *         description: Not authenticated
 *
 *   post:
 *     summary: Create a new contact
 *     tags: [User Contacts]
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
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone_number:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contact created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *
 * /user/contacts/{id}:
 *   get:
 *     summary: Get a specific contact
 *     tags: [User Contacts]
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
 *               $ref: '#/components/schemas/Contact'
 *       404:
 *         description: Contact not found
 *
 *   patch:
 *     summary: Update a contact
 *     tags: [User Contacts]
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
 *     responses:
 *       200:
 *         description: Contact updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       404:
 *         description: Contact not found
 *
 *   delete:
 *     summary: Delete a contact
 *     tags: [User Contacts]
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

// List all contacts for the logged-in user
router.get('/', async (req, res) => {
  try {
    const contacts = await req.user
      .$relatedQuery('contacts')
      .orderBy('name');

    res.json(ContactPresenter.presentMany(contacts));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get a single contact
router.get('/:id', async (req, res) => {
  try {
    const contact = await req.user
      .$relatedQuery('contacts')
      .findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json(ContactPresenter.present(contact));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create a new contact
router.post('/', async (req, res) => {
  try {
    // Add the user_id to the contact data
    const contactData = {
      ...req.body,
      user_id: req.user.id
    };

    const contact = await Contact.query().insert(contactData);
    res.status(201).json(ContactPresenter.present(contact));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a contact
router.patch('/:id', async (req, res) => {
  try {
    // First verify the contact belongs to the user
    const contact = await req.user
      .$relatedQuery('contacts')
      .findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Update the contact
    const updatedContact = await req.user
      .$relatedQuery('contacts')
      .patchAndFetchById(req.params.id, req.body);

    res.json(ContactPresenter.present(updatedContact));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a contact
router.delete('/:id', async (req, res) => {
  try {
    // First verify the contact belongs to the user
    const contact = await req.user
      .$relatedQuery('contacts')
      .findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Delete the contact
    await req.user
      .$relatedQuery('contacts')
      .deleteById(req.params.id);

    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
