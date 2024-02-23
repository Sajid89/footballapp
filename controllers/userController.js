const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');

const nodemailer = require('nodemailer');

const { validationResult } = require('express-validator');
const User = require('../models/user');
const { sendSuccessResponse, sendErrorResponse, sendValidationErrorResponse } = require('../helpers/response');

// Register a new user
const registerUser = async (req, res) => {
    try {
        // Handle validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendValidationErrorResponse(res, 'Validation errors', errors.array(), 400);
        }

        // Check if user already exists
        const existingUser = await User.findOne({ Email: req.body.Email });
        if (existingUser) {
            return sendErrorResponse(res, 'Email already in use', 400);
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

        // Generate a verification token
        const verificationToken = Math.floor(1000 + Math.random() * 9000);

        // Save the verification token in the user's document
        user.VerificationToken = verificationToken;
        await user.save();

        // Create a transporter
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            },
        });

        // Send an email with the verification token
        const mailOptions = {
            to: user.Email,
            from: process.env.MAIL_USER,
            subject: 'Veriy your email address',
            text: `Thank you for signing up for our service!\n\n
                Please use the following verification code to verify your account:\n\n
                ${verificationToken}\n\n
                If you did not request this, please ignore this email.\n`,
        };
    
        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                sendErrorResponse(res, `Failed to send the email. ${err.message}`, 500);
            }
    
            sendSuccessResponse(res, 'An email has been sent to your email address with further instructions.', [], 201);
        });
    } catch (error) {
        sendErrorResponse(res, `Error occurred while registering new user: ${error.message}`, 500);
    }
};

// Verify the verification token
const verifyEmail = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendValidationErrorResponse(res, 'Validation errors', errors.array(), 400);
        }

        const user = await User.findOne({ VerificationToken: req.body.VerificationCode });
        if (!user) {
            return sendErrorResponse(res, 'The verification token is invalid. Please request a new verification token.', 400);
        }

        user.EmailVerified = true;
        user.VerificationToken = null;
        await user.save();

        sendSuccessResponse(res, 'Email verified successfully', [], 201);
    } catch (error) {
        sendErrorResponse(res, `Error occurred while verifying email: ${error.message}`, 500);
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
    
    passport.authenticate('local', { session: false }, async (err, user, info) => 
    {
        if (err) {
            return next(err);
        }

        if (!user) {
            return sendErrorResponse(res, info.message, 401);
        }

        try {
            if (!user.EmailVerified) {
                return sendErrorResponse(res, 'Please verify your email before logging in.', 401);
            }

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

            const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });

            sendSuccessResponse(res, 'User logged in successfully', { accessToken: token, refreshToken: refreshToken }, 201);
        } catch (error) {
            sendErrorResponse(res, `Error occurred while logging in user: ${error.message}`, 500);
        }

    })(req, res, next);
};

// forgot password
const forgotPassword = async (req, res) => {
    try {
        // Handle validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendValidationErrorResponse(res, 'Validation errors', errors.array(), 400);
        }

        // Check if user already exists
        const user = await User.findOne({ Email: req.body.Email });
        if (!user) {
            return sendErrorResponse(res, 'No account with this email address exists.', 404);
        }

        // Check if a password reset token already exists and has not expired
        if (user.PasswordResetToken && new Date(user.PasswordResetExpires) > new Date()) {
            return sendErrorResponse(res, 'A password reset token has already been sent. Please check your email or wait until the token expires.', 400);
        }

        // Generate a verification code
        const verificationCode = Math.floor(1000 + Math.random() * 9000);

        // Save the verification code in the user's document
        user.PasswordResetToken = verificationCode;
        user.PasswordResetExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send an email with the verification code
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            },
        });

        const mailOptions = {
            to: user.Email,
            from: process.env.MAIL_USER,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                   Please use the following verification code to reset your password:\n\n
                   ${verificationCode}\n\n
                   If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };
    
        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                sendErrorResponse(res, `Failed to send the email. ${err.message}`, 500);
            }
    
            sendSuccessResponse(res, 'An email has been sent to your email address with further instructions.', [], 201);
        });

    } catch (error) {
        sendErrorResponse(res, `Error occurred while sending forgot password email: ${error.message}`, 500);
    }
};

