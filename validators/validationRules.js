const { body } = require('express-validator');
const User = require('../models/user');

const userValidationRules = {
    register: [
        body('Name', 'Username is required').trim().notEmpty(),
        body('Email', 'Invalid email').isEmail().normalizeEmail(),
        body('Password', 'Password must be at least 6 characters long').isLength({ min: 6 })
    ],
    login: [
        body('Email', 'Invalid email').isEmail().normalizeEmail(),
        body('Password', 'Password must be at least 6 characters long').isLength({ min: 6 })
    ],
    updateProfile: [
        body('Name', 'Name is required').trim().notEmpty(),
        body('Email', 'Invalid email').isEmail().normalizeEmail(),
        body('Password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
        body('Phone', 'Invalid phone number').isMobilePhone(),
        body('Role', 'Invalid role').isIn(['user', 'vendor']),
        body('ProfilePicture', 'Invalid profile picture URL').isURL(),
    ]
};

module.exports = userValidationRules;
