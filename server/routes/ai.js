const express = require('express');
const { chat } = require('../controllers/aiController');
// const { verifyAccessToken } = require('../utils/jwt');

const router = express.Router();

// Define the POST route /chat
// Authentication middleware temporarily removed for testing as requested
// router.post('/chat', verifyAccessToken, chat);
router.post('/chat', chat);

module.exports = router;
