import express from 'express';
import { register } from '../controllers/registerController.js';
import { verifyOTP } from '../controllers/verifyOTPController.js';


const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);

export default router;