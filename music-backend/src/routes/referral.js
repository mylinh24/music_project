import express from 'express';
import { generateReferralCode, getReferralStats } from '../controllers/referralController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(authenticateToken);

router.post('/generate', generateReferralCode);
router.get('/stats', getReferralStats);

export default router;
