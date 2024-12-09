const jwt = require('jsonwebtoken');
require('dotenv').config(); 
const secretKey = process.env.JWT_SECRET; 
const blacklist = new Set(); 

const generateToken = (payload, expiresIn = '30m') => {
    return jwt.sign(payload, secretKey, { expiresIn });
};
const verifyToken = (token) => {
    return jwt.verify(token, secretKey);
};

const blacklistToken = (token) => {
    blacklist.add(token);
};
const isTokenBlacklisted = (token) => {
    return blacklist.has(token);
};

module.exports = { generateToken, verifyToken, blacklistToken, isTokenBlacklisted };