// Verify the verification code
const verifyResetPasswordCode = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendValidationErrorResponse(res, 'Validation errors', errors.array(), 400);
        }

        const user = await User.findOne({ PasswordResetToken: req.body.VerificationCode });
        if (!user) {
            return sendErrorResponse(res, 'The verification code is invalid. Please request a new verification code.', 400);
        }

        if (new Date(user.PasswordResetExpires) < new Date()) {
            return sendErrorResponse(res, 'The verification code has expired. Please request a new verification code.', 400);
        }

        sendSuccessResponse(res, 'Verification code is valid', [], 201);
    } catch (error) {
        sendErrorResponse(res, `Error occurred while verifying verification code: ${error.message}`, 500);
    }
};

// Reset password
const resetPassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendValidationErrorResponse(res, 'Validation errors', errors.array(), 400);
        }

        const user = await User.findOne({ Email: req.body.Email });
        if (!user) {
            return sendErrorResponse(res, 'No account with this email address exists.', 404);
        }

        if (bcrypt.compareSync(req.body.Password, user.Password)) {
            return sendErrorResponse(res, 'New password cannot be the same as the current password.', 400);
        }

        const hashedPassword = await bcrypt.hash(req.body.Password, 10);

        user.Password = hashedPassword;
        user.PasswordResetToken = null;
        user.PasswordResetExpires = null;
        await user.save();

        sendSuccessResponse(res, 'Password reset successfully', [], 201);
    } catch (error) {
        sendErrorResponse(res, `Error occurred while resetting password: ${error.message}`, 500);
    }
};

// User dashboard 
const dashboard = async (req, res) => {
    try {
        // The user should be attached to req.user by Passport
        const userId = req.user._id;

        // Fetch user info from MongoDB
        const userInfo = await User.findById(userId);

        if (!userInfo) {
            return sendErrorResponse(res, 'User not found', 404);
        }

        // Return the user info, excluding sensitive fields like password
        const { Password, ...userDetails } = userInfo.toObject();
        sendSuccessResponse(res, 'User profile', [userDetails], 201);

    } catch (error) {
        sendErrorResponse(res, `Error occurred while fetching user data: ${error.message}`, 500);
    }
};

// User profile
const profile = async (req, res) => {
    try {
        // The user should be attached to req.user by Passport
        const userId = req.user._id;

        // Fetch user info from MongoDB
        const userInfo = await User.findById(userId);

        if (!userInfo) {
            return sendErrorResponse(res, 'User not found', 404);
        }

        // Return the user info, excluding sensitive fields like password
        const { Password, ...userDetails } = userInfo.toObject();
        sendSuccessResponse(res, 'User profile', [userDetails], 201);

    } catch (error) {
        sendErrorResponse(res, `Error occurred while fetching user data: ${error.message}`, 500);
    }
};

// Update user profile
const update = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendValidationErrorResponse(res, 'Validation errors', errors.array(), 400);
        }

        const userId = req.user._id;
        const hashedPassword = await bcrypt.hash(req.body.Password, 10);

        const {
            Name,
            Email,
            ProfilePicture,
        } = req.body;

        const updatedProfile = {
            Name,
            Email,
            Password: hashedPassword,
            ProfilePicture,
        };

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: updatedProfile
            },
            { new: true }
        );

        if (!updatedUser) {
            return sendErrorResponse(res, 'User not found', 404);
        }

        sendSuccessResponse(res, 'User profile updated successfully', [updatedUser], 201);
    } catch (error) {
        sendErrorResponse(res, `Error occurred while updating user profile: ${error.message}`, 500);
    }
};

module.exports = {
    registerUser,
    verifyEmail,
    login,
    forgotPassword,
    verifyResetPasswordCode,
    resetPassword,
    dashboard,
    profile,
    update
};
