const express = require('express');
const router = express.Router();
const screeningController = require('../controllers/screeningController');
const auth = require('../middleware/auth');

// @route   POST /api/screening/phq9
// @desc    Submit PHQ-9 screening
// @access  Private
router.post('/phq9', auth, screeningController.submitPhq9);

// @route   POST /api/screening/gad7
// @desc    Submit GAD-7 screening
// @access  Private
router.post('/gad7', auth, screeningController.submitGad7);

module.exports = router;
