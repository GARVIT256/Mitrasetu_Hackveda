const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// @desc    Register a new user


exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // DPDP Compliance: Ensure user data is handled securely.
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      anonymous: false,
    });

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
        anonymous: false,
      },
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};




// @desc    Authenticate user & get token
exports.login = async (req, res) => {
  try {
    const { auth0UserId, email, name } = req.body;
    console.log('Login request body:', req.body);


    // Auth0 profile flow
    if (auth0UserId || email && !password) {
      // find or create user by auth0UserId or email
      let user = await User.findOne({ auth0UserId }) || (email && await User.findOne({ email }));
      if (!user) {
        user = new User({ name: name || 'Auth0 User', email, auth0UserId, anonymous: false });
        await user.save();
      }
      const payload = { user: { id: user.id, anonymous: user.anonymous } };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      return res.json({ token });
    }

    // Traditional email/password flow
    if (!email || !password) return res.status(400).json({ msg: 'Missing credentials' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
    const payload = { user: { id: user.id, anonymous: user.anonymous } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });


    return res.json({ token });

  } catch (err) {
    console.error('Login error:', err, err.stack);
    return res.status(500).json({ msg: 'Server error', details: err.message });
  }
};


// Guest Login
exports.guestLogin = async (req, res) => {
  try {
    let user = new User({
        name: 'Guest',
        anonymous: true,
    });
    await user.save();

    const payload = {
      user: {
        id: user.id,
        anonymous: true,
      },
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
