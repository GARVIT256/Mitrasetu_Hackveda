const express = require('express');
const router = express.Router();
const circleController = require('../controllers/circleController');
const auth = require('../middleware/auth');

// @route   POST /api/circle/create
// @desc    Create a new circle
// @access  Private
router.post('/create', auth, circleController.createCircle);

// @route   POST /api/circle/:id/message
// @desc    Post a message in a circle
// @access  Private
router.post('/:id/message', auth, circleController.postMessage);

// @route   GET /api/circle/:id
// @desc    Get circle messages
// @access  Private
router.get('/:id', auth, circleController.getCircle);

module.exports = router;
