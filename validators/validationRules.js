const { body } = require('express-validator');
const User = require('../models/user');

const userValidationRules = {
    register: [
        body('Name', 'Name is required').trim().notEmpty(),
        body('Email', 'Invalid email').isEmail().normalizeEmail(),
        body('Password', 'Password must be at least 6 characters long').isLength({ min: 6 })
    ],
    login: [
        body('Email', 'Invalid email').isEmail().normalizeEmail(),
        body('Password', 'Password must be at least 6 characters long').isLength({ min: 6 })
    ],
    forgotPassword: [
        body('Email', 'Invalid email').isEmail().normalizeEmail()
    ],
    verifyToken: [
        body('VerificationCode', 'Invalid token').isString().notEmpty()
    ],
    resetPassword: [
        body('VerificationCode', 'Invalid token').isString().notEmpty(),
        body('Password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
        body('ConfirmPassword', 'Passwords do not match').custom((value, { req }) => value === req.body.Password)
    ],
    updateProfile: [
        body('Name', 'Name is required').trim().notEmpty(),
        body('Email', 'Invalid email').isEmail().normalizeEmail(),
        body('Password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
        body('ProfilePicture', 'Invalid profile picture URL').isURL(),
    ]
};

module.exports = userValidationRules;
