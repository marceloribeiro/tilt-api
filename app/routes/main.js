/**
 * @swagger
 * /:
 *   get:
 *     summary: Get API status and information
 *     tags: [Status]
 *     description: Returns basic information about the API including name, version, and current status
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: Tilt API
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 status:
 *                   type: string
 *                   example: running
 */
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    name: 'Tilt API',
    version: process.env.API_VERSION || '1.0.0',
    status: 'running'
  });
});

module.exports = router;
