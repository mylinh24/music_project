import express from 'express';
import { getArtistDetail } from '../controllers/artistController.js';

const router = express.Router();

// Lấy chi tiết nghệ sĩ và danh sách bài hát
router.get('/artist/:artistId', getArtistDetail);

export default router;