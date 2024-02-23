const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    
    UserID: {
        type: String,
        required: true,
        unique: true
    },
    Name: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true,
        unique: true
    },
    Password: {
        type: String,
        required: true
    },
    VerificationToken: String,
    EmailVerified: {
        type: Boolean,
        default: false
    },
    IsSocial: {
        type: Boolean,
        default: false
    },
    Social: {
        google: {
            id: { type: String, default: null },
            token: { type: String, default: null }
        },
        facebook: {
            id: { type: String, default: null },
            token: { type: String, default: null }
        }
    },
    PasswordResetToken: String,
    PasswordResetExpires: Date,
    ProfilePicture: String,
    CreatedDate: {
        type: Date,
        default: Date.now
    },
    UpdatedDate: {
        type: Date,
        default: Date.now
    },
    LastLogin: Date
});

module.exports = mongoose.model('User', userSchema, 'Users');
