const express = require('express');
const { chat } = require('../controllers/aiController');
const { verifyAccessToken } = require('../utils/jwt');

const router = express.Router();

// All AI routes require authentication
router.post('/chat', verifyAccessToken, chat);

module.exports = router;