// src/routes/auth.js
import express from 'express';
import { register } from '../controllers/registerController.js';
import { verifyOTP, resendOTP } from '../controllers/verifyOTPController.js';
import { login } from '../controllers/loginController.js';
import { forgotPassword } from '../controllers/forgotPasswordController.js';
import { resetPassword } from '../controllers/resetPasswordController.js';
import { getProfile } from '../controllers/profileController.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP); // Thêm route mới
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', getProfile);

export default router;