const { body } = require('express-validator');
const validateRegister = [
    body('username').isString().notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('role').isIn(['admin', 'editor', 'viewer']).withMessage('Invalid role'),
];
const validateLogin = [
    body('username').isString().notEmpty().withMessage('Username is required'),
    body('password').isString().notEmpty().withMessage('Password is required'),
];

module.exports = { validateRegister, validateLogin };
