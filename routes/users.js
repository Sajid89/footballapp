const express = require('express');
const router = express.Router();

const passport = require('passport');
require('../config/passport');

const rateLimit = require('../config/rateLimit');
const { body } = require('express-validator');
const userController  = require('../controllers/userController');
const userValidationRules = require('../validators/validationRules');

const authMiddleware = require('../utils/middlewares/authMiddleware');
const jwt = require('jsonwebtoken');


// Register route
router.post('/register', userValidationRules.register, rateLimit.createAccountLimiter, userController.registerUser);

// Login route using Passport's local strategy for authentication
router.post('/login', userValidationRules.login, rateLimit.loginRateLimiter, userController.login);

// Redirect to Google for authentication
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback route for Google to redirect to
router.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication
        res.redirect('/');
    }
);

// Middleware-applied route group
router.use(rateLimit.generalLimiter, authMiddleware.authenticateJwt);

// Route group with authentication middleware
// Dashboard route
router.get('/dashboard', userController.dashboard);
router.get('/profile', userController.profile);
router.post('/updateProfile', userValidationRules.updateProfile, userController.update);

module.exports = router;