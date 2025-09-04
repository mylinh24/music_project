import express from 'express';
import { addFavorite, removeFavorite, getFavorites } from '../controllers/favorites.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getFavorites);
router.post('/', authenticateToken, addFavorite);
router.delete('/', authenticateToken, removeFavorite);

export default router;
