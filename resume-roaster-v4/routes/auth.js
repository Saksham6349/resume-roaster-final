const router = require('express').Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/?error=google' }),
  (req, res) => {
    const token = signToken(req.user._id);
    const base = process.env.BASE_URL || 'http://localhost:5173';
    res.redirect(base + '?token=' + token + '&user=' + encodeURIComponent(JSON.stringify(req.user)));
  }
);

// Me
router.get('/me', require('../middleware/auth'), (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
