import express from 'express';
import paymentController from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js'; // Import đúng tên

const router = express.Router();

router.post('/create-session', authenticateToken, paymentController.createSession); // Sử dụng authenticateToken
router.get('/simulate-success', paymentController.simulateSuccess);

export default router;