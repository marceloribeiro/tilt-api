/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The user ID
 *         phone_number:
 *           type: string
 *           description: User's phone number
 *         email:
 *           type: string
 *           description: User's email address
 *         user_name:
 *           type: string
 *           description: User's username
 *         first_name:
 *           type: string
 *           description: User's first name
 *         last_name:
 *           type: string
 *           description: User's last name
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT authentication token
 *         user:
 *           $ref: '#/components/schemas/User'
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with phone number and confirmation code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone_number
 *               - confirmation_code
 *             properties:
 *               phone_number:
 *                 type: string
 *                 description: User's phone number
 *               confirmation_code:
 *                 type: string
 *                 description: Confirmation code sent to phone
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone_number
 *             properties:
 *               phone_number:
 *                 type: string
 *               email:
 *                 type: string
 *               user_name:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input or user already exists
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get authenticated user's profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /auth/me/update:
 *   patch:
 *     summary: Update authenticated user's profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               user_name:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /auth/logout:
 *   delete:
 *     summary: Logout current user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully logged out
 *       401:
 *         description: Not authenticated
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /auth/send_confirmation_code:
 *   post:
 *     summary: Send confirmation code to phone number
 *     description: Sends a 6-digit confirmation code via SMS to the provided phone number
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone_number
 *             properties:
 *               phone_number:
 *                 type: string
 *                 description: User's phone number (e.g., "+1234567890")
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: Confirmation code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Confirmation code sent successfully
 *       400:
 *         description: Invalid phone number or other error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid phone number format
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 */

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const userService = require('../services/user_service');
const UserPresenter = require('../presenters/user_presenter');
const { authenticateToken } = require('../middleware/auth');
const twilio = require('twilio');
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Login route
router.post('/login', async (req, res) => {
  try {
    const { phone_number, confirmation_code } = req.body;
    const { user, token, error } = await userService.loginFromPhone(phone_number, confirmation_code);

    if (error) {
      return res.status(401).json({ message: error });
    }

    res.json({
      token,
      user: UserPresenter.present(user)
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { user, error } = await userService.createIfNotExists(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    res.status(201).json({
      user: UserPresenter.present(user)
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get authenticated user route
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: UserPresenter.present(req.user)
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update current user route
router.patch('/me/update', authenticateToken, async (req, res) => {
  try {
    const { user, error } = await userService.updateUser(req.user.id, req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    res.json({
      user: UserPresenter.present(user)
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Logout route
router.delete('/logout', authenticateToken, async (req, res) => {
  try {
    const { error } = await userService.logout(req.user.id);

    if (error) {
      return res.status(400).json({ message: error });
    }

    res.json({ message: 'Successfully logged out' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Generate random 6-digit code
function generateConfirmationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send confirmation code route
router.post('/send_confirmation_code', async (req, res) => {
  try {
    const { phone_number } = req.body;

    // Validate phone number format
    if (!phone_number || !/^\+\d{10,15}$/.test(phone_number)) {
      return res.status(400).json({
        message: 'Invalid phone number format. Must include country code (e.g., +1234567890)'
      });
    }

    // Find or create user
    const user = await User.query().findOne({ phone_number });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate and save confirmation code
    const confirmationCode = generateConfirmationCode();
    await User.query()
      .patch({ confirmation_code: confirmationCode })
      .where({ id: user.id });

    // Send SMS via Twilio
    try {
      await twilioClient.messages.create({
        body: `Your Tilt confirmation code is: ${confirmationCode}`,
        to: phone_number,
        from: process.env.TWILIO_PHONE_NUMBER
      });

      res.json({ message: 'Confirmation code sent successfully' });
    } catch (twilioError) {
      console.error('Twilio error:', twilioError);
      res.status(400).json({
        message: 'Error sending confirmation code. Please try again later.'
      });
    }

  } catch (err) {
    console.error('Server error:', err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;