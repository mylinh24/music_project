import express from 'express';
import { register } from '../controllers/registerController.js';
import { verifyOTP } from '../controllers/verifyOTPController.js';
import { login } from '../controllers/loginController.js';
import { getProfile } from '../controllers/profileController.js';


const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.get('/me', getProfile);

export default router;