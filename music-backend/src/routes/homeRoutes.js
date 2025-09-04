// music-backend/src/routes/home.js
import express from 'express';
import { getLatestSongs, getPopularSongs, getTrendingSongs, getRecentlyPlayed, getTopArtists } from '../controllers/homeController.js';
import { getUserInfo } from '../controllers/homeController.js';

const router = express.Router();
router.get('/user-info', getUserInfo);
// Lấy bài hát mới nhất
router.get('/latest-songs', getLatestSongs);

// Lấy bài hát phổ biến
router.get('/popular-songs', getPopularSongs);

// Lấy bài hát xu hướng
router.get('/trending-songs', getTrendingSongs);

// Lấy bài hát nghe gần đây
router.get('/recently-played', getRecentlyPlayed);

// Lấy nghệ sĩ hàng đầu
router.get('/top-artists', getTopArtists);

export default router;