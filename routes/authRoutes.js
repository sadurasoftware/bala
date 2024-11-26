const express = require('express');
const authController = require('../controllers/authController');
const { validateRegister,validateLogin} = require('../validations/userValidation');
const authenticateToken=require('../middleware/authMiddleware')
const router = express.Router();
router.post('/register', validateRegister,authController.registerUser);
router.post('/login', validateLogin, authController.loginUser);
router.post('/logout', authenticateToken,authController.logoutUser);
module.exports = router;
