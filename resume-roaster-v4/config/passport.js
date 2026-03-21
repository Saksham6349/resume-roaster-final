const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  (process.env.BASE_URL || 'http://localhost:3000') + '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (user) return done(null, user);

    user = await User.findOne({ email: profile.emails[0].value });
    if (user) {
      user.googleId = profile.id;
      user.avatar = profile.photos[0] ? profile.photos[0].value : null;
      user.isVerified = true;
      await user.save();
      return done(null, user);
    }

    user = await User.create({
      name:       profile.displayName,
      email:      profile.emails[0].value,
      googleId:   profile.id,
      avatar:     profile.photos[0] ? profile.photos[0].value : null,
      isVerified: true
    });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

module.exports = passport;
