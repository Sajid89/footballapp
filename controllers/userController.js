const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const { validationResult } = require('express-validator');
const User = require('../models/user');

// Register a new user
const registerUser = async (req, res) => {
    try {
        // Handle validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ Email: req.body.Email });
        if (existingUser) {
            return res.status(400).send('Email already in use');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.Password, 10);

        // Generate a unique UserID
        const userID = uuid.v4();

        // Create a new user
        const user = new User({
            UserID: userID,
            Name: req.body.Name,
            Email: req.body.Email,
            Password: hashedPassword,
        });

        // Save the user
        await user.save();

        res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(500).send('Error registering new user: ' + error.message);
    }
};

// Login a registered user
const login = async (req, res, next) => 
{
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    passport.authenticate('local', { session: false }, (err, user, info) => 
    {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(401).json({ message: info.message });
        }

        try {
            // User is authenticated, now generate a JWT token
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

            // Send the token to the client
            return res.json({ token });
        } catch (error) {
            return next(error);
        }

        console.log('8');
    })(req, res, next);
};

// User dashboard 
const dashboard = async (req, res) => {
    try {
        // The user should be attached to req.user by Passport
        const userId = req.user._id;

        // Fetch user info from MongoDB
        const userInfo = await User.findById(userId);

        if (!userInfo) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return the user info, excluding sensitive fields like password
        const { Password, ...userDetails } = userInfo.toObject();
        res.json(userDetails);

    } catch (error) {
        res.status(500).send({
            message: "Error occurred while fetching user data",
            error: error.message
        });
    }
};

// User profile route
const profile = async (req, res) => {
    try {
        // The user should be attached to req.user by Passport
        const userId = req.user._id;

        // Fetch user info from MongoDB
        const userInfo = await User.findById(userId);

        if (!userInfo) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return the user info, excluding sensitive fields like password
        const { Password, ...userDetails } = userInfo.toObject();
        res.json(userDetails);

    } catch (error) {
        res.status(500).send({
            message: "Error occurred while fetching user data",
            error: error.message
        });
    }
};

// Update user profile
const update = async (req, res) => {
    try {
        // Validate the request data
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Get the user ID from the authenticated user
        const userId = req.user._id;

        // Extract the updated profile data from the request body
        const {
            Name,
            Email,
            Password,
            Phone,
            Role,
            ProfilePicture,
        } = req.body;

        // Create an object with the updated profile data
        const updatedProfile = {
            Name,
            Email,
            Password,
            Phone,
            Role,
            ProfilePicture,
        };

        // Update the user's profile in the database
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: updatedProfile
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Respond with the updated user profile
        res.json(updatedUser);
    } catch (error) {
        // Handle any errors that occur during the update
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
    }
};

module.exports = {
    registerUser,
    login,
    dashboard,
    profile,
    update
};
