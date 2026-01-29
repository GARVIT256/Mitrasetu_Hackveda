const express = require('express');
const router = express.Router();

// @route   GET /api/escalate
// @desc    Get helpline information
// @access  Public
router.get('/', (req, res) => {
  // TODO: Add hooks for Twilio/Exotel for IVR/telephony
  res.json({
    helpline: 'Tele-MANAS',
    number: '14416',
    info: 'This is a placeholder for escalation to a human agent.',
  });
});

module.exports = router;
