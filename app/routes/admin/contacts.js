const express = require('express');
const router = express.Router();
const Contact = require('../../models/contact');

// List all contacts
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.query().withGraphFetched('user');
    res.json(contacts);
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
    res.json(contact);
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
    res.status(201).json(contact);
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
    res.json(contact);
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