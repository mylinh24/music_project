// music-backend/src/routes/profile.js
import express from 'express';
import { getProfile, updateAvatar, updateProfile } from '../controllers/profileController.js';

const router = express.Router();

// Lấy thông tin profile
router.get('/me', getProfile);



// Cập nhật avatar
router.post('/update-avatar', updateAvatar);

// Cập nhật thông tin profile
router.post('/update-profile', updateProfile);

export default router;