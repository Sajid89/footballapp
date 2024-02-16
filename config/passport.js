const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const User = require('../models/user');
const bcrypt = require('bcryptjs');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

// Local strategy
passport.use(new LocalStrategy(
    { usernameField: 'Email', passwordField: 'Password' },
    async (Email, Password, done) => {
        try {
            const user = await User.findOne({ Email: Email });
            if (!user) {
                return done(null, false, { message: 'No user found with this email.' });
            }

            const isMatch = await bcrypt.compare(Password, user.Password);
            if (!isMatch) {
                return done(null, false, { message: 'Password incorrect.' });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

  
// Google strategy
passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const existingUser = await User.findOne({ 'SocialMediaAuth.SocialMediaID': profile.id });

            if (existingUser) {
                return done(null, existingUser);
            }

            const newUser = new User({
                Name: profile.displayName,
                Email: profile.emails[0].value,
                SocialMediaAuth: {
                    Provider: 'google',
                    SocialMediaID: profile.id,
                    AuthToken: accessToken
                },
                CreatedDate: new Date(),
                LastLogin: new Date()
            });

            await newUser.save();
            return done(null, newUser);
        } catch (error) {
            return done(error);
        }
    }
));

// Jwt strategy (for protected routes)
passport.use(new JwtStrategy(options, function(jwt_payload, done) {
    User.findById(jwt_payload.id)
        .then(user => {
            if (user) {
                return done(null, user);
            }
            return done(null, false);
        })
        .catch(err => done(err, false));
}));
  
module.exports = passport;

  
