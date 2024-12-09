const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    password: {
        type: String,
        required: true,
    },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    verified: { type: Boolean, default: false },
});
module.exports = mongoose.model('User', UserSchema);
