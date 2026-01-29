const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// @route   GET /api/user/:id
// @desc    Get user profile
// @access  Private
router.get('/:id', auth, userController.getUserProfile);

// @route   PUT /api/user/update
// @desc    Update user profile
// @access  Private
router.put('/update', auth, userController.updateUserProfile);

module.exports = router;
