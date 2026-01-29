const Circle = require('../models/Circle');
const User = require('../models/User');

// DPDP Compliance: User-generated content in circles is handled with user consent.
// Data is stored securely and not shared without permission.

// Badge Tiers
const badgeTiers = {
    'Newbie': 0,
    'Contributor': 5,
    'Active Member': 15,
    'Pillar of Community': 50,
    'Legend': 100
};

const assignBadge = (score) => {
    let assignedBadge = 'Newbie';
    for (const badge in badgeTiers) {
        if (score >= badgeTiers[badge]) {
            assignedBadge = badge;
        }
    }
    return assignedBadge;
};


// Create Circle
exports.createCircle = async (req, res) => {
  const { name } = req.body;

  try {
    let circle = await Circle.findOne({ name });
    if (circle) {
      return res.status(400).json({ msg: 'Circle already exists' });
    }

    circle = new Circle({
      name,
      createdBy: req.user.id,
    });

    await circle.save();
    res.json(circle);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Post Message
exports.postMessage = async (req, res) => {
  const { message } = req.body;

  try {
    const circle = await Circle.findById(req.params.id);
    if (!circle) {
      return res.status(404).json({ msg: 'Circle not found' });
    }

    const newMessage = {
      userId: req.user.id,
      message,
    };

    circle.messages.unshift(newMessage);
    await circle.save();

    // Badge logic
    const user = await User.findById(req.user.id);
    user.engagementScore += 1;
    const newBadge = assignBadge(user.engagementScore);
    if (!user.badges.includes(newBadge)) {
        user.badges.push(newBadge);
    }
    
    await user.save();

    // Populate messages with user name to help frontend
    const populated = await Circle.findById(circle._id).populate('messages.userId', ['name']);
    // Convert createdAt to ISO strings so frontend can parse
    const out = populated.toObject();
    out.messages = out.messages.map(m => ({
      _id: m._id,
      userId: m.userId ? m.userId._id : null,
      userName: m.userId ? m.userId.name : 'Anonymous',
      message: m.message,
      createdAt: (m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString())
    }));

    res.json(out);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get Circle
exports.getCircle = async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.id).populate('messages.userId', ['name']);
    if (!circle) {
      return res.status(404).json({ msg: 'Circle not found' });
    }
    const out = circle.toObject();
    out.messages = out.messages.map(m => ({
      _id: m._id,
      userId: m.userId ? m.userId._id : null,
      userName: m.userId ? m.userId.name : 'Anonymous',
      message: m.message,
      createdAt: (m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString())
    }));
    res.json(out);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
