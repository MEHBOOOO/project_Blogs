require('dotenv').config();
const passport = require('passport');
const user = require('../auth/user');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GithubStrategy = require('passport-github').Strategy;

passport.use(new LocalStrategy(
    {
        usernameField: 'email'
    },
    function(email, password, done) {
        user.findOne({ email }).then(user => {
            bcrypt.compare(password, user.password, function(err, result) {
                if (err) { return done(err); }
                if (result) { return done(null, user); }
            });
        }).catch(e => { return done(e); });
    }
));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ["openid", "email", "profile"]
  },
  async function(accessToken, refreshToken, profile, cb) {
    const User = await user.findOne({ googleId: profile.id });

    if (!User) {
      const newUser = await new user({
          googleId: profile.id,
          full_name: profile.displayName,
          email: profile.emails[0].value
      }).save();    
      return cb(null, newUser);
    } else {
      return cb(null, User);
    }
  }
));

passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
    scope: ["user", "email"]
  },
  async function(accessToken, refreshToken, profile, cb) {
    const User = await user.findOne({ githubId: profile.id });

    if (!User) {
      const newUser = await new user({
          githubId: profile.id,
          full_name: profile.displayName,
          email: profile.email,
      }).save();
      return cb(null, newUser);
    } else {
      return cb(null, User);
    }
  }
));

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    user.findById(id).then((user, err) => {
        done(err, user);
    });
});
