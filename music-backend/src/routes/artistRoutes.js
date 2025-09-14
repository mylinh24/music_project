import express from 'express';
import { getAllArtists, getArtistDetail } from '../controllers/artistController.js';

const router = express.Router();

// Lấy tất cả nghệ sĩ
router.get('/artists', getAllArtists);

// Lấy chi tiết nghệ sĩ và danh sách bài hát
router.get('/artist/:artistId', getArtistDetail);

export default router;
