const express = require('express');
const authController = require('../controllers/authController');
const { validateUser, handleValidationErrors } = require('../validations/userValidation');
const { validateLogin, handleLoginValidationErrors } = require('../validations/loginValidation');
const authenticateToken=require('../middleware/authMiddleware')
const router = express.Router();
router.post('/register',validateUser,handleValidationErrors,authController.registerUser);
router.post('/login', validateLogin,handleLoginValidationErrors,authController.loginUser);
router.post('/logout', authenticateToken,authController.logoutUser);
module.exports = router;
