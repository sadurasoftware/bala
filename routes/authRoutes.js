const express = require('express');
const authController = require('../controllers/authController');
const { 
    validate, 
    registerValidation,
    loginValidation, 
    forgetPasswordValidation
  } = require('../validations/validator');
const authenticateToken=require('../middleware/authMiddleware')
const router = express.Router();

router.post('/register',validate(registerValidation),authController.registerUser);
router.post('/resend-verification-email', authController.resendVerificationEmail);
router.post('/login',validate(loginValidation),authController.loginUser);
router.post('/logout', authenticateToken,authController.logoutUser);
router.post('/forget-password',validate(forgetPasswordValidation), authController.forgetPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify-email',authController.verifyEmail)
module.exports = router;
