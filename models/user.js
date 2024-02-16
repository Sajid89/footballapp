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
    Phone: String,
    Role: {
        type: String,
        enum: ['user', 'vendor', 'admin'],
        default: 'user'
    },
    SocialMediaAuth: {
        Provider: String,
        SocialMediaID: String,
        AuthToken: String
    },
    PasswordResetToken: String,
    PasswordResetExpires: Date,
    ProfilePicture: String,
    CreatedDate: {
        type: Date,
        default: Date.now
    },
    LastLogin: Date
});

module.exports = mongoose.model('User', userSchema, 'Users');
