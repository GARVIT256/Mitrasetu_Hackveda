const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// @route   POST /api/chat
// @desc    Send a message to the chatbot
// @access  Private
router.post('/', auth, chatController.sendMessage);

module.exports = router;
